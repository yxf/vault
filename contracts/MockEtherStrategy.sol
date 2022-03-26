// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "./IStrategy.sol";

contract MockEtherStrategy is IStrategy {
    address payable public vault;

    constructor(address payable _vault) {
        vault = _vault;
    }

    receive() external payable {}

    function balanceOf() public view returns (uint256) {
        return address(this).balance;
    }

    function invest() external override {}

    function withdraw(uint256 amount) external override {
        Address.sendValue(vault, amount);
    }

    function withdrawAll() external override {
        Address.sendValue(vault, address(this).balance);
    }

    // simulate invest loss
    function decrease(uint256 amount) external {
        Address.sendValue(payable(address(0x0)), amount);
    }
}
