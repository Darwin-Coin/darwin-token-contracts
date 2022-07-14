import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Darwin, DarwinCommunity, IUniswapV2Pair, IUniswapV2Router02 } from "../../typechain";
import { IPancakePair__factory } from "../../typechain/factories/IPancakePair__factory";
import { PancakeRouter__factory } from "../../typechain/factories/PancakeRouter__factory";
import { deploy } from "../utils";


const decimalPoints = BigNumber.from((10 ** 9))

describe("Darwin : Holding Limits", function () {

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



    it("It should have correct holding limit", async function () {
        const expectedHoldingLimit = (await darwin.totalSupply()).div(100) // 1% of the supply. 
        const actualHoldingLimit = await darwin.maxTokenHoldingSize()


        expect(expectedHoldingLimit).to.be.equal(actualHoldingLimit);

    });

    it("It should enforce holding limit", async function () {
        const tokensToTransfer = (await darwin.maxTokenHoldingSize()).add(1)

        const isExcudedFromHoldingLimit  = await darwin.isExcludedFromHoldingLimit(address0.address)
    
        expect(isExcudedFromHoldingLimit).to.be.false;

    
        const tnx  = darwin.transfer(address0.address, tokensToTransfer);

        await expect(tnx).to.be.revertedWith("Darwin::enforceHoldingLimit: receiver holding limit exceeded");

    });

    it("It should not enforce holding limit for excluded wallet", async function () {
        const tokensToTransfer = (await darwin.maxTokenHoldingSize()).add(1)

        const isExcudedFromHoldingLimit  = await darwin.isExcludedFromHoldingLimit(devWallet.address)
    
        expect(isExcudedFromHoldingLimit).to.be.true;

    
        const tnx  = await darwin.transfer(devWallet.address, tokensToTransfer);

    });

    // it("It should let selling token after 24 hours", async function () {
    //     const balanceOfOwnerBefore = await darwin.balanceOf(owner.address)

    //     const tokensToAddLiqidity = BigNumber.from(balanceOfOwnerBefore.div(2))
    //     const ethToAddLiquidity = ethers.utils.parseEther("500")

    //     await darwin.markNextSellAsLP()
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

    //     const tokensToSell = BigNumber.from(1000).mul(decimalPoints)

    //     await darwin.transfer(address0.address, tokensToSell);

    //     await setNetworkTimeStamp(hoursToSeconds(24).add(await lastBlockTime()))

    //     const amountsOut = await uniswapv2Router.getAmountsOut(tokensToSell, [darwin.address, await uniswapv2Router.WETH()])

    //     const amountOutMin = amountsOut[1].mul(100 - 10).div(100)

    //     await darwin.connect(address0).approve(uniswapv2Router.address, tokensToSell.mul(BigNumber.from(1)), {
    //         from: address0.address
    //     });

    //     const tnx = await uniswapv2Router.connect(address0).swapExactTokensForETHSupportingFeeOnTransferTokens(
    //         tokensToSell,
    //         amountOutMin,
    //         [darwin.address, await uniswapv2Router.WETH()],
    //         address0.address,
    //         await lastBlockTime() + 1000,
    //         {
    //             from: address0.address
    //         }
    //     )

    // });

});
