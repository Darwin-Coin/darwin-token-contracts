// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinCommunity } from "../typechain-types";
import { Darwin } from "../typechain-types/contracts";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  const COMMUNITY = "0xc77750F465623DA5a2aC3A2FedF9c2E457bAbd4c";
  const DARWIN = "0xCb32Ffff9FF15eFb57a35827D3cDC0A9A0Aab14A";

  console.log(`💻 Owner: ${owner.address}`);

  // DECLARE FACTORIES
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");

  const community = darwinCommunityFactory.attach(COMMUNITY) as DarwinCommunity;
  const darwin = darwinFactory.attach(DARWIN) as Darwin;

  await darwin.approve(community.address, ethers.utils.parseEther("1"));
  await community.propose([darwin.address], [0], ["communityUnPause()"], ["0x00"], "Test Proposal BRUH", "Test description BRAAAAAHHH", "THIS IS THE OTHERRRRRRR", Math.floor(Date.now() / 1000) + (86400 * 2.1));

  console.log("✅ PROPOSAL CREATED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
