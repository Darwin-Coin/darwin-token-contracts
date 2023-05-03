// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import {IDarwinPresale} from "./interface/IDarwinPresale.sol";
import {IDarwin} from "./interface/IDarwin.sol";

/// @title Darwin Presale
contract DarwinPresale is IDarwinPresale, ReentrancyGuard, Ownable {
    /// @notice Min ETH deposit per user
    uint256 public constant RAISE_MIN = .1 ether; //TODO: MODIFY
    /// @notice Max ETH deposit per user
    uint256 public constant RAISE_MAX = 4_000 ether; //TODO: MODIFY
    /// @notice Max number of ETH to be raised
    uint256 public constant HARDCAP = 396 ether;

    /// @notice The Darwin token
    IERC20 public darwin;
    /// @notice Timestamp of the presale start
    uint256 public presaleStart;
    /// @notice Timestamp of the presale end
    uint256 public presaleEnd;
    /// @notice Wallet 1
    address public wallet1;

    /// @notice Mapping of total ETH deposited by user
    mapping(address => uint256) public userDeposits;
    /// @notice Status of the presale
    PresaleStatus public status;

    /// @notice True if presale has been initialized
    bool private _isInitialized;

    modifier isInitialized() {
        if (!_isInitialized) {
            revert NotInitialized();
        }
        _;
    }

    /// @dev Initializes the Darwin Protocol address
    /// @param _darwin The Darwin Protocol address
    function init(
        address _darwin
    ) external onlyOwner {
        if (_isInitialized) revert AlreadyInitialized();
        if (_darwin == address(0)) revert ZeroAddress();

        darwin = IERC20(_darwin);

        _setWallet1(0x0bF1C4139A6168988Fe0d1384296e6df44B27aFd);
    }

    /// @dev Starts the presale, and sets presale end date to 90 days after block.timestamp
    function startPresale() external onlyOwner {
        if (_isInitialized) revert AlreadyInitialized();
        _isInitialized = true;

        presaleStart = block.timestamp;
        presaleEnd = presaleStart + (90 days);
    }

    /// @notice Deposits ETH into the presale
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

        uint256 darwinAmount = calculateDarwinAmount(msg.value);

        status.raisedAmount += msg.value;
        status.soldAmount += darwinAmount;

        if (!darwin.transfer(msg.sender, darwinAmount)) {
            revert TransferFailed();
        }

        emit UserDeposit(msg.sender, msg.value, darwinAmount);
    }

    /// @notice Set the presale end date to `_endDate`
    /// @param _endDate The new presale end date
    function setPresaleEndDate(uint256 _endDate) external onlyOwner {
        // solhint-disable-next-line not-rely-on-time
        if (_endDate < block.timestamp || _endDate < presaleStart || _endDate > presaleEnd) {
            revert InvalidEndDate();
        }
        presaleEnd = _endDate;
        emit PresaleEndDateSet(_endDate);
    }

    /// @notice Set addresses for Wallet 1
    /// @param _wallet1 The new Wallet 1 address
    function setWallet1(
        address _wallet1
    ) external onlyOwner {
        if (_wallet1 == address(0)) {
            revert ZeroAddress();
        }
        _setWallet1(_wallet1);
    }

    /// @notice Sends ETH and unsold Darwin to Wallet 1
    function withdrawETHAndUnsoldDarwin() external onlyOwner {
        if (presaleStatus() != Status.SUCCESS) {
            revert PresaleNotEnded();
        }
        
        uint balance = address(this).balance;
        if (balance > 0) {
            _transferETH(wallet1, balance);
        }

        uint darwinBalance = darwin.balanceOf(address(this));
        if (darwinBalance > 0) {
            darwin.transfer(wallet1, darwinBalance);
        }

        emit PresaleCompleted(balance, darwinBalance);
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
        uint256 owned = darwin.balanceOf(account);
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
        if (!_isInitialized) {
            return Status.QUEUED;
        }

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

    /// @notice Calculates the number of tokens that can be bought with `ethAmount` ETH
    /// @param ethAmount The number of ETH to be deposited
    /// @return The number of Darwin to be purchased with `ethAmount` ETH
    function calculateDarwinAmount(
        uint256 ethAmount
    ) public view returns (uint256) {
        if (ethAmount > HARDCAP - status.raisedAmount) {
            revert AmountExceedsHardcap();
        }
        uint256 tokensLeft = baseTokensLeftToRaiseOnCurrentStage();
        if (ethAmount < tokensLeft) {
            return ((ethAmount * _getCurrentRate()));
        } else {
            uint256 stage = _getCurrentStage();
            uint256 darwinAmount;
            uint256 rate;
            uint256 stageAmount;
            uint256 stageCap;
            uint amountRaised = status.raisedAmount;
            while (ethAmount > 0) {
                (rate, stageAmount, stageCap) = _getStageDetails(stage);
                uint amountLeftInStage = stageCap - amountRaised;
                if (ethAmount <= amountLeftInStage) {
                    darwinAmount += (ethAmount * rate);
                    ethAmount = 0;
                    break;
                }

                amountRaised += amountLeftInStage;
                darwinAmount += (amountLeftInStage * rate);
                ethAmount -= amountLeftInStage;
                
                ++stage;
            }

            return darwinAmount;
        }
    }

    function _transferETH(address to, uint256 amount) internal {
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

    function _getCurrentRate() private view returns (uint256 rate) {
        (rate, , ) = _getStageDetails(_getCurrentStage());
    }

    function _getCurrentStage() private view returns (uint256) {
        uint raisedAmount = status.raisedAmount;
        if (raisedAmount > 50 ether) {
            return 2;
        } else if (raisedAmount > 20 ether) {
            return 1;
        } else {
            return 0;
        }
    }

    function _getStageDetails(
        uint256 stage
    ) private pure returns (uint256, uint256, uint256) {
        assert(stage <= 2);
        if (stage == 0) {
            return (5300, 20 ether, 20 ether);
        } else if (stage == 1) {
            return (4800, 30 ether, 50 ether);
        } else {
            return (4250, 326 ether, 396 ether);
        }
    }
}
