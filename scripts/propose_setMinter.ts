// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinVester } from "../typechain-types/contracts";
import { ADDRESSES } from "./constants";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  const COMMUNITY = ADDRESSES.community;
  const DARWIN = ADDRESSES.darwin;
  const VESTER = ADDRESSES.vester;

  console.log(`💻 Owner: ${owner.address}`);

  // DECLARE FACTORIES
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");
  const vesterFactory = await ethers.getContractFactory("DarwinVester");

  const community = darwinCommunityFactory.attach(COMMUNITY) as DarwinCommunity;
  const darwin = darwinFactory.attach(DARWIN) as Darwin;
  const vester = vesterFactory.attach(VESTER) as DarwinVester;

  const PAUSED = await darwin.isPaused();

  if (PAUSED) {
  const unpause = await darwin.emergencyUnPause();
  await unpause.wait();
  console.log("✅ UNPAUSED");
  }

  const approve = await darwin.approve(community.address, ethers.utils.parseEther("1000000"));
  await approve.wait();
  console.log("✅ APPROVED");

  const data = ethers.utils.defaultAbiCoder.encode(["address","bool"],[vester.address,true]);
  const prop = await community.propose([DARWIN], [0], ["setMinter(address,bool)"], [data], "Set Vester as Minter", "Set Vester as Minter", "", Math.floor(Date.now() / 1000) + (3600 * 48) + 120);
  await prop.wait();
  console.log("✅ PROPOSED");

  if (PAUSED) {
  const pause = await darwin.emergencyPause();
  await pause.wait();
  console.log("✅ PAUSED");
  }

  console.log("✅ PROPOSAL MADE");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
