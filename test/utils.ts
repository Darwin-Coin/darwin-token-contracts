import { getManifestAdmin } from "@openzeppelin/hardhat-upgrades/dist/admin";
import { BigNumber, BigNumberish, BytesLike } from "ethers";


import hardhat, { ethers, upgrades } from "hardhat";
import { getUniswapRouterAddress } from "../scripts/helpers";
import { Darwin, DarwinCommunity, MockDarwinCommunity, ProxyAdmin } from "../typechain-types";

export const now = () => Math.floor(Date.now() / 1000)
export const lastBlockTime = async () => (await ethers.provider.getBlock("latest")).timestamp
export const hoursToSeconds = (hours: number): BigNumber => BigNumber.from(Math.floor(hours * 60 * 60))
export const daysToSeconds = (days: number): BigNumber => hoursToSeconds(days * 24)
export const weeksToSeconds = (weeks: number): BigNumber => daysToSeconds(weeks * 7)

export const START_OF_WEEK = 1649030400

export const deploy = async () => {

    const [owner, address0, ...others] = await ethers.getSigners()
    const devWallet = others[others.length -1]
    
    const DarwinCommunity = await ethers.getContractFactory("DarwinCommunity")
    const Darwin = await ethers.getContractFactory("Darwin");
    const uniswapV2RouterAddress = await getUniswapRouterAddress(hardhat.network.name)
    const darwinCommunity = await upgrades.deployProxy(DarwinCommunity, [[],[],[]], { initializer: "initialize" }) as DarwinCommunity;

    await darwinCommunity.deployed()

    const darwin = await upgrades.deployProxy(Darwin, [uniswapV2RouterAddress,devWallet.address,darwinCommunity.address], {
        initializer: "initialize",
    }) as Darwin;

    await darwin.deployed();

    let snapShotId = await ethers.provider.send("evm_snapshot", []);

    if(await darwinCommunity.darwin()!= darwin.address)
        await darwinCommunity.setDarwinAddress(darwin.address);

    return { darwin, darwinCommunity, snapShotId, dev: devWallet }
}

export const deployWithMockDarwinCommunity = async () => {

    const MockDarwinCommunity = await ethers.getContractFactory("MockDarwinCommunity")
    const Darwin = await ethers.getContractFactory("Darwin");
    const uniswapV2RouterAddress = getUniswapRouterAddress(hardhat.network.name)

    const darwinCommunity = await MockDarwinCommunity.deploy() as MockDarwinCommunity;

    await darwinCommunity.deployed()

    const darwin = await upgrades.deployProxy(Darwin, [uniswapV2RouterAddress, darwinCommunity.address], {
        initializer: "initialize",
    }) as Darwin;

    await darwin.deployed();

    let snapShotId = await ethers.provider.send("evm_snapshot", []);

    const proxyAdmin = await getManifestAdmin(hardhat) as ProxyAdmin;

    await proxyAdmin.transferOwnership(darwinCommunity.address);

    await darwinCommunity.setDarwinAddress(darwin.address);

    return { darwin, darwinCommunity, snapShotId }
}

export const setNetworkTimeStamp = async (time: BigNumber) => {
    await ethers.provider.send("evm_setNextBlockTimestamp", [time.toNumber()])
    await ethers.provider.send("evm_mine", [])
}

export interface NewProposalParams {
    targets: string[],
    values: BigNumber[],
    signatures: string[],
    calldatas: BytesLike[],
    title: string,
    description: string,
    other: string,
    endTime: BigNumberish
}
