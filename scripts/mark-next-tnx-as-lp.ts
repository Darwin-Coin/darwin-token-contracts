// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from "ethers";
import * as hardhat from "hardhat";
import { Darwin__factory } from "../typechain";




async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner, address0, address1, ...others] = await hardhat.ethers.getSigners()

    const devWallet = others.pop()!!;
    const addresses = others.slice(others.length - 60, others.length).map(it => it.address);
    const tokensToTransfer = BigNumber.from(1 * 10 ** 9).mul(BigNumber.from(1 * 10 ** 9))


    const sarwin = Darwin__factory.connect("0x98dcf3160aa559365af6b1fe2f1b01e56f4315ce", owner)

    console.log(await sarwin.isNextSellLP(owner.address))

    // return;

    const tnx = await sarwin.markNextSellAsLP()

    await tnx.wait()

    console.log(`marked sell as lp:${await sarwin.isNextSellLP(owner.address)}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
