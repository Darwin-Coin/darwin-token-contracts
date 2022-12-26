// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { Darwin } from "../typechain-types";
import { getUniswapRouterAddress } from "./helpers";
import FS, { PathLike } from 'fs';

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

  const {addresses, kinds, values} = await readFile('../test/whitelist.txt')
  await dp.setWhitelist(addresses, kinds, values)

  console.log(`Darwin deployed at: ${dp.address} by ${owner.address}`)
}

async function readFile(filename: PathLike) {
    const {promises: fsPromises} = FS
    try {
      const contents = await fsPromises.readFile(filename, 'utf-8')

      const arr = contents.split(/\r?\n/)

      const addresses: String[] = []
      const kinds: number[] = []
      const values: boolean[] = []

      for (const line in arr) {
        const lineArr = line.split(/\s*\-\s*/)
        if (lineArr.length === 3 && !lineArr[0].includes("//")) {
            addresses.push(lineArr[0])
            kinds.push(parseInt(lineArr[1]))
            values.push(lineArr[2].includes('true') ? true : false)
        }
      }

      return {addresses, kinds, values}
    } catch (err) {
      console.error(err)
      return {addresses: ['0x0000000000000000000000000000000000000000'], kinds: [7], values: [false]}
    }
  }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});