import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { artifacts, ethers, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { Vault } from "../../src/types/Vault";
import { ETH, Signers } from "../types";
import { shouldBehaveLikeVault } from "./Vault.behavior";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.manager = signers[1];
    this.signers.user = signers[2];
  });

  describe("Vault", function () {
    beforeEach(async function () {
      // deploy Vault
      const vaultArtifact: Artifact = await artifacts.readArtifact("Vault");
      this.vault = <Vault>(
        await waffle.deployContract(this.signers.admin, vaultArtifact, [this.signers.manager.address])
      );

      // deploy MockToken
      const mockTokenArtifact: Artifact = await artifacts.readArtifact("MockToken");
      this.token = <Vault>await waffle.deployContract(this.signers.admin, mockTokenArtifact);

      // deploy mock strategy
      const mockStrategyArtifact: Artifact = await artifacts.readArtifact("MockStrategy");
      this.mockStrategy = <Vault>(
        await waffle.deployContract(this.signers.admin, mockStrategyArtifact, [this.token.address, this.vault.address])
      );

      // deploy mock strategy
      const mockEtherStrategyArtifact: Artifact = await artifacts.readArtifact("MockEtherStrategy");
      this.mockEtherStrategy = <Vault>(
        await waffle.deployContract(this.signers.admin, mockEtherStrategyArtifact, [this.vault.address])
      );

      // Add strategies
      await this.vault.connect(this.signers.manager).setStrategy(ETH, this.mockEtherStrategy.address);
      await this.vault.connect(this.signers.manager).setStrategy(this.token.address, this.mockStrategy.address);

      await this.token.transfer(this.signers.user.address, ethers.utils.parseEther("10000"));
    });

    shouldBehaveLikeVault();
  });
});
