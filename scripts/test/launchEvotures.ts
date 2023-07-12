import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { BoosterNFT } from "../../typechain-types/contracts";
import { IBoosterNFT } from "../../typechain-types/contracts/BoosterNFT";
import { EvoturesNFT, VRFv2Consumer } from "../../typechain-types";

function consumerArgs(chainId: number) {
  switch(chainId) {
    case 56:
      return {
        coordinator: "0xc587d9053cd1118f25F645F9E08BB98c9712A4EE",
        keyHash: "0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04",
        subscriptionId: 0,
        confirmations: 3
      }
    case 97:
      return {
        coordinator: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f",
        keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314",
        subscriptionId: 3047,
        confirmations: 3
      }
    default:
      return {
        coordinator: "0x6A2AAd07396B36Fe02a22b33cf443582f682c82f",
        keyHash: "0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314",
        subscriptionId: 0,
        confirmations: 0
      };
  }
}

async function main() {

  const VERIFY = false;
  const [owner] = await ethers.getSigners();
  const chainId = await owner.getChainId();
  const { coordinator, keyHash, subscriptionId, confirmations } = consumerArgs(chainId);

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
  const consumerFactory = await ethers.getContractFactory("VRFv2Consumer");

  console.log("Balance: " + ethers.utils.formatEther(await owner.getBalance()));

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

  console.log("Balance: " + ethers.utils.formatEther(await owner.getBalance()));

  //! [DEPLOY] CONSUMER
  const consumer = await consumerFactory.deploy(coordinator, keyHash, subscriptionId, confirmations) as VRFv2Consumer;
  await consumer.deployed();
  console.log(`🔨 Deployed Chainlink Consumer at: ${consumer.address}`);

  if (VERIFY) {
    //? [VERIFY] CONSUMER
    await hardhat.run("verify:verify", {
      address: consumer.address,
      constructorArguments: [coordinator, keyHash, subscriptionId, confirmations]
    });
  }

  console.log("Balance: " + ethers.utils.formatEther(await owner.getBalance()));

  //! [DEPLOY] EVOTURES
  const evotures = await evoturesFactory.deploy(unminted, boosters.address, consumer.address) as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Deployed Evotures NFT at: ${evotures.address}`);

  if (VERIFY) {
    //? [VERIFY] EVOTURES
    await hardhat.run("verify:verify", {
      address: evotures.address,
      constructorArguments: [unminted, boosters.address, consumer.address]
    });
  }

  console.log("Balance: " + ethers.utils.formatEther(await owner.getBalance()));

  const setEvotures = await boosters.setEvotures(evotures.address);
  await setEvotures.wait();
  console.log("🏁 Evotures address set in booster contract");

  console.log("Balance: " + ethers.utils.formatEther(await owner.getBalance()));

  const initConsumer = await consumer.initialize(evotures.address);
  await initConsumer.wait();
  console.log("🏁 Evotures address set in consumer contract");

  console.log("Balance: " + ethers.utils.formatEther(await owner.getBalance()));
  console.log("✅ COMPLETED")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
