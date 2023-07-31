import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { BoosterNFT, MainnetNFTCounter } from "../../typechain-types/contracts";
import { IBoosterNFT } from "../../typechain-types/contracts/BoosterNFT";
import { EvoturesNFT, VRFv2Consumer } from "../../typechain-types";
import { ADDRESSES_ARB, ADDRESSES_MAINNET } from "../constants";

async function main() {

  const TO = "0x061F5750708509a20b88A4baa61551e64A0Be7C5";

  // DECLARE ARBITRUM FACTORIES
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");

  //! [DEPLOY] EVOTURES
  const evotures = evoturesFactory.attach(ADDRESSES_ARB.evotures) as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Attach Evotures NFT at: ${evotures.address}`);

  const hardMint = await evotures.hardMint(1, 5, TO);
  await hardMint.wait();

  console.log("✅ COMPLETED")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
