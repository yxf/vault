import { expect } from "chai";
import { ethers } from "hardhat";

import { ETH } from "../types";

export function shouldBehaveLikeVault(): void {
  describe("deposit", function () {
    it("deposit ether", async function () {
      await this.vault.deposit(ETH, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
      const balance = await this.vault.balanceOf(this.signers.admin.address, ETH);
      expect(balance).to.eq("1000000000000000000");

      await this.vault
        .connect(this.signers.user)
        .deposit(ETH, ethers.utils.parseEther("3"), { value: ethers.utils.parseEther("3") });
      const userBalance = await this.vault.balanceOf(this.signers.user.address, ETH);
      expect(userBalance).to.eq("3000000000000000000");
    });

    it("deposit ether with investing", async function () {
      await this.vault.deposit(ETH, ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
      const balanceBefore = await this.vault.balanceOf(this.signers.admin.address, ETH);
      expect(balanceBefore).to.eq("1000000000000000000");

      await this.vault
        .connect(this.signers.user)
        .deposit(ETH, ethers.utils.parseEther("3"), { value: ethers.utils.parseEther("3") });
      const userBalanceBefore = await this.vault.balanceOf(this.signers.user.address, ETH);
      expect(userBalanceBefore).to.eq("3000000000000000000");

      // simulate invest gain
      await this.signers.admin.sendTransaction({
        value: ethers.utils.parseEther("1"),
        to: this.mockEtherStrategy.address,
      });

      const balanceAfter = await this.vault.balanceOf(this.signers.admin.address, ETH);
      expect(balanceAfter).to.eq("1250000000000000000");

      const userBalanceAfter = await this.vault.balanceOf(this.signers.user.address, ETH);
      expect(userBalanceAfter).to.eq("3750000000000000000");

      await this.mockEtherStrategy.decrease(ethers.utils.parseEther("0.5"));

      const balanceAfterInvest = await this.vault.balanceOf(this.signers.admin.address, ETH);
      expect(balanceAfterInvest).to.eq("1125000000000000000");

      const userBalanceAfterInvest = await this.vault.balanceOf(this.signers.user.address, ETH);
      expect(userBalanceAfterInvest).to.eq("3375000000000000000");
    });

    it("deposit token", async function () {
      // approve
      await this.token.connect(this.signers.admin).approve(this.vault.address, ethers.utils.parseEther("100"));

      await this.vault.connect(this.signers.admin).deposit(this.token.address, ethers.utils.parseEther("100"));
      const balance = await this.vault.balanceOf(this.signers.admin.address, this.token.address);
      expect(balance).to.eq("100000000000000000000");

      await this.token.connect(this.signers.user).approve(this.vault.address, ethers.utils.parseEther("200"));

      await this.vault.connect(this.signers.user).deposit(this.token.address, ethers.utils.parseEther("200"));
      const userBalance = await this.vault.balanceOf(this.signers.user.address, this.token.address);
      expect(userBalance).to.eq("200000000000000000000");
    });

    it("deposit token with investing", async function () {
      // approve
      await this.token.connect(this.signers.admin).approve(this.vault.address, ethers.utils.parseEther("100"));
      await this.vault.connect(this.signers.admin).deposit(this.token.address, ethers.utils.parseEther("100"));

      await this.token.connect(this.signers.user).approve(this.vault.address, ethers.utils.parseEther("200"));
      await this.vault.connect(this.signers.user).deposit(this.token.address, ethers.utils.parseEther("200"));

      await this.vault.connect(this.signers.manager).invest(this.token.address);

      const balanceAfter1 = await this.vault.balanceOf(this.signers.admin.address, this.token.address);
      expect(balanceAfter1).to.eq("100000000000000000000");

      const balanceAfter2 = await this.vault.balanceOf(this.signers.user.address, this.token.address);
      expect(balanceAfter2).to.eq("200000000000000000000");

      // invest loss
      await this.mockStrategy.decrease(ethers.utils.parseEther("10"));

      const balanceAfterLoss1 = await this.vault.balanceOf(this.signers.admin.address, this.token.address);
      expect(balanceAfterLoss1).to.eq("96666666666666666666");

      const balanceAfterLoss2 = await this.vault.balanceOf(this.signers.user.address, this.token.address);
      expect(balanceAfterLoss2).to.eq("193333333333333333333");

      // invest gain
      await this.token.transfer(this.vault.address, ethers.utils.parseEther("20"));

      const balanceGainAfter1 = await this.vault.balanceOf(this.signers.admin.address, this.token.address);
      expect(balanceGainAfter1).to.eq("103333333333333333333");

      const balanceGainAfter2 = await this.vault.balanceOf(this.signers.user.address, this.token.address);
      expect(balanceGainAfter2).to.eq("206666666666666666666");
    });
  });

  describe("withdraw token", function () {
    beforeEach(async function () {
      // approve
      await this.token.connect(this.signers.admin).approve(this.vault.address, ethers.utils.parseEther("100"));
      await this.vault.connect(this.signers.admin).deposit(this.token.address, ethers.utils.parseEther("100"));

      await this.token.connect(this.signers.user).approve(this.vault.address, ethers.utils.parseEther("200"));
      await this.vault.connect(this.signers.user).deposit(this.token.address, ethers.utils.parseEther("200"));
    });

    it("withdraw token with no investing", async function () {
      await this.vault.connect(this.signers.user).withdraw(this.token.address, ethers.utils.parseEther("50"));
      const balance = await this.vault.balanceOf(this.signers.user.address, this.token.address);
      expect(balance).to.eq("150000000000000000000");
    });

    it("withdraw token with investing", async function () {
      await this.vault.connect(this.signers.manager).invest(this.token.address);
      // invest loss
      await this.mockStrategy.decrease(ethers.utils.parseEther("30"));

      const balance1 = await this.vault.balanceOf(this.signers.admin.address, this.token.address);
      expect(balance1).to.eq("90000000000000000000");

      const balance2 = await this.vault.balanceOf(this.signers.user.address, this.token.address);
      expect(balance2).to.eq("180000000000000000000");

      await this.vault.connect(this.signers.user).withdraw(this.token.address, ethers.utils.parseEther("10"));

      const balanceAfterWithdraw = await this.vault.balanceOf(this.signers.user.address, this.token.address);
      expect(balanceAfterWithdraw).to.eq("171000000000000000000");

      // invest gain
      await this.token.transfer(this.mockStrategy.address, ethers.utils.parseEther("30"));
      await this.vault.connect(this.signers.admin).withdraw(this.token.address, ethers.utils.parseEther("10"));

      const balanceAfterWithdraw2 = await this.vault.balanceOf(this.signers.admin.address, this.token.address);
      expect(balanceAfterWithdraw2).to.eq("90310344827586206896");
    });
  });

  describe("withdraw ether", function () {
    beforeEach(async function () {
      await this.vault
        .connect(this.signers.admin)
        .deposit(ETH, ethers.utils.parseEther("10"), { value: ethers.utils.parseEther("10") });
      await this.vault
        .connect(this.signers.user)
        .deposit(ETH, ethers.utils.parseEther("20"), { value: ethers.utils.parseEther("20") });
    });

    it("withdraw ether with no investing", async function () {
      await this.vault.connect(this.signers.user).withdraw(ETH, ethers.utils.parseEther("5"));
      const balance = await this.vault.balanceOf(this.signers.user.address, ETH);
      expect(balance).to.eq("15000000000000000000");
    });

    it("withdraw ether with investing", async function () {
      await this.vault.connect(this.signers.manager).invest(ETH);
      // invest loss
      await this.mockEtherStrategy.decrease(ethers.utils.parseEther("3"));

      const balance1 = await this.vault.balanceOf(this.signers.admin.address, ETH);
      expect(balance1).to.eq("9000000000000000000");

      const balance2 = await this.vault.balanceOf(this.signers.user.address, ETH);
      expect(balance2).to.eq("18000000000000000000");

      await this.vault.connect(this.signers.user).withdraw(ETH, ethers.utils.parseEther("1"));

      const balanceAfterWithdraw = await this.vault.balanceOf(this.signers.user.address, ETH);
      expect(balanceAfterWithdraw).to.eq("17100000000000000000");

      // invest gain
      await this.signers.admin.sendTransaction({
        value: ethers.utils.parseEther("3"),
        to: this.mockEtherStrategy.address,
      });

      await this.vault.connect(this.signers.admin).withdraw(ETH, ethers.utils.parseEther("1"));

      const balanceAfterWithdraw2 = await this.vault.balanceOf(this.signers.admin.address, ETH);
      expect(balanceAfterWithdraw2).to.eq("9031034482758620689");
    });
  });

  it("only manager can invest", async function () {
    await expect(this.vault.connect(this.signers.admin).invest(this.token.address)).to.be.revertedWith("Not manager");
  });
}
