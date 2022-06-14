import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { hoursToSeconds, lastBlockTime, setNetworkTimeStamp } from "../scripts/helpers";
import { DP, IUniswapV2Factory__factory, IUniswapV2Pair, IUniswapV2Pair__factory, IUniswapV2Router02, IUniswapV2Router02__factory } from "../typechain";
import { IPancakePair__factory } from "../typechain/factories/IPancakePair__factory";
import { IPancakeRouter02__factory } from "../typechain/factories/IPancakeRouter02__factory";
import { PancakeRouter__factory } from "../typechain/factories/PancakeRouter__factory";
import { PancakeRouter } from "../typechain/PancakeRouter";
import { deploy } from "./utils";
import { expect } from "chai";


const decimalPoints = BigNumber.from((10 ** 9))

describe("DP", function () {

    let dp: DP
    let uniswapv2Router: IUniswapV2Router02
    let uniswapPair: IUniswapV2Pair

    let owner: SignerWithAddress
    let address0: SignerWithAddress
    let devWallet: SignerWithAddress

    let others: SignerWithAddress[]

    before(async () => {
        [owner, address0, ...others] = await ethers.getSigners()
    })

    beforeEach(async () => {
        let deployedContract = await deploy();
        dp = deployedContract.dp
        devWallet = deployedContract.devWallet
        uniswapv2Router = PancakeRouter__factory.connect(await dp.uniswapV2Router(), owner);
        uniswapPair = IPancakePair__factory.connect(await dp.uniswapV2Pair(), owner);
    })


    it("Should have corrent tokens in dev wallet and owner wallet", async function () {

        const ownerTokens = BigNumber.from(90 * (10 ** 9)).mul(decimalPoints)
        const devWalletTokens = BigNumber.from(10 * (10 ** 9)).mul(decimalPoints)

        const balanceOfOwner = await dp.balanceOf(owner.address)
        const balanceOfDevWallet = await dp.balanceOf(devWallet.address)

        expect(ownerTokens).equal(balanceOfOwner)
        expect(balanceOfDevWallet).equal(devWalletTokens)

    });

    it("Users should be able to send tokens", async function () {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await dp.balanceOf(devWallet.address)
        const balanceOfAddress0Before = await dp.balanceOf(address0.address)

        expect(balanceOfAddress0Before).to.equal(BigNumber.from(0))

        const tokens = BigNumber.from(100 * 10 ** 9)

        await dp.transfer(address0.address, tokens)

        const balanceOfOwnerAfter = await dp.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await dp.balanceOf(devWallet.address)
        const balanceOfAddress0After = await dp.balanceOf(address0.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokens))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfAddress0After).to.equal(tokens)
    });

    it("It should not burn on pre defined lp operation", async function () {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await dp.balanceOf(devWallet.address)
        const balanceOfLPBefore = await dp.balanceOf(uniswapPair.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(200))
        const ethToAddLiquidity = ethers.utils.parseEther("100")

        await dp.markNextSellAsLP()
        await dp.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            dp.address,
            tokensToAddLiqidity,
            0,
            0,
            dp.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const balanceOfOwnerAfter = await dp.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await dp.balanceOf(devWallet.address)
        const balanceOfLPAfter = await dp.balanceOf(uniswapPair.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokensToAddLiqidity))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfLPAfter).to.equal(tokensToAddLiqidity)
    });

    it("allowance should work", async () => {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await dp.balanceOf(devWallet.address)
        const balanceOfAddress0Before = await dp.balanceOf(address0.address)

        expect(balanceOfAddress0Before).to.equal(BigNumber.from(0))

        const tokens = BigNumber.from(100 * 10 ** 9)

        await dp.approve(address0.address, tokens)
        await dp.connect(address0).transferFrom(owner.address, address0.address, tokens, {
            from: address0.address
        })

        const balanceOfOwnerAfter = await dp.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await dp.balanceOf(devWallet.address)
        const balanceOfAddress0After = await dp.balanceOf(address0.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokens))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfAddress0After).to.equal(tokens)
    })

    it("It should burn on pre defined lp operation", async function () {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await dp.balanceOf(devWallet.address)
        const balanceOfLPBefore = await dp.balanceOf(uniswapPair.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
        const ethToAddLiquidity = ethers.utils.parseEther("500")

        await dp.markNextSellAsLP()
        await dp.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            dp.address,
            tokensToAddLiqidity,
            0,
            0,
            owner.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const balanceOfOwnerAfter = await dp.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await dp.balanceOf(devWallet.address)
        const balanceOfLPAfter = await dp.balanceOf(uniswapPair.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokensToAddLiqidity))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfLPAfter).to.equal(tokensToAddLiqidity)

        const tokensToSell = BigNumber.from(1000).mul(decimalPoints)

        await dp.connect(devWallet).approve(uniswapv2Router.address, tokensToSell.mul(BigNumber.from(1)), {
            from: devWallet.address
        });

        const tnx = await uniswapv2Router.connect(devWallet).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            0,
            [dp.address, await uniswapv2Router.WETH()],
            devWallet.address,
            await lastBlockTime() + 1000,
            {
                from: devWallet.address
            }
        )

        const balanceOfOwnerAfterSell = await dp.balanceOf(owner.address)
        const balanceOfDevWalletAfterSell = await dp.balanceOf(devWallet.address)
        const balanceOfLPAfterSell = await dp.balanceOf(uniswapPair.address)
        const burnedTokens = await dp.tBurnTotal()
        const reflectionToken = await dp.tReflectionTotal()

        expect(balanceOfOwnerAfterSell.gte(balanceOfOwnerAfter)).to.be.true

        expect(burnedTokens.toNumber()).to.equal(Math.floor(tokensToSell.toNumber() * .9))
        expect(reflectionToken.toNumber()).to.equal(Math.floor(tokensToSell.toNumber() * .05))
    });


    it("Sell lmit frame should be correct", async function () {
        const prevFrame = await dp.getCurrentSellLimitFrame()

        await setNetworkTimeStamp(hoursToSeconds(24).add(await lastBlockTime()))

        const newFrame = await dp.getCurrentSellLimitFrame()

        expect(prevFrame).to.equal(newFrame.sub(1))
    });


    it("It shouldn't let selling token in 24 hours", async function () {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
        const ethToAddLiquidity = ethers.utils.parseEther("500")

        await dp.markNextSellAsLP()
        await dp.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            dp.address,
            tokensToAddLiqidity,
            0,
            0,
            owner.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const tokensToSell = BigNumber.from(1000).mul(decimalPoints)

        await dp.transfer(address0.address, tokensToSell);

        await dp.connect(address0).approve(uniswapv2Router.address, tokensToSell.mul(BigNumber.from(1)), {
            from: address0.address
        });

        const tnx = uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            0,
            [dp.address, await uniswapv2Router.WETH()],
            address0.address,
            await lastBlockTime() + 1000,
            {
                from: address0.address
            }
        )

        await expect(tnx).to.be.reverted
    });


    it("It should let selling token after 24 hours", async function () {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
        const ethToAddLiquidity = ethers.utils.parseEther("500")

        await dp.markNextSellAsLP()
        await dp.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            dp.address,
            tokensToAddLiqidity,
            0,
            0,
            owner.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const tokensToSell = BigNumber.from(1000).mul(decimalPoints)

        await dp.transfer(address0.address, tokensToSell);

        await setNetworkTimeStamp(hoursToSeconds(24).add(await lastBlockTime()))

        const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [dp.address, await uniswapv2Router.WETH()])

        const amountOutMin = amountsOut[1].mul(100 - 10).div(100)

        await dp.connect(address0).approve(uniswapv2Router.address, tokensToSell.mul(BigNumber.from(1)), {
            from: address0.address
        });

        const tnx = await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            amountOutMin,
            [dp.address, await uniswapv2Router.WETH()],
            address0.address,
            await lastBlockTime() + 1000,
            {
                from: address0.address
            }
        )

    });


    it("It should let selling token received before 24 hours", async function () {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
        const ethToAddLiquidity = ethers.utils.parseEther("500")

        await dp.markNextSellAsLP()
        await dp.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            dp.address,
            tokensToAddLiqidity,
            0,
            0,
            owner.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const tokensToSell = BigNumber.from(1000)

        await dp.transfer(address0.address, tokensToSell);

        await setNetworkTimeStamp(hoursToSeconds(24).add(await lastBlockTime()))

        await dp.transfer(address0.address, tokensToSell);

        const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [dp.address, await uniswapv2Router.WETH()])

        const amountOutMin = amountsOut[1].mul(100 - 10).div(100)

        await dp.connect(address0).approve(uniswapv2Router.address, tokensToSell, {
            from: address0.address
        });

        await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            amountOutMin,
            [dp.address, await uniswapv2Router.WETH()],
            address0.address,
            await lastBlockTime() + 1000,
            {
                from: address0.address
            }
        )

        const amountsOut1 = await uniswapv2Router.getAmountsOut(tokensToSell, [dp.address, await uniswapv2Router.WETH()])

        const amountOutMin1 = amountsOut1[1].mul(100 - 10).div(100)

        await dp.connect(address0).approve(uniswapv2Router.address, tokensToSell, {
            from: address0.address
        });

        const secondSell =  uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            amountOutMin1,
            [dp.address, await uniswapv2Router.WETH()],
            address0.address,
            await lastBlockTime() + 1000,
            {
                from: address0.address
            }
        )

        await expect(secondSell).to.be.reverted
            
    });


    it("It should let selling token received before 24 hours", async function () {
        const balanceOfOwnerBefore = await dp.balanceOf(owner.address)

        const tokensToAddLiqidity = BigNumber.from(10000)
        const ethToAddLiquidity = ethers.utils.parseEther("500")

        await dp.markNextSellAsLP()
        await dp.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            dp.address,
            tokensToAddLiqidity,
            0,
            0,
            owner.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const tokensToSell = BigNumber.from(10)

        await dp.transfer(address0.address, tokensToSell);

        await setNetworkTimeStamp(hoursToSeconds(24).add(await lastBlockTime()))

        await dp.transfer(address0.address, tokensToSell);

        await dp.connect(address0).approve(uniswapv2Router.address, tokensToSell, {
            from: address0.address
        });

        const path = [dp.address, await uniswapv2Router.WETH()]

        const getTokensOut = await uniswapv2Router.getAmountsOut(tokensToSell, path);

        await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            getTokensOut[1].div(10),
            path,
            address0.address,
            await lastBlockTime() + 1000,
            {
                from: address0.address
            }
        )

        await dp.connect(address0).approve(uniswapv2Router.address, tokensToSell, {
            from: address0.address
        });

        const secondSell =  uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            0,
            [dp.address, await uniswapv2Router.WETH()],
            address0.address,
            await lastBlockTime() + 1000,
            {
                from: address0.address
            }
        )

        await expect(secondSell).to.be.reverted
            
    });


});
