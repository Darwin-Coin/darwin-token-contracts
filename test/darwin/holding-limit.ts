import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Darwin, DarwinCommunity, IUniswapV2Router02, IUniswapV2Pair } from "../../typechain-types";
import { IPancakePair__factory } from "../../typechain-types";
import { PancakeRouter__factory } from "../../typechain-types";
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
        const expectedHoldingLimit = (await darwin.totalSupply()).div(100).mul(2) // 2% of the supply. 
        const actualHoldingLimit = await darwin.maxTokenHoldingSize()


        expect(expectedHoldingLimit).to.be.equal(actualHoldingLimit);

    });

    it("It should enforce holding limit", async function () {
        const tokensToTransfer = (await darwin.maxTokenHoldingSize()).add(1)

        const isExcudedFromHoldingLimit  = await darwin.isExcludedFromHoldingLimit(address0.address)
    
        expect(isExcudedFromHoldingLimit).to.be.false;

    
        const tnx  = darwin.transfer(address0.address, tokensToTransfer);

        await expect(tnx).to.be.revertedWithCustomError(darwin, "HoldingLimitExceeded");

    });

    it("It should not enforce holding limit for excluded wallet", async function () {
        const tokensToTransfer = (await darwin.maxTokenHoldingSize()).add(1)

        const isExcudedFromHoldingLimit  = await darwin.isExcludedFromHoldingLimit(devWallet.address)
    
        expect(isExcudedFromHoldingLimit).to.be.true;

    
        const tnx  = await darwin.transfer(devWallet.address, tokensToTransfer);

    });
});
