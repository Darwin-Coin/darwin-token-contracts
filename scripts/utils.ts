// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { deployPancakeswap, getUniswapRouterAddress, lastBlockTime } from "./helpers";
import * as hardhat from "hardhat";
import { DP, DP__factory, IPancakePair__factory, PancakeRouter__factory } from "../typechain";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { send } from "process";
import { delay } from "underscore";


const formatEther = (amount: BigNumber) => ethers.utils.formatEther(amount)

const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));


async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner,  ..._] = await hardhat.ethers.getSigners()

    const provider = owner.provider!!
    const devWallet = new ethers.Wallet("0x85a867600671ae9fc2f8793fd071e7f55a2b133b839daf908b4481d371f21c91", provider);


    const dp = DP__factory.connect("0x98dcf3160aa559365af6b1fe2f1b01e56f4315ce", owner)

    console.log(await dp.name())

    const uniswapv2Router = PancakeRouter__factory.connect(await dp.uniswapV2Router(), owner);
    const uniswapPair = IPancakePair__factory.connect(await dp.uniswapV2Pair(), owner);

    console.log(uniswapPair.getReserves())

    
   
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
