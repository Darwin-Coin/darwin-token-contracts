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


    const dp = DP__factory.connect("0x5CD439C7c5c80e59227217da29227f1561683009", owner)

    const uniswapv2Router = PancakeRouter__factory.connect(await dp.uniswapV2Router(), owner);
    const uniswapPair = IPancakePair__factory.connect(await dp.uniswapV2Pair(), owner);

    const tokensToSell = BigNumber.from(15977839762).mul(1* 10 ** 9)

    const bnbBefore = await owner.getBalance()

    console.log(bnbBefore)

    return;

    const tnx = await uniswapv2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        tokensToSell,
        ethers.utils.parseEther("0.00000416"),
        [dp.address, await uniswapv2Router.WETH()],
        owner.address,
        await lastBlockTime() + 1000
    )

    const bnbAfter = await owner.getBalance()

    console.log(bnbAfter)

    console.log(bnbAfter.sub(bnbBefore))

    await dp.markNextSellAsLP()
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
