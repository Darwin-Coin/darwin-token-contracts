import * as hardhat from "hardhat";
import { getUniswapRouterAddress } from "../scripts/helpers";
import { Darwin } from "../typechain";


export const deploy = async () => {

    // Hardhat always runs the compile task when running scripts with its command
    const [owner, address0, address1, ...others] = await hardhat.ethers.getSigners()

    const devWallet = others.pop()!!;

    const DPContract = await hardhat.ethers.getContractFactory("Darwin")
    const uniswapV2RouterAddress = await getUniswapRouterAddress(hardhat.network.name)
    
    const dp = await (hardhat as any).upgrades.deployProxy(DPContract, [uniswapV2RouterAddress, devWallet.address], { initializer: "initialize" }) as Darwin;

    await dp.deployed()

    return { dp, devWallet: devWallet }
}
