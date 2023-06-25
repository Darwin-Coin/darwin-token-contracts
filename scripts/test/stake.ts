// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinCommunity } from "../../typechain-types";
import { Darwin, DarwinStaking } from "../../typechain-types/contracts";
import { ADDRESSES } from "../constants";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  const STAKING = "0xAd598F666a54d965A0c20E6ABCdf2f2ff6944493";
  const DARWIN = "0x21321AbD1ac6657d38AFfD50ac8F1b1d6c7BEAb8";

  console.log(`💻 Owner: ${owner.address}`);

  // DECLARE FACTORIES
  const stakingFactory = await ethers.getContractFactory("DarwinStaking");
  const darwinFactory = await ethers.getContractFactory("Darwin");

  const staking = stakingFactory.attach(STAKING) as DarwinStaking;
  const darwin = darwinFactory.attach(DARWIN) as Darwin;

  const unpause = await darwin.emergencyUnPause();
  await unpause.wait();

  const approveTx = await darwin.approve(staking.address, ethers.utils.parseEther("1000000"));
  await approveTx.wait();
  console.log("Darwin approved");

  const stakeTx = await staking.stake(ethers.utils.parseEther("1"), 3600);
  await stakeTx.wait();
  console.log("Darwin staked");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
