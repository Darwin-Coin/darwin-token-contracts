import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { BoosterNFT, EvoturesNFT } from "../../typechain-types/contracts";
import { IBoosterNFT } from "../../typechain-types/contracts/BoosterNFT";


async function main() {
  const VERIFY = false;
  const [owner] = await ethers.getSigners();

  const unminted: number[] = [];
  const boosterUnminted: IBoosterNFT.KindStruct[] = [];
  for (let i = 1; i < 361; i++) {
    if (i < 121) {
        unminted.push(i);
    } else if (i < 241) {
        unminted.push(i+880);
    } else if (i != 301 && i != 360) {
        unminted.push(i+1760);
    }
  }
  for (let i = 3; i < 51; i++) {
    if (i < 6) {
      boosterUnminted.push({unminted: 10, no: i});
    } else if (i < 10) {
      boosterUnminted.push({unminted: 18, no: i});
    } else if (i < 15) {
      boosterUnminted.push({unminted: 30, no: i});
    } else if (i < 21) {
      boosterUnminted.push({unminted: 33, no: i});
    } else {
      boosterUnminted.push({unminted: 45, no: i});
    }
  }

  // DECLARE ARBITRUM FACTORIES
  const boosterFactory = await ethers.getContractFactory("BoosterNFT");
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");

  console.log("Start Balance: " + ethers.utils.formatEther(await owner.getBalance()));

  //! [DEPLOY] BOOSTERS
  const boosters = await boosterFactory.deploy(boosterUnminted) as BoosterNFT;
  await boosters.deployed();
  console.log(`🔨 Deployed Booster NFT at: ${boosters.address}`);

  if (VERIFY) {
    //? [VERIFY] BOOSTERS
    await hardhat.run("verify:verify", {
      address: boosters.address,
      constructorArguments: [boosterUnminted]
    });
  }

  //! [DEPLOY] EVOTURES
  const evotures = await evoturesFactory.deploy(unminted, boosters.address) as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Deployed Evotures NFT at: ${evotures.address}`);

  if (VERIFY) {
    //? [VERIFY] EVOTURES
    await hardhat.run("verify:verify", {
      address: evotures.address,
      constructorArguments: [unminted, boosters.address]
    });
  }

  console.log("End Balance: " + ethers.utils.formatEther(await owner.getBalance()));

  /*
  const evotures = evoturesFactory.attach("0xFf6fC65D8B19dA47D24179A7B0003Ef17C8417E0");
  console.log(await evotures.userMinted(owner.address));
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
