// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IStrategy {
    function balanceOf() external view returns (uint256);

    function invest() external;

    function withdraw(uint256 amount) external;

    function withdrawAll() external;
}
