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


    const dp = DP__factory.connect("0x3D068178228f03302e05F57bD58B28d9d243fA5B", owner)

    // const transaction = await dp.markNextSellAsLP()

    // console.log(transaction)

    const uniswapv2Router = PancakeRouter__factory.connect(await dp.uniswapV2Router(), owner);
    const uniswapPair = IPancakePair__factory.connect(await dp.uniswapV2Pair(), owner);

    const balanceOfOwnerBefore = await dp.balanceOf(owner.address)
    const ethOfOwnerBefore = await owner.getBalance()

    const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(90))
    const ethToAddLiquidity = ethers.utils.parseEther("0.01")
    // await dp.markNextSellAsLP()
    // await dp.approve(uniswapv2Router.address, tokensToAddLiqidity)

    // await uniswapv2Router.addLiquidityETH(
    //     dp.address,
    //     tokensToAddLiqidity,
    //     0,
    //     0,
    //     owner.address,
    //     await lastBlockTime() + 1000,
    //     {
    //         value: ethToAddLiquidity
    //     }
    // )

    // return 
    await uniswapPair.sync()
    // return
    const tokensIn = BigNumber.from(9) //.mul(10 ** 9)
    const slipage = 24
    await dp.approve(uniswapv2Router.address, tokensIn)

    // return;
    const amountsOut = await uniswapv2Router.getAmountsOut(tokensIn, [dp.address, await uniswapv2Router.WETH()])

    const amountOutMin = amountsOut[1].mul(100 - slipage).div(100)

    // const amountOutMin = ethers.utils.parseEther("0.0000008657") 

    console.log(`Token to sell: ${(tokensIn.toNumber() / 10.0 ** 9).toFixed(9)} out: ${ethers.utils.formatEther(amountsOut[1])}, with slipage: ${ethers.utils.formatEther(amountOutMin)}`)

    // console.log(amountsOut, ethers.utils.formatEther(amountOut), tokensToSell)

    // // const bnbBefore = await owner.getBalance()

    // // console.log(bnbBefore)

    // return;
    const tnx = await uniswapv2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        tokensIn,
        amountOutMin,
        [dp.address, await uniswapv2Router.WETH()],
        owner.address,
        await lastBlockTime() + 1000
    )

    const balanceOfOwnerAfter = await dp.balanceOf(owner.address)
    const ethOfOwnerAfter = await owner.getBalance()

    console.log(balanceOfOwnerBefore, ethOfOwnerBefore)
    console.log(balanceOfOwnerAfter, ethOfOwnerAfter)

    // await dp.markNextSellAsLP()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
