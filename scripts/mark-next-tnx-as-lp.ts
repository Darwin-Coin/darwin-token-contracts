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




async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner, address0, address1, ...others] = await hardhat.ethers.getSigners()

    const devWallet = others.pop()!!;
    const addresses = others.slice(others.length - 60, others.length).map(it => it.address);
    const tokensToTransfer = BigNumber.from(1 * 10 ** 9).mul(BigNumber.from(1 * 10 ** 9))


    const dp = DP__factory.connect("0xb72d4327248d3D95c744A637d10caC8824a4a6e4", owner)

    console.log(await dp.uniswapV2Pair())

        return;

    console.log(await dp.isNextSellLP())

    const tnx = await dp.markNextSellAsLP()

    await tnx.wait()

    console.log(`marked sell as lp:${await dp.isNextSellLP()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
