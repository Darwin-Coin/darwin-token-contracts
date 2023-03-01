// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IDarwinPresale} from "./interface/IDarwinPresale.sol";
import {IDarwinVester} from "./interface/IDarwinVester.sol";
import {IDarwin} from "./interface/IDarwin.sol";

/// @title Darwin Private Sale
contract DarwinPrivateSale is IDarwinPresale, ReentrancyGuard, Ownable {
    /// @notice Min BNB deposit per user
    uint256 public constant RAISE_MIN = .1 ether;
    /// @notice Max BNB deposit per user
    uint256 public constant RAISE_MAX = 200 ether;
    /// @notice Max number of BNB to be raised
    uint256 public constant HARDCAP = 500 ether;
    /// @notice How many DARWIN are sold for each BNB invested
    uint256 public constant DARWIN_PER_BNB = 10_000;
    /// @notice The % sent right away to the user. The left percentage is sent to the vester contract
    uint256 public constant PERC = 25;

    /// @notice The Darwin token
    IERC20 public darwin;
    /// @notice The Vester contract
    IDarwinVester public vester;
    /// @notice Timestamp of the presale start
    uint256 public presaleStart;
    /// @notice True if presale has been ended
    bool public privateSaleEnded;

    address public wallet1;

    enum Status {
        QUEUED,
        ACTIVE,
        SUCCESS
    }

    struct PresaleStatus {
        uint256 raisedAmount; // Total BNB raised
        uint256 soldAmount; // Total Darwin sold
        uint256 numBuyers; // Number of unique participants
    }

    /// @notice Mapping of total BNB deposited by user
    mapping(address => uint256) public userDeposits;

    PresaleStatus public status;

    bool private _isInitialized;

    modifier isInitialized() {
        if (!_isInitialized) {
            revert NotInitialized();
        }
        _;
    }

    /// @dev Initializes the darwin address and private sale start date
    /// @param _darwin The darwin token address
    /// @param _presaleStart The private sale start date
    function init(
        address _darwin,
        address _vester,
        uint256 _presaleStart
    ) external onlyOwner {
        if (_isInitialized) revert AlreadyInitialized();
        _isInitialized = true;
        if (_darwin == address(0) || _vester == address(0)) revert ZeroAddress();
        // solhint-disable-next-line not-rely-on-time
        if (_presaleStart < block.timestamp) revert InvalidStartDate();
        darwin = IERC20(_darwin);
        vester = IDarwinVester(_vester);
        IDarwin(address(darwin)).pause();
        _setWallet1(0x0bF1C4139A6168988Fe0d1384296e6df44B27aFd);
        presaleStart = _presaleStart;
    }

    /// @notice Deposits BNB into the presale
    /// @dev Emits a UserDeposit event
    /// @dev Emits a RewardsDispersed event
    function userDeposit() external payable nonReentrant isInitialized {

        if (presaleStatus() != Status.ACTIVE) {
            revert PresaleNotActive();
        }

        if (msg.value < RAISE_MIN || msg.value > RAISE_MAX) {
            revert InvalidDepositAmount();
        }

        if (userDeposits[msg.sender] == 0) {
            // new depositer
            ++status.numBuyers;
        }

        userDeposits[msg.sender] += msg.value;

        uint256 darwinAmount = msg.value * DARWIN_PER_BNB;

        status.raisedAmount += msg.value;
        status.soldAmount += darwinAmount;

        uint256 darwinAmountToUser = (darwinAmount * PERC) / 100;

        if (!darwin.transfer(msg.sender, darwinAmountToUser)) {
            revert TransferFailed();
        }
        darwin.approve(address(vester), darwinAmount - darwinAmountToUser);
        vester.deposit(msg.sender, darwinAmount - darwinAmountToUser);

        emit UserDeposit(msg.sender, msg.value, darwinAmount);
    }

    /// @notice Ends the private sale
    function endSale() external onlyOwner {
        // solhint-disable-next-line not-rely-on-time
        if (block.timestamp < presaleStart) {
            revert InvalidEndDate();
        }
        privateSaleEnded = true;
        emit PresaleEndDateSet(block.timestamp);
    }

    /// @notice Set address for Wallet1
    /// @param _wallet1 The new Wallet1 address
    function setWallet1(
        address _wallet1
    ) external onlyOwner {
        if (_wallet1 == address(0)) {
            revert ZeroAddress();
        }
        _setWallet1(_wallet1);
    }

    /// @dev Sends any unsold Darwin and raised BNB to Wallet 1
    function withdrawUnsoldDarwinAndRaisedBNB() external onlyOwner {
        if (wallet1 == address(0)) {
            revert ZeroAddress();
        }
        if (presaleStatus() != Status.SUCCESS) {
            revert PresaleNotEnded();
        }

        _transferBNB(wallet1, address(this).balance);

        // Send any unsold Darwin to Wallet 1
        if (darwin.balanceOf(address(this)) > 0) {
            darwin.transfer(wallet1, darwin.balanceOf(address(this)));
        }
    }

    function tokensDepositedAndOwned(
        address account
    ) external view returns (uint256, uint256) {
        uint256 deposited = userDeposits[account];
        uint256 owned = darwin.balanceOf(account);
        return (deposited, owned);
    }

    /// @notice Returns the number of BNB left to be raised on the current stage
    /// @return tokensLeft The number of BNB left to be raised on the current stage
    /// @dev The name of the function has been left unmodified to not cause mismatches with the frontend (we're using DarwinPresale typechain there)
    function baseTokensLeftToRaiseOnCurrentStage()
        public
        view
        returns (uint256 tokensLeft)
    {
        tokensLeft = HARDCAP - status.raisedAmount;
    }

    /// @notice Returns the current presale status
    /// @return The current presale status
    function presaleStatus() public view returns (Status) {
        // solhint-disable-next-line not-rely-on-time
        if (status.raisedAmount >= HARDCAP || privateSaleEnded) {
            return Status.SUCCESS; // Wonderful, presale has ended
        }

        // solhint-disable-next-line not-rely-on-time
        if (block.timestamp >= presaleStart && !privateSaleEnded) {
            return Status.ACTIVE; // ACTIVE - Deposits enabled, now in Presale
        }

        return Status.QUEUED; // QUEUED - Awaiting start block
    }

    function _transferBNB(address to, uint256 amount) internal {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function _setWallet1(address _wallet1) internal {
        wallet1 = _wallet1;
        emit Wallet1Set(_wallet1);
    }
}
