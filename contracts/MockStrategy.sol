// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./IStrategy.sol";

contract MockStrategy is IStrategy {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    address public token;
    address public vault;

    constructor(address _token, address _vault) {
        token = _token;
        vault = _vault;
    }

    function balanceOf() public view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function invest() external {}

    function withdraw(uint256 amount) external override {
        IERC20(token).safeTransfer(vault, amount);
    }

    function withdrawAll() external override {
        IERC20(token).safeTransfer(vault, IERC20(token).balanceOf(address(this)));
    }

    // simulate invest loss
    function decrease(uint256 amount) external {
        IERC20(token).safeTransfer(address(0x1), amount);
    }
}
