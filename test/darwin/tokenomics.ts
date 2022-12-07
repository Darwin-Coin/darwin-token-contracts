import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Darwin, DarwinCommunity, IUniswapV2Pair, IUniswapV2Router02 } from "../../typechain-types";
import { IPancakePair__factory } from "../../typechain-types";
import { PancakeRouter__factory } from "../../typechain-types";
import { deploy } from "../utils";


const decimalPoints = BigNumber.from((10 ** 9))

describe("Darwin : Tokenomics", function () {

    let darwin: Darwin
    let darwinComunity: DarwinCommunity
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
        darwinComunity = deployedContract.darwinCommunity;
        uniswapv2Router = PancakeRouter__factory.connect(await darwin.uniswapV2Router(), owner);
        uniswapPair = IPancakePair__factory.connect(await darwin.uniswapV2Pair(), owner);
    })


    // it("It should not burn on pre defined lp operation", async function () {
    //     const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)
    //     const balanceOfDevWalletBefore = await darwin.balanceOf(devWallet.address)
    //     const balanceOfLPBefore = await darwin.balanceOf(uniswapPair.address)

    //     const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(200))
    //     const ethToAddLiquidity = ethers.utils.parseEther("100")

    //     await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

    
    //     await uniswapv2Router.addLiquidityETH(
    //         darwin.address,
    //         tokensToAddLiqidity,
    //         0,
    //         0,
    //         darwin.address,
    //         await lastBlockTime() + 1000,
    //         {
    //             value: ethToAddLiquidity
    //         }
    //     )

    //     const balanceOfOwnerAfter = await darwin.balanceOf(owner.address)
    //     const balanceOfDevWalletAfter = await darwin.balanceOf(devWallet.address)
    //     const balanceOfLPAfter = await darwin.balanceOf(uniswapPair.address)

    //     expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokensToAddLiqidity))
    //     expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
    //     expect(balanceOfLPAfter).to.equal(tokensToAddLiqidity)
    // });

    // it("It should corectly perform burns and take community tokens", async function () {
    //     const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)
    //     const balanceOfDevWalletBefore = await darwin.balanceOf(devWallet.address)
    //     const balanceOfLPBefore = await darwin.balanceOf(uniswapPair.address)

    //     const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
    //     const ethToAddLiquidity = ethers.utils.parseEther("500")

    //     await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

    //     await uniswapv2Router.addLiquidityETH(
    //         darwin.address,
    //         tokensToAddLiqidity,
    //         0,
    //         0,
    //         owner.address,
    //         await lastBlockTime() + 1000,
    //         {
    //             value: ethToAddLiquidity
    //         }
    //     )

    //     const balanceOfOwnerAfter = await darwin.balanceOf(owner.address)
    //     const balanceOfDevWalletAfter = await darwin.balanceOf(devWallet.address)
    //     const balanceOfLPBeforeSell = await darwin.balanceOf(uniswapPair.address)

    //     expect(balanceOfOwnerBefore).to.equal(balanceOfOwnerAfter.add(tokensToAddLiqidity))
    //     expect(balanceOfDevWalletBefore).to.equal(balanceOfDevWalletAfter)
    //     expect(balanceOfLPBeforeSell).to.equal(tokensToAddLiqidity)

    //     const tokensToSell = BigNumber.from(1000).mul(decimalPoints)

    //     await darwin.connect(devWallet).approve(uniswapv2Router.address, tokensToSell, {
    //         from: devWallet.address
    //     });

    //     const tnx = await uniswapv2Router.connect(devWallet).swapExactTokensForETHSupportingFeeOnTransferTokens(
    //         tokensToSell,
    //         0,
    //         [darwin.address, await uniswapv2Router.WETH()],
    //         devWallet.address,
    //         await lastBlockTime() + 1000,
    //         {
    //             from: devWallet.address
    //         }
    //     )

    //     await darwin.syncTokenInOutOfSyncExchnagesSafe()

    //     const balanceOfOwnerAfterSell = await darwin.balanceOf(owner.address)
    //     const balanceOfLPAfterSell = await darwin.balanceOf(uniswapPair.address)
    //     const burnedTokens = await darwin.tBurnTotal()
    //     const comunityTokens  =  await darwin.balanceOf(darwinComunity.address)
    //     const reflectionToken = await darwin.tReflectionTotal()

    //     expect(balanceOfOwnerAfterSell.gte(balanceOfOwnerAfter)).to.be.true

    //     const expectedBurnTokens  = tokensToSell.toNumber() * .005 // .5%
    //     const expectedcomunityTokens  = tokensToSell.toNumber() * .05 // 5%


    //     expect(burnedTokens.toNumber()).to.equal(expectedBurnTokens) 
    //     expect(comunityTokens.toNumber()).to.equal(expectedcomunityTokens)
    //     expect(balanceOfLPAfterSell.sub(balanceOfLPBeforeSell)).to.equal(tokensToSell.sub(expectedBurnTokens).sub(expectedcomunityTokens))
    //     expect(reflectionToken.toNumber()).to.equal(0)
    // });


    // it("It should currectly store the unsynced amount of tokens on sell and remove it after tokns are synced", async function () {
    //     const tokensToAddLiqidity = BigNumber.from(1).mul(decimalPoints)
    //     const ethToAddLiquidity = ethers.utils.parseEther("1")

    //     await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

    //     await uniswapv2Router.addLiquidityETH(
    //         darwin.address,
    //         tokensToAddLiqidity,
    //         0,
    //         0,
    //         owner.address,
    //         await lastBlockTime() + 1000,
    //         {
    //             value: ethToAddLiquidity
    //         }
    //     )

    //     const tokensToSell = BigNumber.from(1000)

    //     { // sell tokens
    //         const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

    //         const amountOutMin = amountsOut[1] // no slipage

    //         await darwin.connect(devWallet).approve(uniswapv2Router.address, tokensToSell, {
    //             from: devWallet.address
    //         });

    //         await uniswapv2Router.connect(devWallet).swapExactTokensForETHSupportingFeeOnTransferTokens(
    //             tokensToSell,
    //             amountOutMin,
    //             [darwin.address, await uniswapv2Router.WETH()],
    //             devWallet.address,
    //             await lastBlockTime() + 1000,
    //             {
    //                 from: devWallet.address
    //             }
    //         )

    //         const unSyncedPairs = await darwin.getOutOfSyncedPairs()
    //         const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
    //         const burnedTokens = await darwin.tBurnTotal()
    //         const comunityTokens  =  await darwin.balanceOf(darwinComunity.address)

    //         expect(unSyncedPairs).to.eql([uniswapPair.address])
    //         expect(outOfSyncAmount).to.eql(burnedTokens.add(comunityTokens))
    //     }

    //     {// 2nd sale
    //         const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

    //         const amountOutMin = amountsOut[1] // no slipage

    //         await darwin.connect(devWallet).approve(uniswapv2Router.address, tokensToSell, {
    //             from: devWallet.address
    //         });

    //         const unSyncedPairsAfterApprove = await darwin.getOutOfSyncedPairs()
    //         const outOfSyncAmountAfterApprove = await darwin.getOutOfSyncedAmount(uniswapPair.address)

    //         // unsynced tokens clear
    //         expect(unSyncedPairsAfterApprove).to.eql([])
    //         expect(outOfSyncAmountAfterApprove).to.eql(BigNumber.from(0))

    //         await uniswapv2Router.connect(devWallet).swapExactTokensForETHSupportingFeeOnTransferTokens(
    //             tokensToSell,
    //             amountOutMin,
    //             [darwin.address, await uniswapv2Router.WETH()],
    //             devWallet.address,
    //             await lastBlockTime() + 1000,
    //             {
    //                 from: devWallet.address
    //             }
    //         )


    //         const expectedBurnTokens  = tokensToSell.toNumber() * .005 // .5%
    //         const expectedcomunityTokens  = tokensToSell.toNumber() * .05 // 5%

    //         const unSyncedPairs = await darwin.getOutOfSyncedPairs()
    //         const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)

    //         expect(unSyncedPairs).to.eql([uniswapPair.address])
    //         expect(outOfSyncAmount).to.equal(expectedBurnTokens + expectedcomunityTokens)

    //     }

    // });

    // it("It should currectly store the unsynced amount of tokens on consecutive sells", async function () {
    //     const tokensToAddLiqidity = BigNumber.from(1).mul(decimalPoints)
    //     const ethToAddLiquidity = ethers.utils.parseEther("1")

    //     await darwin.approve(uniswapv2Router.address, tokensToAddLiqidity)

    //     await uniswapv2Router.addLiquidityETH(
    //         darwin.address,
    //         tokensToAddLiqidity,
    //         0,
    //         0,
    //         owner.address,
    //         await lastBlockTime() + 1000,
    //         {
    //             value: ethToAddLiquidity
    //         }
    //     )

    //     const tokensToSell = BigNumber.from(1000)

    //     const expectedBurnTokens  = tokensToSell.toNumber() * .005 // .5%
    //     const expectedcomunityTokens  = tokensToSell.toNumber() * .05 // 5%

    //     const missingTokensFromExchange = expectedBurnTokens + expectedcomunityTokens

    //     await darwin.connect(devWallet).approve(uniswapv2Router.address, tokensToSell.mul(4), {
    //         from: devWallet.address
    //     });

    //     {
    //         const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

    //         const amountOutMin = amountsOut[1] // no slipage

    //         await uniswapv2Router.connect(devWallet).swapExactTokensForETHSupportingFeeOnTransferTokens(
    //             tokensToSell,
    //             amountOutMin,
    //             [darwin.address, await uniswapv2Router.WETH()],
    //             devWallet.address,
    //             await lastBlockTime() + 1000,
    //             {
    //                 from: devWallet.address
    //             }
    //         )

    //         const unSyncedPairs = await darwin.getOutOfSyncedPairs()
    //         const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
    //         const balanceOfPair = await darwin.balanceOf(uniswapPair.address)

    //         expect(unSyncedPairs).to.eql([uniswapPair.address])
    //         expect(outOfSyncAmount).to.equal(missingTokensFromExchange)
    //         expect(balanceOfPair).to.eql(tokensToSell.add(tokensToAddLiqidity))
    //     }

    //     {
    //         const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

    //         const amountOutMin = amountsOut[1].mul(100 - 10).div(100) // 10 % slipage

    //         await uniswapv2Router.connect(devWallet).swapExactTokensForETHSupportingFeeOnTransferTokens(
    //             tokensToSell,
    //             amountOutMin,
    //             [darwin.address, await uniswapv2Router.WETH()],
    //             devWallet.address,
    //             await lastBlockTime() + 1000,
    //             {
    //                 from: devWallet.address
    //             }
    //         )

    //         const unSyncedPairs = await darwin.getOutOfSyncedPairs()
    //         const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
    //         const balanceOfPair = await darwin.balanceOf(uniswapPair.address)

    //         expect(unSyncedPairs).to.eql([uniswapPair.address])
    //         expect(outOfSyncAmount).to.equal(missingTokensFromExchange * 2)
    //         expect(balanceOfPair).to.eql(tokensToSell.mul(2).add(tokensToAddLiqidity))
    //     }

    //     let boughtTokens : BigNumber;

    //     {
    //         const amountsOut = await uniswapv2Router.getAmountsOut(ethers.utils.parseEther("0.5"), [await uniswapv2Router.WETH(), darwin.address])

    //         const amountOutMin = amountsOut[1].mul(100 - 10).div(100) // 10 % slipage

    //         await uniswapv2Router.connect(devWallet).swapExactETHForTokensSupportingFeeOnTransferTokens(
    //             amountOutMin,
    //             [await uniswapv2Router.WETH(), darwin.address],
    //             devWallet.address,
    //             await lastBlockTime() + 1000,
    //             {
    //                 from: devWallet.address,
    //                 value: ethers.utils.parseEther("0.5")
    //             }
    //         )

    //         boughtTokens = amountsOut[1]

    //         const unSyncedPairs = await darwin.getOutOfSyncedPairs()
    //         const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
    //         const balanceOfPair = await darwin.balanceOf(uniswapPair.address)

    //         expect(unSyncedPairs).to.eql([uniswapPair.address])
    //         expect(outOfSyncAmount).to.equal(missingTokensFromExchange * 2)
    //         expect(balanceOfPair).to.equal(tokensToSell.mul(2).add(tokensToAddLiqidity).sub(boughtTokens))
    //     }

    //     {

    //         const balanceOfPairBeforeSync = await darwin.balanceOf(uniswapPair.address)

    //         await darwin.transfer(devWallet.address, tokensToSell);

    //         const unSyncedPairs = await darwin.getOutOfSyncedPairs()
    //         const outOfSyncAmount = await darwin.getOutOfSyncedAmount(uniswapPair.address)
    //         const balanceOfPairAfterSync = await darwin.balanceOf(uniswapPair.address)

    //         expect(unSyncedPairs).to.eql([])
    //         expect(outOfSyncAmount).to.eql(BigNumber.from(0))
    //         expect(balanceOfPairAfterSync).to.equal(tokensToSell.mul(2).add(tokensToAddLiqidity).sub(missingTokensFromExchange * 2).sub(boughtTokens))
    //         expect(balanceOfPairBeforeSync.sub(balanceOfPairAfterSync)).equal(missingTokensFromExchange * 2)
    //     }

    // });

});
