import { expect } from 'chai';
import { BigNumber } from "ethers"
import hre, { ethers } from "hardhat";
import { setNetworkTimeStamp } from "../../scripts/utils";
import { DarwinEcosystem,
        DarwinCommunity,
        DarwinPresale,
        IUniswapV2Pair
        ,IUniswapV2Router02,
        Darwin,
        Finch,
        IUniswapV2Router02__factory,
        IUniswapV2Factory,
        IUniswapV2Factory__factory
    } from "../../typechain-types/";
import { deployContracts, deployContractsDarwin } from "./utils";
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
    let token: Darwin
    let finch: Finch
    let darwinCommunity:DarwinCommunity

    let uniswapRouterAddress:string

    let router: IUniswapV2Router02

    let owner: SignerWithAddress
    let address0: SignerWithAddress

    let others: SignerWithAddress[]

    let weth:string


    before(async () => {
        [owner,address0,  ...others] = await ethers.getSigners()
    })

    describe("Deployments", () => {

        beforeEach(async () => {

            uniswapRouterAddress = await getUniswapRouterAddress(hre.network.name);
            router = IUniswapV2Router02__factory.connect(
              uniswapRouterAddress,
              owner
            );
            const factory = IUniswapV2Factory__factory.connect(
              await router.factory(),
              owner
            );
            weth = await router.WETH();

            const deployedContract = await deployContractsDarwin(uniswapRouterAddress, owner.address);
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

            await expect(initDarwinPresale(darwinPresale, token.address, finch.address, owner)).to.be.revertedWithCustomError(darwinPresale, "AlreadyInitialized");

        })

        it("cant initialize with zero address", async() => {

            await expect(initDarwinPresale(darwinPresale, ethers.constants.AddressZero, finch.address, owner)).to.be.revertedWithCustomError(darwinPresale, "ZeroAddress");
            await expect(initDarwinPresale(darwinPresale, token.address, ethers.constants.AddressZero, owner)).to.be.revertedWithCustomError(darwinPresale, "ZeroAddress");

        })

        it("start time has to be initialized in the future", async() => {

            await expect(darwinPresale.connect(owner).init(token.address, finch.address, await lastBlockTime(), daysToSeconds(20).add(await lastBlockTime()))
                ).to.be.revertedWithCustomError(darwinPresale, "InvalidStartDate");

        })

        it("end time has to be after start", async() => {

            let startTime:BigNumber = await daysToSeconds(1).add(await lastBlockTime())

            await expect(darwinPresale.connect(owner).init(token.address, finch.address, startTime, startTime.sub(1))
                ).to.be.revertedWithCustomError(darwinPresale, "InvalidEndDate");

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
