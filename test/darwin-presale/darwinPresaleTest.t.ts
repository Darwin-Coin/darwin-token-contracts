import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from "ethers"
import { setNetworkTimeStamp } from "../../scripts/utils";
import { DarwinEcosystem, DarwinPresale, IUniswapV2Pair, IUniswapV2Router02, TestErc20Token, Finch } from "../../typechain/";
import { deployContracts } from "./utils";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { daysToSeconds, getUniswapRouterAddress, lastBlockTime } from "../../scripts/utils"

enum Status {
    QUEUED,
    ACTIVE,
    SUCCESS,
    FAILURE
}

describe("Darwin : Presale", function () {

    let darwinPresale: DarwinPresale
    let darwinEcosystem: DarwinEcosystem
    let token: TestErc20Token
    let finch: TestErc20Token

    let uniswapv2Router: IUniswapV2Router02
    let uniswapPair: IUniswapV2Pair

    let owner: SignerWithAddress
    let address0: SignerWithAddress

    let others: SignerWithAddress[]

    before(async () => {
        [owner,address0,  ...others] = await ethers.getSigners()
    })

    describe("Deployments", () => {

        beforeEach(async () => {
            const deployedContract = await deployContracts();
            darwinPresale = deployedContract.darwinPresale;
            darwinEcosystem = deployedContract.darwinEcosystem
            token = deployedContract.darwin;
            finch = deployedContract.finch;
            //await  createAirDrop(darwinPresale,darwinEcosystem,token)
        })
    
        it("should deploy", async () => {
    
            expect(darwinPresale.address).to.not.be.equal(ethers.constants.AddressZero);
        
        })

        it("should initialize the drop", async() => {
            await initDarwinPresale(darwinPresale, token.address, finch.address, owner);

        })

        it("cant be initialized twice", async() => {

            await initDarwinPresale(darwinPresale, token.address, finch.address, owner);

            await expect(initDarwinPresale(darwinPresale, token.address, finch.address, owner)).to.be.revertedWith("AlreadyInitialized");

        })

        it("cant initialize with zero address", async() => {

            await expect(initDarwinPresale(darwinPresale, ethers.constants.AddressZero, finch.address, owner)).to.be.revertedWith("ZeroAddress");
            await expect(initDarwinPresale(darwinPresale, token.address, ethers.constants.AddressZero, owner)).to.be.revertedWith("ZeroAddress");

        })

        it("start time has to be initialized in the future", async() => {

            await expect(darwinPresale.connect(owner).init(token.address, finch.address, await lastBlockTime(), daysToSeconds(20).add(await lastBlockTime()))
                ).to.be.revertedWith("InvalidStartDate");

        })

        it("end time has to be after start", async() => {

            let startTime:BigNumber = await daysToSeconds(1).add(await lastBlockTime())

            await expect(darwinPresale.connect(owner).init(token.address, finch.address, startTime, startTime.sub(1))
                ).to.be.revertedWith("InvalidEndDate");

        })

    });


    async function initDarwinPresale(darwinPresale:DarwinPresale, darwin:string, finch: string, signer:SignerWithAddress) {

        await darwinPresale.connect(signer).init(
            darwin,
            finch,
            await daysToSeconds(1).add(await lastBlockTime()),
            daysToSeconds(20).add(await lastBlockTime())
        )
    
    }
    

});
