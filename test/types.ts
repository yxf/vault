import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

// import type { Greeter } from "../src/types/Greeter";
import type { Vault } from "../src/types/Vault";

declare module "mocha" {
  export interface Context {
    vault: Vault;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  manager: SignerWithAddress;
  user: SignerWithAddress;
}

export const ETH = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
