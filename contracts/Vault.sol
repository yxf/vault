// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./IStrategy.sol";

contract Vault {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    address public constant ETH = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    // Mapping user => token => share of balance
    mapping(address => mapping(address => uint256)) public shareOf;
    // Mapping token => totalShares
    mapping(address => uint256) public totalShares;

    event Deposit(address user, address token, uint256 amount, uint256 shares);
    event Withdraw(address user, address token, uint256 amount, uint256 shares);

    mapping(address => address) public strategies;

    address manager;

    modifier onlyManager() {
        require(msg.sender == manager, "Not manager");
        _;
    }

    constructor(address _manager) {
        require(_manager != address(0x0), "Invalid manager");
        manager = _manager;
    }

    receive() external payable {}

    // returns total balance in vault and strategy
    function totalBalance(address token) public view returns (uint256) {
        uint256 valutBalance = token == ETH ? address(this).balance : IERC20(token).balanceOf(address(this));
        uint256 strategyBalance = strategies[token] == address(0x0) ? 0 : IStrategy(strategies[token]).balanceOf();
        return valutBalance.add(strategyBalance);
    }

    // returns user's token balance
    function balanceOf(address user, address token) public view returns (uint256) {
        uint256 total = totalBalance(token);
        return totalShares[token] == 0 ? 0 : shareOf[user][token].mul(total).div(totalShares[token]);
    }

    function deposit(address token, uint256 amount) external payable {
        require(amount > 0, "Deposit amount is 0");
        uint256 total = totalBalance(token);
        if (token != ETH) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        } else {
            amount = msg.value;
            total = total.sub(amount);
        }

        uint256 shares = total == 0 ? amount : amount.mul(totalShares[token]).div(total);

        totalShares[token] = totalShares[token].add(shares);
        shareOf[msg.sender][token] = shareOf[msg.sender][token].add(shares);

        emit Deposit(msg.sender, token, amount, shares);
    }

    function withdraw(address token, uint256 shares) external {
        require(shares > 0, "Withdraw shares is 0");
        require(shareOf[msg.sender][token] >= shares, "Insufficient balance");

        uint256 amount = shares.mul(totalBalance(token)).div(totalShares[token]);
        shareOf[msg.sender][token] = shareOf[msg.sender][token].sub(shares);
        totalShares[token] = totalShares[token].sub(shares);

        uint256 valutBalance = token == ETH ? address(this).balance : IERC20(token).balanceOf(address(this));

        if (valutBalance < amount) {
            if (strategies[token] != address(0x0)) {
                IStrategy(strategies[token]).withdraw(amount.sub(valutBalance));
            }
        }
        if (token == ETH) {
            Address.sendValue(payable(msg.sender), amount);
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit Withdraw(msg.sender, token, amount, shares);
    }

    function setStrategy(address token, address strategy) external onlyManager {
        require(strategy != address(0x0), "Invalid strategy");
        if (strategies[token] != address(0x0)) {
            IStrategy(strategies[token]).withdrawAll();
        }
        strategies[token] = strategy;
    }

    function invest(address token) external onlyManager {
        require(strategies[token] != address(0x0), "Invalid strategy");
        if (token == ETH) {
            if (address(this).balance > 0) {
                Address.sendValue(payable(strategies[token]), address(this).balance);
            }
        } else {
            if (IERC20(token).balanceOf(address(this)) > 0) {
                IERC20(token).safeTransfer(strategies[token], IERC20(token).balanceOf(address(this)));
            }
        }
        IStrategy(strategies[token]).invest();
    }
}
