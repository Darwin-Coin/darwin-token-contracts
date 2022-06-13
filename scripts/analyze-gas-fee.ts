// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// import { ethers, upgrades } = require("hardhat"); // from "hardhat";

import { HardhatUpgrades } from "@openzeppelin/hardhat-upgrades"
import { ethers, upgrades } from "hardhat";
import hardhat from "hardhat"
import { getUniswapRouterAddress } from "./helpers";
import { BigNumber } from "ethers";
import { DP } from "../typechain";

const weiInGewi = BigNumber.from(1 * 10 ** 9)
const usdInBNB = 223.91;


async function main() {
     // Hardhat always runs the compile task when running scripts with its command
  const [owner, ...others] = await hardhat.ethers.getSigners()

  const devWallet = String(process.env.DEV_WALLET);

  console.log(`owner: ${owner.address} with ${ethers.utils.formatEther(await owner.getBalance())} ETH`)
  console.log(`dev wallet: ${devWallet}`);

  const DPContract = await hardhat.ethers.getContractFactory("DP")
  const uniswapV2RouterAddress = await getUniswapRouterAddress(hardhat.network.name)

  const dp = await (hardhat as  any).upgrades.deployProxy(DPContract, [uniswapV2RouterAddress,devWallet], { initializer: "initialize" }) as DP;


    console.log(`DP deployed at:${dp.address} by ${owner.address}`)

    let amount = BigNumber.from(10000 * 10 ** 9)

    let prevGasFeeInUsd = 0;

    for (let index in others) {
        const wallet = others[index];
        const transaction = await dp.transfer(wallet.address, amount)

        const tnx = await transaction.wait();
        const gasUsed = tnx.gasUsed
        const feeInWei = gasUsed.mul(5).mul(weiInGewi)
        const feeInBNB = Number(ethers.utils.formatEther(feeInWei));
        const feeInUSD = feeInBNB * usdInBNB;

        console.log(`excluded wallets count:${index} gas used: ${gasUsed.toNumber()} | ${feeInBNB.toFixed(8)} BNB | ${feeInUSD.toFixed(3)} USD | diff = ${(feeInUSD - prevGasFeeInUsd).toFixed(3)} USD`)
        await dp.excludeFromReflectionSafe(wallet.address)
        prevGasFeeInUsd =  feeInUSD;
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
