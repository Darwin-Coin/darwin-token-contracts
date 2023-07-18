import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { BoosterNFT } from "../../typechain-types/contracts";
import { IBoosterNFT } from "../../typechain-types/contracts/BoosterNFT";
import { EvoturesNFT, VRFv2Consumer } from "../../typechain-types";

async function main() {

  const [owner] = await ethers.getSigners();
  const CONSUMER = "0x6dDEa1F1D21F78Fc3b30456070384DB7E60E0b8b";
  const EVOTURES = "0xA4AC1C7f44a2BB6fa03f4603a9DAeE0AE5809CeF";

  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");
  const consumerFactory = await ethers.getContractFactory("VRFv2Consumer");

  console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`);

  const evotures = evoturesFactory.attach(EVOTURES) as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Deployed Evotures NFT at: ${evotures.address}`);

  const consumer = consumerFactory.attach(CONSUMER) as VRFv2Consumer;
  await consumer.deployed();
  console.log(`🔨 Deployed Chainlink Consumer at: ${consumer.address}`);

  const mint = await evotures.mint(3, 5, owner.address, {value: ethers.utils.parseEther("0.21")});
  await mint.wait();
  console.log("Mint transaction sent");

  const withdraw = await evotures.withdrawETH();
  await withdraw.wait();
  console.log("ETH withdrawn");

  console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`);

  console.log("✅ COMPLETED")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
