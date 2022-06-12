// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { deployPancakeswap, getUniswapRouterAddress } from "./helpers";
import * as hardhat from "hardhat";
import { DP } from "../typechain";
import { ethers } from "hardhat";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner, address0, address1, ...others] = await hardhat.ethers.getSigners()

  console.log(await owner.getBalance(), owner.address)

  const devWallet = others.pop()!!;

  const DPContract = await hardhat.ethers.getContractFactory("DP")
  const uniswapV2RouterAddress = await getUniswapRouterAddress(hardhat.network.name)

  const dp = await (hardhat as  any).upgrades.deployProxy(DPContract, [uniswapV2RouterAddress,devWallet.address], { initializer: "initialize" }) as DP;

  await dp.deployed()

  console.log(`DP deployed at:${dp.address} by ${owner.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
