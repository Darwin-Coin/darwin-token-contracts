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


    const dp = DP__factory.connect("0x813A203D509611fA2e9cCc0853BAA5FFE70F479f", owner)


    const uniswapv2Router = PancakeRouter__factory.connect(await dp.uniswapV2Router(), owner);
    const uniswapPair = IPancakePair__factory.connect(await dp.uniswapV2Pair(), owner);

    console.log(await dp.name(), uniswapPair.address)

    console.log(owner.address, devWallet.address);
    const confirmationBlocks  = 4;

    // await (await dp.connect(owner).addExchangeAddress(uniswapPair.address, {
    //     from: owner.address
    // })).wait(confirmationBlocks)

    // console.log("added to exchange")


    // const balanceOfDev = await dp.connect(devWallet).balanceOf(devWallet.address, {
    //     from: devWallet.address
    // });

    // await (await dp.connect(devWallet).transfer(owner.address, balanceOfDev, {
    //     from: devWallet.address
    // })).wait(confirmationBlocks)

    // console.log("token transfered")
    // return;

    // await (await uniswapPair.sync()).wait(confirmationBlocks)
    // await (await dp.syncTokenReserveInLastSellExchnageSafe()).wait(confirmationBlocks)


    let packOfToken = (await dp.balanceOf(owner.address)).div(40)

    let tokensToSell = packOfToken

    const bnbBefore = await owner.getBalance()
    let gasFee = BigNumber.from(0)

    let balance = await dp.balanceOf(owner.address);

    let sell = 0

    while (balance.gt(4)) {
        console.log(`starting sell ${sell}`)

        const balanceOfOwner = (await dp.balanceOf(owner.address))

        tokensToSell = balanceOfOwner.gt(packOfToken) ? packOfToken : balanceOfOwner.mul(99).div(100)

        await (await dp.approve(uniswapv2Router.address, tokensToSell)).wait(confirmationBlocks)

        console.log("tokens approved")
        await sleep(3000)

        const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [dp.address, await uniswapv2Router.WETH()])

        const amountOutMin = amountsOut[1].mul(100 - 10).div(100)

        const tnx = await uniswapv2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            amountOutMin,
            [dp.address, await uniswapv2Router.WETH()],
            owner.address,
            await lastBlockTime() + 1000
        )

        const confirmed = await tnx.wait(confirmationBlocks)

        console.log("tokens sold")
        await sleep(3000)

        const tnxToSyncOnToken = await (await dp.syncTokenReserveInLastSellExchnageSafe()).wait(confirmationBlocks)

        console.log("tnxToSyncOnToken")
        await sleep(3000)

        const tnxToSync = await (await uniswapPair.sync()).wait(confirmationBlocks)

        console.log("tnxToSync")

        let balance = await dp.balanceOf(owner.address);

        if (balance.gt(4)) {
            const buyTnx = await uniswapv2Router.swapExactETHForTokens(
                0,
                [await uniswapv2Router.WETH(), dp.address],
                owner.address,
                await lastBlockTime() + 1000,
                {
                    value: ethers.utils.parseEther("1")
                }
            )
            const buyTnxConfirmed = await buyTnx.wait(confirmationBlocks)
            console.log("buyTnx")
            await sleep(3000)
            gasFee = gasFee.add(buyTnxConfirmed.gasUsed)
        }

        sell++;
        gasFee = gasFee.add(confirmed.gasUsed).add((tnxToSyncOnToken).gasUsed).add(tnxToSync.gasUsed)

        const bnbAfterTnx = await owner.getBalance()

        balance = await dp.balanceOf(owner.address);

        let formatted = "";

        try {
            formatted = (balanceOfOwner.toNumber() / 10.0 ** 9).toFixed(9)
        } catch (e) {
            formatted = balance.div(BigNumber.from(10 ** 9)).toString()
        }

        console.log(`#${sell}, gasUsed: ${formatEther(gasFee.mul(5000000000))}BNB, BNB: ${formatEther(bnbAfterTnx.sub(bnbBefore))}BNB, balance: ${formatted}DiP\n`)

        await sleep(3000)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
