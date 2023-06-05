// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinCommunity } from "../typechain-types";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  const COMMUNITY = "0xc77750F465623DA5a2aC3A2FedF9c2E457bAbd4c";

  console.log(`💻 Owner: ${owner.address}`);

  // DECLARE FACTORIES
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const community = darwinCommunityFactory.attach(COMMUNITY) as DarwinCommunity;

  await community.emitInitialFundsEvents();

  console.log("✅ INITIAL EVENTS EMITTED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
