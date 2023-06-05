// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinCommunity } from "../../typechain-types";
import { Darwin } from "../../typechain-types/contracts";
import { ADDRESSES } from "../constants";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  const COMMUNITY = ADDRESSES.community;
  const DARWIN = ADDRESSES.darwin;
  const PRELAUNCH = true;

  console.log(`💻 Owner: ${owner.address}`);

  // DECLARE FACTORIES
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");

  const community = darwinCommunityFactory.attach(COMMUNITY) as DarwinCommunity;
  const darwinProxy = darwinFactory.attach(DARWIN) as Darwin;

  const darwin = await darwinFactory.deploy() as Darwin;
  await darwin.deployed();
  console.log("✅ DEPLOYED");

  try {
  await hardhat.run("verify:verify", {
    address: darwin.address,
    constructorArguments: []
  }); } catch {
    console.log("❌ Verify task failed")
  }

  const data = ethers.utils.defaultAbiCoder.encode(["address"],[darwin.address]);

  if (PRELAUNCH) {
  const unpause = await darwinProxy.emergencyUnPause();
  await unpause.wait();
  console.log("✅ UNPAUSED");

  const approve = await darwinProxy.approve(community.address, ethers.utils.parseEther("1000000"));
  await approve.wait();
  console.log("✅ APPROVED");
  }

  const prop = await community.propose([DARWIN], [0], ["upgradeTo(address)"], [data], "Darwin Contract Emergency Upgrade", "Add a 'emergencySetNotLive' function because team disabled Presale, in order to be able to create one with different prices.", "", Math.floor(Date.now() / 1000) + (3600 * 48) + 120);
  await prop.wait();
  console.log("✅ PROPOSED");

  if (PRELAUNCH) {
  const pause = await darwinProxy.emergencyPause();
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
