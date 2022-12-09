import { getManifestAdmin } from "@openzeppelin/hardhat-upgrades/dist/admin";
import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";


import hardhat, { ethers, upgrades } from "hardhat";
import { getUniswapRouterAddress } from "../scripts/helpers";
import { DarwinNew, DarwinCommunity, MockDarwinCommunity } from "../typechain";

export const now = () => Math.floor(Date.now() / 1000)
export const lastBlockTime = async () => (await ethers.provider.getBlock("latest")).timestamp
export const hoursToSeconds = (hours: number): BigNumber => BigNumber.from(Math.floor(hours * 60 * 60))
export const daysToSeconds = (days: number): BigNumber => hoursToSeconds(days * 24)
export const weeksToSeconds = (weeks: number): BigNumber => daysToSeconds(weeks * 7)

export const START_OF_WEEK = 1649030400

export const deploy = async (devWallet: SignerWithAddress) => {

    const [owner, address0, ...others] = await ethers.getSigners()
    //const devWallet = others[others.length -1]
    
    const DarwinCommunity = await ethers.getContractFactory("DarwinCommunity")
    const Darwin = await ethers.getContractFactory("DarwinNew");
    const uniswapV2RouterAddress = await getUniswapRouterAddress(hardhat.network.name)
    const darwinCommunity = await upgrades.deployProxy(DarwinCommunity, [[],[],[]], { initializer: "initialize" }) as DarwinCommunity;

    await darwinCommunity.deployed()

    const darwin = await upgrades.deployProxy(Darwin, [uniswapV2RouterAddress,devWallet.address,darwinCommunity.address], {
        initializer: "initialize",
        kind: "uups",
    }) as DarwinNew;

    await darwin.deployed();

    let snapShotId = await ethers.provider.send("evm_snapshot", []);

    if(await darwinCommunity.darwin()!= darwin.address)
        await darwinCommunity.setDarwinAddress(darwin.address);

    return { darwin, darwinCommunity, snapShotId, dev: devWallet, uniswapV2RouterAddress }
}

export const deployWithMockDarwinCommunity = async (devWallet: SignerWithAddress) => {

    const MockDarwinCommunity = await ethers.getContractFactory("MockDarwinCommunity")
    const Darwin = await ethers.getContractFactory("DarwinNew");
    const uniswapV2RouterAddress = getUniswapRouterAddress(hardhat.network.name)

    const darwinCommunity = await MockDarwinCommunity.deploy() as MockDarwinCommunity;

    await darwinCommunity.deployed()

    const darwin = await upgrades.deployProxy(Darwin, [uniswapV2RouterAddress, devWallet.address, darwinCommunity.address], {
        initializer: "initialize",
        kind: "uups",
    }) as DarwinNew;

    await darwin.deployed();

    await darwin.grantRole(await darwin.UPGRADER_ROLE(), darwinCommunity.address);

    let snapShotId = await ethers.provider.send("evm_snapshot", []);

    await darwinCommunity.setDarwinAddress(darwin.address);

    return { darwin, darwinCommunity, snapShotId, uniswapV2RouterAddress }
}

export const setNetworkTimeStamp = async (time: BigNumber) => {
    await ethers.provider.send("evm_setNextBlockTimestamp", [time.toNumber()])
    await ethers.provider.send("evm_mine", [])
}

export const etherToWei = (ether: number) => {

    return ethers.utils.parseEther(ether.toString());

}

// Compare two BigNumbers that are close to one another.
//
// This is useful for when you want to compare the balance of an address after
// it executes a transaction, and you don't want to worry about accounting for
// balances changes due to paying for gas a.k.a. transaction fees.
export const closeTo = async (
    a: BigNumberish,
    b: BigNumberish,
    margin: BigNumberish
  ) => {
    expect(a).to.be.closeTo(b, margin);
  };

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
