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

    const log = [];

    const dp = DP__factory.connect("0x813a203d509611fa2e9ccc0853baa5ffe70f479f", owner)

    // console.log(owner.address)
    // return;

    for (const account of accounts) {

        try {
            console.log(`checking if ${account.Account} is excluded from refleciton`)
            const isExcludedFromReflection = await dp.isExcludedFromReflection(account.Account)
            console.log(`${account.Account} isExcludedFromReflection:${isExcludedFromReflection} `)
            if (isExcludedFromReflection) {
                console.log(`excluding ${account.Account} from reflection`)
                const tnx = await dp.includeInReflectionSafe(account.Account)
                await tnx.wait()
                const isExcludedFromReflection = await dp.isExcludedFromReflection(account.Account)

                console.log(`tnx success isExcludedFromReflection: ${isExcludedFromReflection}`)
                log.push({
                    ...account,
                    tnx: tnx.hash
                })
            }
            else {
                console.log(`${account.Account} already included in reflection`)
                log.push({
                    ...account,
                    tnx: null
                })
            }
        } catch (e) {
            console.log(`error while including ${account.Account} in reflection`)
            console.log(JSON.stringify(log, null, 4))
            throw e;
        }
    }

    console.log(JSON.stringify(log, null, 4))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
