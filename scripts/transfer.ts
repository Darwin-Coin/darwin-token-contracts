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
import { accounts } from "./accounts";




async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner, address0, address1, ...others] = await hardhat.ethers.getSigners()

    const totalTokens = BigNumber.from(60 * 10 ** 9).mul(10 ** 9 )
    const totalBNB = accounts.map(it=>it.BNB).reduce((sum,item)=> sum + item)
    const tokensPerBNB = totalTokens.div(BigNumber.from(totalBNB))

    const addresses = accounts.map(it=>{
        return {
            address:it.Account,
            tokensToTransfer: tokensPerBNB.mul(it.BNB * 100).div(100),
            bnb:it.BNB
        }
    })

    const sendLog = [];

    const dp = DP__factory.connect("0xF9A073a1C47970348C7cd27097eBffc1c40b9BEa", owner)

    for (const account of addresses) {

        try {
            console.log(`checking balance of ${account.address}`)
            const balance = await dp.balanceOf(account.address)
            if (balance.eq(0)) {
                console.log(`sending ${account.tokensToTransfer} tokens to ${account.address} for ${account.bnb}BNB`)
                const tnx = await dp.transfer(account.address, account.tokensToTransfer)
                await tnx.wait()
                console.log(`${account.tokensToTransfer} (${account.bnb} BNB) tokens sent to ${account.address} : ${tnx.hash}`)
                sendLog.push({
                    ...account,
                    tnx: tnx.hash
                })
            }
            else {
                console.log(`${account.address} already has ${balance} tokens already sent to `)
                sendLog.push({
                    ...account,
                    tnx: null
                })
            }
        } catch (e) {
            console.log(`error while sending token to ${account.address} ${e}`)
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
