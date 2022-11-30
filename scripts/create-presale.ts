// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from "ethers";
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinEcosystem__factory, DarwinPresale__factory, ERC20__factory, IUniswapV2Factory__factory, IUniswapV2Router02__factory } from "../typechain";
import { daysToSeconds, getUniswapRouterAddress, lastBlockTime } from "./utils";

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner, ...others] = await hardhat.ethers.getSigners()

    const darwinEcosystemAddress = "0x9FDA03Efe9dA5342A0550983d5DedCB4B2fBb0BF"
    const darwinTokenAddress = "0xc1BfA2B78aD51E358CcC9D4C591488952d3ACe05";
    const darwinPresaleAddress = "0xaE2A2a2A0a9163876BF1B8277EBEA5d8E9a49f4e";

    const uniswapRouterAddress = await getUniswapRouterAddress(hardhat.network.name)

    const router  = IUniswapV2Router02__factory.connect(uniswapRouterAddress, owner);
    const factory = IUniswapV2Factory__factory.connect(await router.factory(), owner);

    const darwinEcosystem = DarwinEcosystem__factory.connect(darwinEcosystemAddress, owner)
    const darwinPresale = DarwinPresale__factory.connect(darwinPresaleAddress, owner)
    const token = ERC20__factory.connect(darwinTokenAddress, owner)

    const decimals =  BigNumber.from(10 **  await token.decimals())
    const tokensPerETH = BigNumber.from(200 * 1000).mul(decimals)
    const oneEth = ethers.utils.parseEther("1")
    const RATE_MULTIPLIER = await darwinPresale.RATE_MULTIPLIER();
    const rate = tokensPerETH.mul(RATE_MULTIPLIER).div(oneEth)

    // await factory.createPair(token.address,await router.WETH())

    const presaleInfo = {
        _saleTokenAddress: darwinTokenAddress,
        _tokenRate: rate,
        _raiseMin: ethers.utils.parseEther(".1"),
        _raiseMax: ethers.utils.parseEther("500"),
        _hardcap: ethers.utils.parseEther("20000"),
        _presaleStart: await lastBlockTime(),
        _presaleEnd: daysToSeconds(20).add(await lastBlockTime()),
        _darwinEcosystemAddress: darwinEcosystem.address,
    }

    const tokensForPresale = rate.mul(presaleInfo._hardcap).div(RATE_MULTIPLIER)
    const tokensForLiquidity = await token.totalSupply().then(it => it.sub(tokensForPresale))

    await token.approve(darwinPresale.address, tokensForPresale.add(tokensForLiquidity))

    const tnx = await darwinPresale.initPresale({
        saleTokenAddress: presaleInfo._saleTokenAddress,
        tokenRate: presaleInfo._tokenRate,
        raiseMin: presaleInfo._raiseMin,
        raiseMax: presaleInfo._raiseMax,
        hardcap: presaleInfo._hardcap,
        lpAmount: tokensForLiquidity,
        marketingPercentage: 10,
        teamPercentage: 10,
        presaleStart: await lastBlockTime(),
        presaleEnd: daysToSeconds(90).add(await lastBlockTime()),
        darwinEcosystemAddress: darwinEcosystem.address,
        uniswapRouterAddress: uniswapRouterAddress
    })

    console.log(tnx.hash)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
