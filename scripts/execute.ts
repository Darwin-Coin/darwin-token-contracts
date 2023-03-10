// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinCommunity } from "../typechain-types";
import { Darwin } from "../typechain-types/contracts";
import { ADDRESSES } from "./constants";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  const COMMUNITY = ADDRESSES.community;
  const DARWIN = ADDRESSES.darwin;
  const PROP_ID = 3;
  const PRELAUNCH = true;

  console.log(`💻 Owner: ${owner.address}`);

  // DECLARE FACTORIES
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");

  const community = darwinCommunityFactory.attach(COMMUNITY) as DarwinCommunity;
  const darwinProxy = darwinFactory.attach(DARWIN) as Darwin;

  if (PRELAUNCH) {
  const unpause = await darwinProxy.emergencyUnPause();
  await unpause.wait();
  console.log("✅ UNPAUSED");

  const approve = await darwinProxy.approve(community.address, ethers.utils.parseEther("1000000"));
  await approve.wait();
  console.log("✅ APPROVED");
  }

  try {
  const execute = await community.execute(PROP_ID);
  await execute.wait();
  console.log("✅ EXECUTED");
  } catch {
    console.log("❌ EXECUTION FAILED");
  }

  if (PRELAUNCH) {
  const pause = await darwinProxy.emergencyPause();
  await pause.wait();
  console.log("✅ PAUSED");
  }

  console.log("✅ PROPOSAL EXECUTED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
