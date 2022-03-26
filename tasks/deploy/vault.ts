import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { MockEtherStrategy } from "../../src/types/MockEtherStrategy";
import { MockStrategy } from "../../src/types/MockStrategy";
import { MockToken } from "../../src/types/MockToken";
import { Vault } from "../../src/types/Vault";
import { MockEtherStrategy__factory } from "../../src/types/factories/MockEtherStrategy__factory";
import { MockStrategy__factory } from "../../src/types/factories/MockStrategy__factory";
import { MockToken__factory } from "../../src/types/factories/MockToken__factory";
import { Vault__factory } from "../../src/types/factories/Vault__factory";

task("deploy:Vault")
  .addParam("manager", "vault manager address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const vaultFactory: Vault__factory = <Vault__factory>await ethers.getContractFactory("Vault");
    const vault: Vault = <Vault>await vaultFactory.deploy(taskArguments.manager);
    await vault.deployed();
    console.log("Vault deployed to: ", vault.address);

    // Deploy mocks
    const mockTokenFactory: MockToken__factory = <MockToken__factory>await ethers.getContractFactory("MockToken");
    const mockToken: MockToken = <MockToken>await mockTokenFactory.deploy();
    await mockToken.deployed();
    console.log("MockToken deployed to: ", mockToken.address);

    const strategyFactory: MockStrategy__factory = <MockStrategy__factory>(
      await ethers.getContractFactory("MockStrategy")
    );
    const strategy: MockStrategy = <MockStrategy>await strategyFactory.deploy(mockToken.address, vault.address);
    await strategy.deployed();
    console.log("MockStrategy deployed to: ", strategy.address);

    const mockStrategyFactory: MockEtherStrategy__factory = <MockEtherStrategy__factory>(
      await ethers.getContractFactory("MockEtherStrategy")
    );
    const etherStrategy: MockEtherStrategy = <MockEtherStrategy>await mockStrategyFactory.deploy(vault.address);
    await etherStrategy.deployed();
    console.log("MockEtherStrategy deployed to: ", etherStrategy.address);
  });
