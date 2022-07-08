pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import "./interface/IDarwin.sol";
import "./interface/IDarwinCommunity.sol";

import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "hardhat/console.sol";

error NoActiveFundCandidate();
error InvalidWeek(uint256 expected, uint256 provided);

contract DarwinCommunity is OwnableUpgradeable, IDarwinCommunity {
    using SafeMathUpgradeable for uint256;

    enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Queued,
        Expired,
        Executed
    }

    /// @notice Ballot receipt record for a voter
    struct Receipt {
        bool hasVoted;
        bool inSupport;
    }

    struct Proposal {
        uint256 id;
        address proposer;
        address[] targets;
        uint256[] values;
        string[] signatures;
        bytes[] calldatas;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool canceled;
        bool executed;
    }

    struct CommunityFundCandidate {
        uint256 id;
        address valueAddress;
        bool isActive;
    }

    modifier canAccess() {
        require(darwin.balanceOf(_msgSender()) >= minNotRequiredToAccess, "DC::canAccess: not enouch $DARWIN");
        require(
            darwin.getLastTokenReceivedTimestamp(msg.sender) + tokenReceivedCoolDownPeriod < block.timestamp,
            "DC::canAccess: can not access in cooldown period"
        );

        _;
    }

    modifier isProposalIdValid(uint256 _id) {
        require(_id > 0 && _id <= _lastProposalId, "DC::isProposalIdValid invalid id");
        _;
    }

    modifier onlyDarwinCommunity() {
        require(_msgSender() == address(this), "DC::onlyDarwinCommunity: only DarwinCommunity can access");

        _;
    }

    uint256 private constant MAX_UINT16 = ~uint16(0);
    uint256 private constant MAX_UINT8 = ~uint8(0);

    uint256 public constant MIN_NOT_REQUIRED_TO_ACCESS = 10000 * 10**9;

    mapping(uint256 => CommunityFundCandidate) private communityFundCandidates;
    uint256[] private activeCommunityFundCandidateIds;

    /// @notice week => address => % distribution()
    mapping(uint256 => mapping(address => Receipt)) private voteReceipts;

    /// @notice The official record of all proposals ever proposed
    mapping(uint256 => Proposal) private proposals;

    /// @notice Restricted proposal actions, only owner can create proposals with these signature
    mapping(uint256 => bool) private restrictedProposalActionSignature;

    uint256 public _lastCommunityFundCandidateId;
    uint256 public _lastProposalId;

    uint256 public firstWeekStartTimeStamp;
    uint256 public maxSlotsForCommunityFund;

    uint256 public minNotRequiredToAccess;
    uint256 public tokenReceivedCoolDownPeriod;
    uint256 public minReportRequiredToBlacklist;

    uint256 public proposalMaxOperations;
    uint256 public minVotingDelay;
    uint256 public minVotingPeriod;
    uint256 public maxVotingPeriod;
    uint256 public gracePeriod;

    IDarwin public darwin;

    function initialize(
        uint256 _firstWeekStartTimeStamp,
        uint256[] calldata restrictedProposalSignatures,
        string[] calldata fundProposals,
        address[] calldata fundAddress
    ) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __DarwinCommunity_init_unchained(
            _firstWeekStartTimeStamp,
            restrictedProposalSignatures,
            fundProposals,
            fundAddress
        );
    }

    function __DarwinCommunity_init_unchained(
        uint256 _firstWeekStartTimeStamp,
        uint256[] calldata restrictedProposalSignatures,
        string[] calldata fundProposals,
        address[] calldata fundAddress
    ) private initializer {
        require(
            fundProposals.length == fundAddress.length,
            "DC::__DarwinCommunity_init_unchained: invalid fund address length"
        );

        _lastProposalId = 0;
        _lastCommunityFundCandidateId = 0;
        firstWeekStartTimeStamp = _firstWeekStartTimeStamp;

        maxSlotsForCommunityFund = 5;

        minNotRequiredToAccess = 10000 * 10**9; //10k
        minReportRequiredToBlacklist = 20;

        proposalMaxOperations = 1;
        minVotingDelay = 24 hours;
        minVotingPeriod = 24 hours;
        maxVotingPeriod = 1 weeks;
        gracePeriod = 72 hours;

        tokenReceivedCoolDownPeriod = 15 days;

        for (uint256 i = 0; i < restrictedProposalSignatures.length; i++) {
            restrictedProposalActionSignature[restrictedProposalSignatures[i]] = true;
        }

        for (uint256 i = 0; i < fundProposals.length; i++) {
            uint256 id = _lastCommunityFundCandidateId + 1;

            communityFundCandidates[id] = CommunityFundCandidate({
                id: id,
                valueAddress: fundAddress[i],
                isActive: true
            });

            activeCommunityFundCandidateIds.push(id);
            _lastCommunityFundCandidateId = id;

            emit NewFundCandidate(id, fundAddress[i], fundProposals[i]);
        }
    }

    function setDarwinAddress(address account) public {
        if (account == address(0)) {
            require(msg.sender == owner(), "DC::setDarwinAddress: only owner initialize");
        } else {
            require(msg.sender == address(this), "DC::setDarwinAddress: private access only");
        }
        darwin = IDarwin(account);
    }

    function randomBoolean() private view returns (bool) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % MAX_UINT16 > MAX_UINT8;
    }

    function deactivateFundCandidate(uint256 _id) public onlyDarwinCommunity {
        require(communityFundCandidates[_id].isActive, "DC::deactivateFundCandidate: not active");

        communityFundCandidates[_id].isActive = false;

        for (uint256 i = 0; i < activeCommunityFundCandidateIds.length; i++) {
            if (activeCommunityFundCandidateIds[i] == _id) {
                activeCommunityFundCandidateIds[i] = activeCommunityFundCandidateIds[
                    activeCommunityFundCandidateIds.length - 1
                ];
                activeCommunityFundCandidateIds.pop();
                break;
            }
        }

        emit FundCandidateDeactivated(_id);
    }

    function newFundCandidate(address valueAddress, string calldata proposal) public onlyDarwinCommunity {
        uint256 id = _lastCommunityFundCandidateId + 1;

        communityFundCandidates[id] = CommunityFundCandidate({ id: id, valueAddress: valueAddress, isActive: true });

        activeCommunityFundCandidateIds.push(id);
        _lastCommunityFundCandidateId = id;

        emit NewFundCandidate(id, valueAddress, proposal);
    }

    function distributeCommunityFund() public {
        // TODO: distribute tokens and log
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        string[] memory signatures,
        bytes[] memory calldatas,
        string memory title,
        string memory description,
        string memory other,
        uint256 endTime
    ) public canAccess returns (uint256) {
        require(
            targets.length == values.length &&
                targets.length == signatures.length &&
                targets.length == calldatas.length,
            "DC::propose: proposal function information arity mismatch"
        );
        require(targets.length <= proposalMaxOperations, "DC::propose: too many actions");

        uint256 earliestEndTime = block.timestamp + minVotingDelay + minVotingPeriod;
        uint256 furthestEndDate = block.timestamp + minVotingDelay + maxVotingPeriod;

        require(endTime >= earliestEndTime, "DC::propose: too early end time");
        require(endTime <= furthestEndDate, "DC::propose: too late end time");

        uint256 startTime = block.timestamp + minVotingDelay;

        uint256 proposalId = _lastProposalId + 1;

        for (uint256 i = 0; i < signatures.length; i++) {
            uint256 signature = uint256(keccak256(bytes(signatures[i])));

            if (restrictedProposalActionSignature[signature]) {
                require(msg.sender == owner(), "DC::propose:Proposal signature restricted");
            }
        }

        Proposal memory newProposal = Proposal({
            id: proposalId,
            proposer: msg.sender,
            targets: targets,
            values: values,
            signatures: signatures,
            calldatas: calldatas,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            canceled: false,
            executed: false
        });

        _lastProposalId = proposalId;
        proposals[newProposal.id] = newProposal;

        emit ProposalCreated(newProposal.id, msg.sender, startTime, endTime, title, description, other);
        return newProposal.id;
    }

    /**
     * @notice Gets the state of a proposal
     * @param proposalId The id of the proposal
     * @return Proposal state
     */
    function state(uint256 proposalId) public view isProposalIdValid(proposalId) returns (ProposalState) {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.canceled) {
            return ProposalState.Canceled;
        } else if (block.timestamp <= proposal.startTime) {
            return ProposalState.Pending;
        } else if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        } else if (proposal.forVotes < proposal.againstVotes) {
            return ProposalState.Defeated;
        } else if (proposal.executed) {
            return ProposalState.Executed;
        } else if (block.timestamp >= proposal.endTime + gracePeriod) {
            return ProposalState.Expired;
        } else {
            return ProposalState.Queued;
        }
    }

    /**
     * @notice Cancels a proposal only if sender is the proposer, or proposer delegates dropped below proposal threshold
     * @param proposalId The id of the proposal to cancel
     */
    function cancel(uint256 proposalId) external isProposalIdValid(proposalId) {
        require(state(proposalId) != ProposalState.Executed, "DC::cancel: cannot cancel executed proposal");

        Proposal storage proposal = proposals[proposalId];

        require(_msgSender() == proposal.proposer || _msgSender() == owner(), "DC::cancel: cannot cancel proposal");

        proposal.canceled = true;

        emit ProposalCanceled(proposalId);
    }

    /**
     *  Cast a vote for a proposal
     * @param proposalId The id of the proposal to vote on
     * @param inSupport The support value for the vote. 0=against, 1=for, 2=abstain
     */
    function castVote(uint256 proposalId, bool inSupport) external canAccess {
        castVoteInternal(_msgSender(), proposalId, inSupport);
        emit VoteCast(_msgSender(), proposalId, inSupport);
    }

    /**
     * @notice Internal function that caries out voting logic
     * @param voter The voter that is casting their vote
     * @param proposalId The id of the proposal to vote on
     * @param inSupport The support value for the vote. 0=against, 1=for, 2=abstain
     */
    function castVoteInternal(
        address voter,
        uint256 proposalId,
        bool inSupport
    ) private canAccess {
        require(state(proposalId) == ProposalState.Active, "DC::castVoteInternal: voting is closed");

        Receipt storage receipt = voteReceipts[proposalId][voter];
        Proposal storage proposal = proposals[proposalId];

        require(receipt.hasVoted == false, "DC::castVoteInternal: voter already voted");

        receipt.hasVoted = true;
        receipt.inSupport = inSupport;

        if (inSupport) {
            proposal.forVotes += 1;
        } else {
            proposal.againstVotes += 1;
        }
    }

    /**
     * @notice Executes a queued proposal if eta has passed
     * @param proposalId The id of the proposal to execute
     */
    function execute(uint256 proposalId) external payable onlyOwner {
        require(
            state(proposalId) == ProposalState.Queued,
            "DC::execute: proposal can only be executed if it is queued"
        );

        Proposal storage proposal = proposals[proposalId];

        proposal.executed = true;

        if (
            proposal.forVotes != proposal.againstVotes ||
            (proposal.forVotes == proposal.againstVotes && randomBoolean())
        ) {
            for (uint256 i = 0; i < proposal.targets.length; i++) {
                executeTransaction(
                    proposal.id,
                    proposal.targets[i],
                    proposal.values[i],
                    proposal.signatures[i],
                    proposal.calldatas[i]
                );
            }
        }

        emit ProposalExecuted(proposalId);
    }

    function executeTransaction(
        uint256 id,
        address target,
        uint256 value,
        string memory signature,
        bytes memory data
    ) private {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data));

        bytes memory callData;

        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        (bool success, bytes memory returndata) = target.call{ value: value }(callData);

        require(success, extractRevertReason(returndata));

        emit ExecuteTransaction(id, txHash, target, value, signature, data);
    }

    function extractRevertReason(bytes memory revertData) internal pure returns (string memory reason) {
        uint256 length = revertData.length;
        if (length < 68) return "";
        uint256 t;
        assembly {
            revertData := add(revertData, 4)
            t := mload(revertData) // Save the content of the length slot
            mstore(revertData, sub(length, 4)) // Set proper length
        }
        reason = abi.decode(revertData, (string));
        assembly {
            mstore(revertData, t) // Restore the content of the length slot
        }
    }

    function setProposalMaxOperations(uint256 count) public onlyDarwinCommunity {
        proposalMaxOperations = count;
    }

    function setMinVotingDelay(uint256 delay) public onlyDarwinCommunity {
        minVotingDelay = delay;
    }

    function setMinVotingPeriod(uint256 value) public onlyDarwinCommunity {
        minVotingPeriod = value;
    }

    function setMaxVotingPeriod(uint256 value) public onlyDarwinCommunity {
        maxVotingPeriod = value;
    }

    function setGracePeriod(uint256 value) public onlyDarwinCommunity {
        gracePeriod = value;
    }

    function getActiveFundCandidates() public view returns (CommunityFundCandidate[] memory) {
        CommunityFundCandidate[] memory candidates = new CommunityFundCandidate[](
            activeCommunityFundCandidateIds.length
        );
        for (uint256 i = 0; i < activeCommunityFundCandidateIds.length; i++) {
            candidates[i] = communityFundCandidates[activeCommunityFundCandidateIds[i]];
        }

        return candidates;
    }

    function getActiveFundDandidateIds() public view returns (uint256[] memory) {
        return activeCommunityFundCandidateIds;
    }

    function getProposal(uint256 id) public view isProposalIdValid(id) returns (Proposal memory) {
        return proposals[id];
    }

    function getVoteReceipt(uint256 id) public view isProposalIdValid(id) returns (DarwinCommunity.Receipt memory) {
        return voteReceipts[id][_msgSender()];
    }

    function isProposalSignatureRestricted(string calldata signature) public view returns (bool) {
        return restrictedProposalActionSignature[uint256(keccak256(bytes(signature)))];
    }
}
