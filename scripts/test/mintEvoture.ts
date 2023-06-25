import { ethers } from "hardhat";
import { EvoturesNFT } from "../../typechain-types/contracts";

async function main() {
  const EVOTURES = "0xAeeCD2d296852317532EfBD0994636992DBE7163";

  const [owner] = await ethers.getSigners();

  // DECLARE ARBITRUM FACTORIES
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");

  //! [ATTACH] EVOTURES
  const evotures = evoturesFactory.attach(EVOTURES) as EvoturesNFT;
  console.log(`🔨 Attach Evotures NFT at: ${evotures.address}`);

  /*await evotures.mint(owner.address, 50);

  console.log("DONE!")*/

  console.log(await evotures.lastTokenId());
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
