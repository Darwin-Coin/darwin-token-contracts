// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { deployPancakeswap, getUniswapRouterAddress } from "./helpers";
import * as hardhat from "hardhat";
import { DP, DP__factory } from "../typechain";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { send } from "process";




async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner, address0, address1, ...others] = await hardhat.ethers.getSigners()

    const devWallet = others.pop()!!;
    const addresses = others.slice(others.length - 60, others.length).map(it => it.address);
    const tokensToTransfer = BigNumber.from(1 * 10 ** 9).mul(BigNumber.from(1 * 10 ** 9))

    const sendLog = [];

    const dp = DP__factory.connect("0xC902CA56627D4a7716E9493194eF53c8685Cbf65", owner)

    for (const address of addresses) {

        try {
            console.log(`checking balance of ${address}`)
            const balance = await dp.connect(address).balanceOf(address)
            if (balance.eq(0)) {
                console.log(`sending tokens to ${address}`)
                const tnx = await dp.transfer(address, tokensToTransfer)
                await tnx.wait()
                console.log(`tokens sent to ${address} : ${tnx.hash}`)
                sendLog.push({
                    address,
                    tokens: tokensToTransfer.toString(),
                    tnx: tnx.hash
                })
            }
            else {
                console.log(`tokens already sent to ${address}`)
                sendLog.push({
                    address,
                    tokens: balance.toString(),
                    tnx: null
                })
            }
        } catch (e) {
            console.log(`error while sending token to ${address} ${e}`)
            console.log(JSON.stringify(sendLog, null, 4))
            throw e;
        }
    }

    console.log(JSON.stringify(sendLog, null, 4))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
