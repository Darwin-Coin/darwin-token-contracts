// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import {IDarwinPresale} from "./interface/IDarwinPresale.sol";
import {IPausable} from "./interface/IPausable.sol";

// TODO check if entire interface files need to be imported
import "./interface/IDarwinEcosystem.sol";

/// @title Darwin Presale
contract DarwinPresale is IDarwinPresale, ReentrancyGuard, Ownable {
    /// @notice Min BNB deposit per user
    uint256 public constant RAISE_MIN = .1 ether;
    /// @notice Max BNB deposit per user
    uint256 public constant RAISE_MAX = 4_000 ether;
    /// @notice Max number of BNB to be raised
    uint256 public constant HARDCAP = 140_000 ether;
    /// @notice Amount of Darwin to be sent to the LP
    uint256 public constant LP_AMOUNT = 1e27; // 1,000,000,000 Darwin
    /// @notice Amount of Finch to be sent to the LP
    uint256 public constant FINCH_LP_AMOUNT = 5e25; // 50,000,000 Finch
    /// @notice % of raised BNB to be sent to marketing wallet
    uint256 public constant MARKETING_PERCENTAGE = 30;
    /// @notice % of raised BNB to be added to marketing percentage at the end of the presale
    uint256 public constant MARKETING_ADDITIONAL_PERCENTAGE = 5;
    /// @notice % of raised BNB to be sent to team wallet
    uint256 public constant TEAM_PERCENTAGE = 20;
    /// @notice Number of Finch per BNB deposited (1,000 Finch per 1 BNB)
    uint256 public constant FINCH_PER_BNB = 1_000;

    /// @notice The Darwin token
    IERC20 public darwin;
    /// @notice The Finch token
    IERC20 public finch;
    /// @notice Timestamp of the presale start (2021-10-01 00:00:00 UTC)
    uint256 public presaleStart; // 2021-10-01 00:00:00 UTC

    /// @notice Timestamp of the presale end
    uint256 public presaleEnd;

    uint256 public marketingWithdrawn;
    address public marketingWallet;
    address public teamWallet;

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
    mapping(address => uint256) public darwinTransferred;
    mapping(address => uint256) public finchTransferred;

    PresaleStatus public status;

    IDarwinEcosystem private darwinEcosystem;
    IUniswapV2Router02 private router;
    bool private _isInitialized;

    modifier isInitialized() {
        if (!_isInitialized) {
            revert NotInitialized();
        }
        _;
    }

    /// @dev Initializes the darwin address and presale start date
    /// @param _darwin The darwin token address
    /// @param _finch The finch token address
    /// @param _presaleStart The presale start date
    /// @param _presaleEnd The presale end date
    function init(
        address _darwin,
        address _finch,
        uint256 _presaleStart,
        uint256 _presaleEnd
    ) external onlyOwner {
        if (_isInitialized) revert AlreadyInitialized();
        _isInitialized = true;
        if (_darwin == address(0) || _finch == address(0)) revert ZeroAddress();
        // solhint-disable-next-line not-rely-on-time
        if (_presaleStart < block.timestamp) revert InvalidStartDate();
        if (_presaleEnd < _presaleStart) revert InvalidEndDate();
        darwin = IERC20(_darwin);
        finch = IERC20(_finch);
        presaleStart = _presaleStart;
        presaleEnd = _presaleEnd;
    }

    /// @notice Initialize the presale parameters
    /// @param _router The AMM router address
    /// @param _darwinEcosystem The Darwin ecosystem address
    /// @param _marketingWallet The marketing wallet
    /// @param _teamWallet The team wallet
    function initPresale(
        address _router,
        address _darwinEcosystem,
        address _marketingWallet,
        address _teamWallet
    ) external onlyOwner {
        if (
            _router == address(0) ||
            _darwinEcosystem == address(0) ||
            _marketingWallet == address(0) ||
            _teamWallet == address(0)
        ) {
            revert ZeroAddress();
        }

        _setDarwinEcosystem(_darwinEcosystem);
        _setRouter(_router);
        _setMarketingWallet(_marketingWallet);
        _setTeamWallet(_teamWallet);

        address darwinPairAddress = IUniswapV2Factory(router.factory()).getPair(
            address(darwin),
            router.WETH()
        );

        address finchPairAddress = IUniswapV2Factory(router.factory()).getPair(
            address(finch),
            router.WETH()
        );

        // ensure pairs exist
        if (darwinPairAddress == address(0) || finchPairAddress == address(0)) {
            revert PairNotFound();
        }
    }

    /// @notice Deposits BNB into the presale
    /// @dev Emits a UserDeposit event
    /// @dev Emits a RewardsDispersed event
    function userDeposit() external payable nonReentrant isInitialized {

        if (presaleStatus() != Status.ACTIVE) {
            revert PresaleNotActive();
        }

        uint256 base = userDeposits[msg.sender];

        if (msg.value < RAISE_MIN || base + msg.value > RAISE_MAX) {
            revert InvalidDepositAmount();
        }

        if (base == 0) {
            // new depositer
            ++status.numBuyers;
        }

        userDeposits[msg.sender] += msg.value;
        status.raisedAmount += msg.value;

        uint256 darwinAmount = calculateDarwinAmount(msg.value);
        darwinTransferred[msg.sender] += darwinAmount;
        status.soldAmount += darwinAmount;

        uint256 finchAmount = calculateFinchAmount(msg.value);
        finchTransferred[msg.sender] += finchAmount;

        uint256 marketingAmount = (msg.value * MARKETING_PERCENTAGE) / 100;
        _transferBNB(marketingWallet, marketingAmount);

        if (!darwin.transfer(msg.sender, darwinAmount)) {
            revert TransferFailed();
        }
        if (!finch.transfer(msg.sender, finchAmount)) {
            revert TransferFailed();
        }

        darwinEcosystem.setAddressPresaleTier(msg.sender, _getTier(base));

        emit UserDeposit(msg.sender, msg.value, darwinAmount, finchAmount);
    }

    /// @notice Set the address of the Darwin Ecosystem
    /// @dev Emits a DarwinEcosystemSet event
    /// @param _darwinEcosystem The new Darwin Ecosystem address
    function setDarwinEcosystem(address _darwinEcosystem) external onlyOwner {
        _setDarwinEcosystem(_darwinEcosystem);
    }

    /// @notice Set the presale end date to `_endDate`
    /// @param _endDate The new presale end date
    function setPresaleEndDate(uint256 _endDate) external onlyOwner {
        // solhint-disable-next-line not-rely-on-time
        if (_endDate < block.timestamp || _endDate < presaleStart) {
            revert InvalidEndDate();
        }
        presaleEnd = _endDate;
        emit PresaleEndDateSet(_endDate);
    }

    /// @notice Set the marketing and team wallets
    /// @param _marketingWallet The new marketing wallet address
    /// @param _teamWallet The new team wallet address
    function setWallets(
        address _marketingWallet,
        address _teamWallet
    ) external onlyOwner {
        if (_marketingWallet == address(0) || _teamWallet == address(0)) {
            revert ZeroAddress();
        }
        _setMarketingWallet(_marketingWallet);
        _setTeamWallet(_teamWallet);
    }

    /// @notice Allocates presale funds to LP, team, and marketing
    /// @dev The unsold darwin tokens are sent back to the owner
    function provideLpAndWithdrawTokens() external onlyOwner {
        if (marketingWallet == address(0) || teamWallet == address(0)) {
            revert ZeroAddress();
        }
        if (presaleStatus() != Status.SUCCESS) {
            revert PresaleNotEnded();
        }

        uint256 balance = address(this).balance;
        
        uint256 team = (status.raisedAmount * TEAM_PERCENTAGE) / 100;
        uint256 marketing = (status.raisedAmount * MARKETING_ADDITIONAL_PERCENTAGE) / 100;

        uint256 lp = balance - team - marketing; // 45%

        uint256 finchLp = lp / 10; // 10% of lp

        if (finchLp > 1 ether) {
            finchLp = 1 ether;
        }
        
        lp -= finchLp;

        // calculate the ratio of funds raised to the hardcap and multiply by the darwin lp amount to get the number of darwin needed to deposit
        uint darwinToDeposit = (HARDCAP * LP_AMOUNT) / status.raisedAmount;

        _addLiquidity(address(darwin), darwinToDeposit, lp);
        _addLiquidity(address(finch), FINCH_LP_AMOUNT, finchLp);
        
        _transferBNB(teamWallet, team);
        _transferBNB(marketingWallet, marketing);

        if (!darwin.transfer(owner(), darwin.balanceOf(address(this)))) {
            revert TransferFailed();
        }

        if (!finch.transfer(owner(), darwin.balanceOf(address(this)))) {
            revert TransferFailed();
        }

        emit LpProvided(lp, darwinToDeposit);
    }

    /// @notice Returns the current stage of the presale
    /// @return stage The current stage of the presale
    function getCurrentStage() external view returns (uint256 stage) {
        stage = _getCurrentStage();
    }

    function tokensDepositedAndOwned(
        address account
    ) external view returns (uint256, uint256) {
        uint256 deposited = userDeposits[account];
        uint256 owned = darwinTransferred[account];
        return (deposited, owned);
    }

    /// @notice Returns the number of tokens left to raise on the current stage
    /// @return tokensLeft The number of tokens left to raise on the current stage
    function baseTokensLeftToRaiseOnCurrentStage()
        public
        view
        returns (uint256 tokensLeft)
    {
        (, , uint256 stageCap) = _getStageDetails(_getCurrentStage());
        tokensLeft = stageCap - status.raisedAmount;
    }

    /// @notice Returns the current presale status
    /// @return The current presale status
    function presaleStatus() public view returns (Status) {
        // solhint-disable-next-line not-rely-on-time
        if (status.raisedAmount >= HARDCAP || block.timestamp > presaleEnd) {
            return Status.SUCCESS; // Wonderful, presale has ended
        }

        // solhint-disable-next-line not-rely-on-time
        if (block.timestamp >= presaleStart && block.timestamp <= presaleEnd) {
            return Status.ACTIVE; // ACTIVE - Deposits enabled, now in Presale
        }

        return Status.QUEUED; // QUEUED - Awaiting start block
    }

    /// @notice Calculates the number of tokens that can be bought with `bnbAmount` BNB
    /// @param bnbAmount The number of BNB to be deposited
    /// @return The number of Darwin to be purchased with `bnbAmount` BNB
    function calculateDarwinAmount(
        uint256 bnbAmount
    ) public view returns (uint256) {
        if (bnbAmount > HARDCAP - status.raisedAmount) {
            revert AmountExceedsHardcap();
        }
        uint256 tokensLeft = baseTokensLeftToRaiseOnCurrentStage();
        if (bnbAmount < tokensLeft) {
            return (bnbAmount * _getCurrentRate());
        } else {
            uint256 stage = _getCurrentStage();
            uint256 darwinAmount;
            uint256 rate;
            uint256 stageAmount;
            uint256 stageCap;
            while (bnbAmount > 0) {
                (rate, stageAmount, stageCap) = _getStageDetails(stage);
                if (bnbAmount <= stageAmount) {
                    darwinAmount += (bnbAmount * rate);
                    bnbAmount = 0;
                    break;
                } else {
                    darwinAmount += (stageAmount * rate);
                    bnbAmount -= stageAmount;
                }
                ++stage;
            }
            return darwinAmount;
        }
    }

    /// @notice Calculates the number of Finch that can be bought with `bnbAmount` BNB
    /// @param bnbAmount The number of BNB to be deposited
    /// @return The number of Finch to be purchased with `bnbAmount` BNB
    function calculateFinchAmount(
        uint256 bnbAmount
    ) public pure returns (uint256) {
        return (bnbAmount * FINCH_PER_BNB);
    }

    function _transferBNB(address to, uint256 amount) internal {
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    function _setRouter(address _router) internal {
        router = IUniswapV2Router02(_router);
        emit RouterSet(_router);
    }

    function _setDarwinEcosystem(address _darwinEcosystem) internal {
        darwinEcosystem = IDarwinEcosystem(_darwinEcosystem);
        emit DarwinEcosystemSet(_darwinEcosystem);
    }

    function _setMarketingWallet(address _marketingWallet) internal {
        marketingWallet = _marketingWallet;
        emit MarketingWalletSet(_marketingWallet);
    }

    function _setTeamWallet(address _teamWallet) internal {
        teamWallet = _teamWallet;
        emit TeamWalletSet(_teamWallet);
    }

    function _addLiquidity(
        address tokenAddress,
        uint256 tokenAmount,
        uint256 bnbAmount
    ) private {
        // approve token transfer to cover all possible scenarios
        if (!IERC20(tokenAddress).approve(address(router), tokenAmount)) {
            revert ApproveFailed();
        }

        // add the liquidity
        router.addLiquidityETH{value: bnbAmount}(
            tokenAddress, // token
            tokenAmount, // amountTokenDesired
            0, // amountTokenMin (slippage is unavoidable)
            0, // amountETHMin (slippage is unavoidable)
            owner(), // to (Recipient of the liquidity tokens.)
            block.timestamp // deadline
        );
    }

    function _getCurrentRate() private view returns (uint256 rate) {
        (rate, , ) = _getStageDetails(_getCurrentStage());
    }

    function _getCurrentStage() private view returns (uint256) {
        if (status.raisedAmount > 117_164 ether) {
            return 8;
        } else if (status.raisedAmount > 96_690 ether) {
            return 7;
        } else if (status.raisedAmount > 78_135 ether) {
            return 6;
        } else if (status.raisedAmount > 61_170 ether) {
            return 5;
        } else if (status.raisedAmount > 45_545 ether) {
            return 4;
        } else if (status.raisedAmount > 31_063 ether) {
            return 3;
        } else if (status.raisedAmount > 17_569 ether) {
            return 2;
        } else if (status.raisedAmount > 5_000 ether) {
            return 1;
        } else {
            return 0;
        }
    }

    function _getStageDetails(
        uint256 stage
    ) private pure returns (uint256, uint256, uint256) {
        assert(stage <= 8);
        if (stage == 0) {
            return (50_000, 5_000 ether, 5_000 ether);
        } else if (stage == 1) {
            return (47_000, 12_569 ether, 17_569 ether);
        } else if (stage == 2) {
            return (44_000, 13_494 ether, 31_063 ether);
        } else if (stage == 3) {
            return (41_000, 14_482 ether, 45_545 ether);
        } else if (stage == 4) {
            return (38_000, 15_625 ether, 61_170 ether);
        } else if (stage == 5) {
            return (35_000, 16_925 ether, 78_135 ether);
        } else if (stage == 6) {
            return (32_000, 18_555 ether, 96_690 ether);
        } else if (stage == 7) {
            return (29_000, 20_474 ether, 117_164 ether);
        } else {
            return (26_131, 22_745 ether, 140_000 ether);
        }
    }

    function _getTier(uint256 base) private pure returns (PresaleTier) {
        if (base >= 400 ether) {
            return PresaleTier.TIER_6;
        } else if (base >= 50 ether) {
            return PresaleTier.TIER_5;
        } else if (base >= 10 ether) {
            return PresaleTier.TIER_4;
        } else if (base >= 5 ether) {
            return PresaleTier.TIER_3;
        } else if (base >= 2.5 ether) {
            return PresaleTier.TIER_2;
        } else if (base >= 1 ether) {
            return PresaleTier.TIER_1;
        } else {
            return PresaleTier.NONE;
        }
    }
}
