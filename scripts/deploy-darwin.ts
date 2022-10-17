// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { Darwin } from "../typechain";
import { getUniswapRouterAddress } from "./helpers";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner, ...others] = await hardhat.ethers.getSigners()

  const devWallet =  String(process.env.DEV_WALLET);

  console.log(`deployer wallet: ${owner.address} with ${ethers.utils.formatEther(await owner.getBalance())} ETH`)
  console.log(`dev wallet: ${devWallet}`);

  const DarwinContract = await hardhat.ethers.getContractFactory("Darwin")
  const uniswapV2RouterAddress = await getUniswapRouterAddress(hardhat.network.name)

  const dp = await hardhat.upgrades.deployProxy(DarwinContract, [uniswapV2RouterAddress,devWallet], { initializer: "initialize" }) as Darwin;

  await dp.deployed()

  console.log(`Darwin deployed at: ${dp.address} by ${owner.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
