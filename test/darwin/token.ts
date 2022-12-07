import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Darwin, DarwinCommunity, IUniswapV2Router02, IUniswapV2Pair } from "../../typechain-types";
import { IPancakePair__factory } from "../../typechain-types";
import { PancakeRouter__factory } from "../../typechain-types";
import { deploy } from "../utils";

describe("Darwin : Token", function () {

    let darwin: Darwin
    let darwinCommunity: DarwinCommunity
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
        darwinCommunity = deployedContract.darwinCommunity;
        uniswapv2Router = PancakeRouter__factory.connect(await darwin.uniswapV2Router(), owner);
        uniswapPair = IPancakePair__factory.connect(await darwin.uniswapV2Pair(), owner);
    })


    it("Should have correct tokens in dev wallet and owner wallet", async function () {

        const totalSupply = ethers.utils.parseEther("10000000000") // 10 B
        
        const devWalletTokens = totalSupply.div(100).mul(10)
        const ownerTokens = totalSupply.sub(devWalletTokens)

        const balanceOfOwner = await darwin.balanceOf(owner.address)
        const balanceOfDevWallet = await darwin.balanceOf(devWallet.address)

        expect(ownerTokens).equal(balanceOfOwner)
        expect(balanceOfDevWallet).equal(devWalletTokens)

    });

    it("Users should be able to send tokens", async function () {
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

    it("allowance should work", async () => {
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

});
