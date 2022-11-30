import { BigNumber } from "ethers"
import hardhat, { ethers } from "hardhat"
import { PancakeFactory } from "../typechain";


export const getUniswapRouterAddress = async (network: string) => {
    switch (network) {

        case "hardhat":
        case "local":
            const pancakeswapInfo = await deployPancakeswap()
            return pancakeswapInfo.pancakeRouter.address;

        case "bscTestNet":
        case "localBscTestNetFork":
            return '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3';

        case "bscMainNet":
        case "localMainNetFork":
            return '0x10ed43c718714eb63d5aa57b78b54704e256024e';

        default:
            return '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3';
    }
}

export const deployPancakeswap = async () => {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner, ...others] = await hardhat.ethers.getSigners()

    const WBNB = await hardhat.ethers.getContractFactory("WBNB")
    const PancakeFactory = await hardhat.ethers.getContractFactory("PancakeFactory");
    const PancakeRouter01 = await hardhat.ethers.getContractFactory("PancakeRouter01");
    const PancakeRouter = await hardhat.ethers.getContractFactory("PancakeRouter");


    const wBNB = await WBNB.deploy();
    const pancakeFactory = await PancakeFactory.deploy(owner.address) as PancakeFactory
    const pancakeRouter01 = await PancakeRouter01.deploy(pancakeFactory.address, wBNB.address)
    const pancakeRouter = await PancakeRouter.deploy(pancakeFactory.address, wBNB.address)

    // console.log(` INIT_CODE_PAIR_HASH: ${await pancakeFactory.INIT_CODE_PAIR_HASH()}`)

    return {
        wBNB: wBNB,
        pancakeFactory: pancakeFactory,
        pancakeRouter01: pancakeRouter01,
        pancakeRouter: pancakeRouter
    }
}

export const now = () => Math.floor(Date.now() / 1000)
export const lastBlockTime = async () => (await ethers.provider.getBlock("latest")).timestamp
export const setNetworkTimeStamp = async (time: BigNumber) => {
    await ethers.provider.send("evm_setNextBlockTimestamp", [time.toNumber()])
    await ethers.provider.send("evm_mine", [])
}
export const hoursToSeconds = (hours: number): BigNumber => BigNumber.from(Math.floor(hours * 60 * 60))
export const daysToSeconds = (days: number): BigNumber => hoursToSeconds(days * 24)
export const weeksToSeconds = (weeks: number): BigNumber => daysToSeconds(weeks * 7)