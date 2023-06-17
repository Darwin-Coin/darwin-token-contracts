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

  const STAKING = "0xa0C0bB2705E35096903D2b71b8e468EB263C5FBB";
  const DARWIN = "0xCb32Ffff9FF15eFb57a35827D3cDC0A9A0Aab14A";

  console.log(`💻 Owner: ${owner.address}`);

  // DECLARE FACTORIES
  const stakingFactory = await ethers.getContractFactory("DarwinStaking");
  const darwinFactory = await ethers.getContractFactory("Darwin");

  const staking = stakingFactory.attach(STAKING) as DarwinStaking;
  const darwin = darwinFactory.attach(DARWIN) as Darwin;

  /* const approveTx = await darwin.approve(staking.address, ethers.utils.parseEther("1000000"));
  await approveTx.wait();
  console.log("Darwin approved"); */

  const stakeTx = await staking.stake(ethers.utils.parseEther("0"), 3600);
  await stakeTx.wait();
  console.log("Darwin staked");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
