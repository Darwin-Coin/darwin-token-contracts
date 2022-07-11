import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { hoursToSeconds, lastBlockTime, setNetworkTimeStamp } from "../../scripts/helpers";
import { Darwin, IUniswapV2Pair, IUniswapV2Router02 } from "../../typechain";
import { IPancakePair__factory } from "../../typechain/factories/IPancakePair__factory";
import { PancakeRouter__factory } from "../../typechain/factories/PancakeRouter__factory";
import { deploy } from "../utils";


const decimalPoints = BigNumber.from((10 ** 9))

describe("Darwin", function () {

    let darwin: Darwin
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
        darwin = deployedContract.darwin;
        devWallet = deployedContract.dev;
        uniswapv2Router = PancakeRouter__factory.connect(await darwin.uniswapV2Router(), owner);
        uniswapPair = IPancakePair__factory.connect(await darwin.uniswapV2Pair(), owner);
    })


    it.only("Should have corrent tokens in dev wallet and owner wallet", async function () {

        const ownerTokens = BigNumber.from(90 * (10 ** 9)).mul(decimalPoints)
        const devWalletTokens = BigNumber.from(10 * (10 ** 9)).mul(decimalPoints)

        const balanceOfOwner = await darwin.balanceOf(owner.address)
        const balanceOfDevWallet = await darwin.balanceOf(devWallet.address)

        expect(ownerTokens).equal(balanceOfOwner)
        expect(balanceOfDevWallet).equal(devWalletTokens)

    });

    it.only("Users should be able to send tokens", async function () {
        const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await darwin.balanceOf(devWallet.address)
        const balanceOfAddress0Before = await darwin.balanceOf(address0.address)

        expect(balanceOfAddress0Before).to.equal(BigNumber.from(0))

        const tokens = BigNumber.from(100 * 10 ** 9)

        await darwin.transfer(address0.address, tokens)

        const balanceOfOwnerAfter = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await darwin.balanceOf(devWallet.address)
        const balanceOfAddress0After = await darwin.balanceOf(address0.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokens))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfAddress0After).to.equal(tokens)
    });

    it.only("It should not burn on pre defined lp operation", async function () {
        const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await darwin.balanceOf(devWallet.address)
        const balanceOfLPBefore = await darwin.balanceOf(uniswapPair.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(200))
        const ethToAddLiquidity = ethers.utils.parseEther("100")

        await darwin.markNextSellAsLP()
        await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            darwin.address,
            tokensToAddLiqidity,
            0,
            0,
            darwin.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const balanceOfOwnerAfter = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await darwin.balanceOf(devWallet.address)
        const balanceOfLPAfter = await darwin.balanceOf(uniswapPair.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokensToAddLiqidity))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfLPAfter).to.equal(tokensToAddLiqidity)
    });

    it.only("allowance should work", async () => {
        const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await darwin.balanceOf(devWallet.address)
        const balanceOfAddress0Before = await darwin.balanceOf(address0.address)

        expect(balanceOfAddress0Before).to.equal(BigNumber.from(0))

        const tokens = BigNumber.from(100 * 10 ** 9)

        await darwin.approve(address0.address, tokens)
        await darwin.connect(address0).transferFrom(owner.address, address0.address, tokens, {
            from: address0.address
        })

        const balanceOfOwnerAfter = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await darwin.balanceOf(devWallet.address)
        const balanceOfAddress0After = await darwin.balanceOf(address0.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokens))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfAddress0After).to.equal(tokens)
    })

    it.only("It should burn on pre defined lp operation", async function () {
        const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletBefore = await darwin.balanceOf(devWallet.address)
        const balanceOfLPBefore = await darwin.balanceOf(uniswapPair.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
        const ethToAddLiquidity = ethers.utils.parseEther("500")

        await darwin.markNextSellAsLP()
        await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            darwin.address,
            tokensToAddLiqidity,
            0,
            0,
            owner.address,
            await lastBlockTime() + 1000,
            {
                value: ethToAddLiquidity
            }
        )

        const balanceOfOwnerAfter = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletAfter = await darwin.balanceOf(devWallet.address)
        const balanceOfLPAfter = await darwin.balanceOf(uniswapPair.address)

        expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokensToAddLiqidity))
        expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
        expect(balanceOfLPAfter).to.equal(tokensToAddLiqidity)

        const tokensToSell = BigNumber.from(1000).mul(decimalPoints)

        await darwin.connect(devWallet).approve(uniswapv2Router.address, tokensToSell.mul(BigNumber.from(1)), {
            from: devWallet.address
        });

        const tnx = await uniswapv2Router.connect(devWallet).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            0,
            [darwin.address, await uniswapv2Router.WETH()],
            devWallet.address,
            await lastBlockTime() + 1000,
            {
                from: devWallet.address
            }
        )

        const balanceOfOwnerAfterSell = await darwin.balanceOf(owner.address)
        const balanceOfDevWalletAfterSell = await darwin.balanceOf(devWallet.address)
        const balanceOfLPAfterSell = await darwin.balanceOf(uniswapPair.address)
        const burnedTokens = await darwin.tBurnTotal()
        const reflectionToken = await darwin.tReflectionTotal()

        expect(balanceOfOwnerAfterSell.gte(balanceOfOwnerAfter)).to.be.true

        expect(burnedTokens.toNumber()).to.equal(Math.floor(tokensToSell.toNumber() * .9))
        expect(reflectionToken.toNumber()).to.equal(Math.floor(tokensToSell.toNumber() * .05))
    });


    it("It should let selling token after 24 hours", async function () {
        const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)

        const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
        const ethToAddLiquidity = ethers.utils.parseEther("500")

        await darwin.markNextSellAsLP()
        await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            darwin.address,
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

        await darwin.transfer(address0.address, tokensToSell);

        await setNetworkTimeStamp(hoursToSeconds(24).add(await lastBlockTime()))

        const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

        const amountOutMin = amountsOut[1].mul(100 - 10).div(100)

        await darwin.connect(address0).approve(uniswapv2Router.address, tokensToSell.mul(BigNumber.from(1)), {
            from: address0.address
        });

        const tnx = await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokensToSell,
            amountOutMin,
            [darwin.address, await uniswapv2Router.WETH()],
            address0.address,
            await lastBlockTime() + 1000,
            {
                from: address0.address
            }
        )

    });


    it("It should currectly store the unsynced amount of tokens on sell", async function () {
        const tokensToAddLiqidity = BigNumber.from(1).mul(decimalPoints)
        const ethToAddLiquidity = ethers.utils.parseEther("1")

        await darwin.markNextSellAsLP()
        await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            darwin.address,
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

        await darwin.transfer(address0.address, tokensToSell.mul(4));

        {
            const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

            const amountOutMin = amountsOut[1] // no slipage

            await darwin.connect(address0).approve(uniswapv2Router.address, tokensToSell, {
                from: address0.address
            });

            await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
                tokensToSell,
                amountOutMin,
                [darwin.address, await uniswapv2Router.WETH()],
                address0.address,
                await lastBlockTime() + 1000,
                {
                    from: address0.address
                }
            )

            const unSyncedPairs = await darwin.getOutOfSyncedPairs()
            const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)

            expect(unSyncedPairs).to.eql([uniswapPair.address])
            expect(outOfSyncAmount).to.eql(tokensToSell.mul(95).div(100))
        }

        {
            const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

            const amountOutMin = amountsOut[1] // no slipage

            await darwin.connect(address0).approve(uniswapv2Router.address, tokensToSell, {
                from: address0.address
            });

            const unSyncedPairsAfterApprove = await darwin.getOutOfSyncedPairs()
            const outOfSyncAmountAfterApprove = await darwin.getOutOfSyncedAmount(uniswapPair.address)

            expect(unSyncedPairsAfterApprove).to.eql([])
            expect(outOfSyncAmountAfterApprove).to.eql(BigNumber.from(0))

            await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
                tokensToSell,
                amountOutMin,
                [darwin.address, await uniswapv2Router.WETH()],
                address0.address,
                await lastBlockTime() + 1000,
                {
                    from: address0.address
                }
            )

            const unSyncedPairs = await darwin.getOutOfSyncedPairs()
            const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)

            expect(unSyncedPairs).to.eql([uniswapPair.address])
            expect(outOfSyncAmount).to.eql(tokensToSell.mul(95).div(100))

        }

    });

    it("It should currectly store the unsynced amount of tokens on consecutive sells", async function () {
        const tokensToAddLiqidity = BigNumber.from(1).mul(decimalPoints)
        const ethToAddLiquidity = ethers.utils.parseEther("1")

        await darwin.markNextSellAsLP()
        await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

        await uniswapv2Router.addLiquidityETH(
            darwin.address,
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

        await darwin.transfer(address0.address, tokensToSell.mul(4));

        await darwin.connect(address0).approve(uniswapv2Router.address, tokensToSell.mul(4), {
            from: address0.address
        });

        {
            const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

            const amountOutMin = amountsOut[1] // no slipage

            await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
                tokensToSell,
                amountOutMin,
                [darwin.address, await uniswapv2Router.WETH()],
                address0.address,
                await lastBlockTime() + 1000,
                {
                    from: address0.address
                }
            )

            const unSyncedPairs = await darwin.getOutOfSyncedPairs()
            const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
            const balanceOfPair = await darwin.balanceOf(uniswapPair.address)

            expect(unSyncedPairs).to.eql([uniswapPair.address])
            expect(outOfSyncAmount).to.eql(tokensToSell.mul(95).div(100))
            expect(balanceOfPair).to.eql(tokensToSell.add(tokensToAddLiqidity))
        }

        {
            const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

            const amountOutMin = amountsOut[1].mul(100 - 10).div(100) // 10 % slipage

            await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
                tokensToSell,
                amountOutMin,
                [darwin.address, await uniswapv2Router.WETH()],
                address0.address,
                await lastBlockTime() + 1000,
                {
                    from: address0.address
                }
            )

            const unSyncedPairs = await darwin.getOutOfSyncedPairs()
            const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
            const balanceOfPair = await darwin.balanceOf(uniswapPair.address)

            expect(unSyncedPairs).to.eql([uniswapPair.address])
            expect(outOfSyncAmount).to.eql(tokensToSell.mul(95).div(100).mul(2))
            expect(balanceOfPair).to.eql(tokensToSell.mul(2).add(tokensToAddLiqidity))
        }

        let boughtTokens : BigNumber;

        {
            const amountsOut = await uniswapv2Router.getAmountsOut(ethers.utils.parseEther("0.5"), [await uniswapv2Router.WETH(), darwin.address])

            const amountOutMin = amountsOut[1].mul(100 - 10).div(100) // 10 % slipage

            console.log(amountOutMin)

            await uniswapv2Router.connect(address0).swapExactETHForTokensSupportingFeeOnTransferTokens(
                amountOutMin,
                [await uniswapv2Router.WETH(), darwin.address],
                address0.address,
                await lastBlockTime() + 1000,
                {
                    from: address0.address,
                    value: ethers.utils.parseEther("0.5")
                }
            )

            boughtTokens = amountsOut[1]

            const unSyncedPairs = await darwin.getOutOfSyncedPairs()
            const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
            const balanceOfPair = await darwin.balanceOf(uniswapPair.address)

            expect(unSyncedPairs).to.eql([uniswapPair.address])
            expect(outOfSyncAmount).to.eql(tokensToSell.mul(95).div(100).mul(2))
            expect(balanceOfPair).to.eql(tokensToSell.mul(2).sub(amountsOut[1]).add(tokensToAddLiqidity))
        }

        {

            const balanceOfPairBeforeSync = await darwin.balanceOf(uniswapPair.address)

            await darwin.transfer(address0.address, tokensToSell);

            const unSyncedPairs = await darwin.getOutOfSyncedPairs()
            const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
            const balanceOfPairAfterSync = await darwin.balanceOf(uniswapPair.address)


            expect(unSyncedPairs).to.eql([])
            expect(outOfSyncAmount).to.eql(BigNumber.from(0))
            expect(balanceOfPairAfterSync).to.eql(tokensToSell.mul(2).mul(5).div(100).sub(boughtTokens).add(tokensToAddLiqidity))
            expect(balanceOfPairBeforeSync.sub(balanceOfPairAfterSync).eq(tokensToSell.mul(2).mul(95).div(100)))
        }

    });

});
