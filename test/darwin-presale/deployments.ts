import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { setNetworkTimeStamp, getUniswapRouterAddress, daysToSeconds, lastBlockTime } from "../../scripts/utils";
import {
  DarwinEcosystem,
  DarwinPresale,
  IUniswapV2Pair,
  IUniswapV2Router02,
  IUniswapV2Factory__factory,
  IUniswapV2Router02__factory,
  TestErc20Token,
  PancakeFactory,
} from "../../typechain";
import { deployContracts } from "./utils";
import { sign } from "crypto";


enum Status {
  QUEUED,
  ACTIVE,
  SUCCESS,
  FAILURE,
}

describe.only("DarwinPresale : Token", function () {
  let darwinPresale: DarwinPresale;
  let darwinEcosystem: DarwinEcosystem;
  let darwin: TestErc20Token;
  let finch: TestErc20Token;

  let uniswapv2Router: IUniswapV2Router02;
  let uniswapPair: IUniswapV2Pair;

  let owner: SignerWithAddress;
  let address0: SignerWithAddress;

  let others: SignerWithAddress[];
  let marketingWallet: SignerWithAddress;
  let teamWallet: SignerWithAddress;

  let uniswapRouterAddress: string;

  const darwinAllocation = ethers.utils.parseEther("5000000000");
  const finchAllocation = ethers.utils.parseEther("10000000000000000000");

  let startTime:number;
  let endTime:number;

  before(async () => {
    [owner, address0, ...others] = await ethers.getSigners();
    marketingWallet = others[0];
    teamWallet = others[1];
  });

  beforeEach(async () => {

    startTime = (await lastBlockTime()) + 20;

    endTime = daysToSeconds(20).add(startTime).toNumber();

    const deployedContract = await deployContracts(startTime, endTime);
    darwinPresale = deployedContract.darwinPresale;
    darwinEcosystem = deployedContract.darwinEcosystem;
    darwin = deployedContract.darwin;
    finch = deployedContract.finch;

    let pancakeDeployments = await deployPancakeswap();

    uniswapRouterAddress = pancakeDeployments.pancakeRouter.address

    
    const router = pancakeDeployments.pancakeRouter;
    
    const factory = pancakeDeployments.pancakeFactory;

    darwin.mint(darwinAllocation);
    finch.mint(finchAllocation);

    const weth = await router.WETH();

    const createDarwinPair = await factory.createPair(darwin.address, weth);
    await createDarwinPair.wait();

    const createFinchPair = await factory.createPair(finch.address, weth);
    await createFinchPair.wait();

    // await createAirDrop(darwinPresale, darwinEcosystem, token);
  });

  describe("deployment", async() => {

    it("should fail deployment if contracts are zero", async() => {

      // const Darwin = await ethers.getContractFactory("TestErc20Token");

      // darwin = await Darwin.deploy();

      const DarwinPresale = await ethers.getContractFactory("DarwinPresale");

      await expect(DarwinPresale.deploy(ethers.constants.AddressZero, finch.address, startTime, endTime)).to.be.revertedWith("ZeroAddress");

    })

    it("should fail deployment if startdate is before current time", async() => {

      const DarwinPresale = await ethers.getContractFactory("DarwinPresale");

      await expect(DarwinPresale.deploy(darwin.address, finch.address, startTime - 300, endTime)).to.be.revertedWith("InvalidStartDate");
      
    })

    it("should fail deployment if endDate is before start", async() => {

      const DarwinPresale = await ethers.getContractFactory("DarwinPresale");

      await expect(DarwinPresale.deploy(darwin.address, finch.address, startTime, startTime - 1)).to.be.revertedWith("InvalidEndDate");
      
    })

    

  })

  describe("presale initialization", async() => {

    it("Should initialize presale", async function () {
    
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
    });
  
    it("Should not initialize presale if address is zero", async function () {
      await expect(darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        ethers.constants.AddressZero
      )).to.be.revertedWith("ZeroAddress");
    });
  
    
    it("Should not initialize presale if address is zero", async function () {

      const Darwin = await ethers.getContractFactory("TestErc20Token");

      darwin = await Darwin.deploy();

      const DarwinPresale = await ethers.getContractFactory("DarwinPresale");

      darwinPresale = await DarwinPresale.deploy(darwin.address, finch.address, startTime, endTime);

      await expect(darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      )).to.be.revertedWith("PairNotFound");
    });
    
  });
  
  describe("deposits", async() => {

    it("should not allow deposits if presale isn't active", async function () {
      await expect(
        darwinPresale.userDeposit({ value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("PresaleNotActive");
    });

    it("should not allow deposits before presaleStart", async function () {

      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await expect(
        darwinPresale.userDeposit({ value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("PresaleNotActive");
    });
  
    it("should revert deposit if darwin is not allocated", async function () {
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await ethers.provider.send("evm_mine", [startTime]);
  
      const balance = await finch.balanceOf(owner.address);
      console.log("balance:", balance.toString());
      await finch.transfer(darwinPresale.address, finchAllocation);
      await expect(
        darwinPresale.userDeposit({
          value: ethers.utils.parseEther("1"),
        })
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  
    it("should revert deposit if finch is not allocated", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      const balance = await darwin.balanceOf(owner.address);
      console.log("balance:", balance.toString());
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await expect(
        darwinPresale.userDeposit({
          value: ethers.utils.parseEther("1"),
        })
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  
    it("should correctly deposit bnb", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);
  
      const darwinBalanceBefore = await darwin.balanceOf(owner.address);
      const darwinPresaleBalance = await darwin.balanceOf(darwinPresale.address);
  
      const finchBalanceBefore = await finch.balanceOf(owner.address);
      const finchPresaleBalance = await finch.balanceOf(darwinPresale.address);
  
      const deposit = await darwinPresale.userDeposit({
        value: ethers.utils.parseEther("1"),
      });
  
      const darwinBalanceAfter = await darwin.balanceOf(owner.address);
      const finchBalanceAfter = await finch.balanceOf(owner.address);
  
      expect(darwinBalanceAfter).to.be.gt(darwinBalanceBefore);
      expect(finchBalanceAfter).to.be.gt(finchBalanceBefore);
  
      
    });

    it("multiple deposits don't increase numBuyers", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);
  
      const darwinBalanceBefore = await darwin.balanceOf(owner.address);
      const darwinPresaleBalance = await darwin.balanceOf(darwinPresale.address);
  
      const finchBalanceBefore = await finch.balanceOf(owner.address);
      const finchPresaleBalance = await finch.balanceOf(darwinPresale.address);

      expect(await (await darwinPresale.status()).numBuyers).to.be.equal(0);
  
      const deposit = await darwinPresale.userDeposit({
        value: ethers.utils.parseEther("1"),
      });

      expect(await (await darwinPresale.status()).numBuyers).to.be.equal(1);
  
      const darwinBalanceAfter = await darwin.balanceOf(owner.address);
      const finchBalanceAfter = await finch.balanceOf(owner.address);
  
      expect(darwinBalanceAfter).to.be.gt(darwinBalanceBefore);
      expect(finchBalanceAfter).to.be.gt(finchBalanceBefore);

      await darwinPresale.userDeposit({
        value: ethers.utils.parseEther("1"),
      });

      expect(await (await darwinPresale.status()).numBuyers).to.be.equal(1);
  
      
    });

    it("should fail if below min deposit", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      const minDeposit = (await darwinPresale.RAISE_MIN()).sub(1);
  
      await expect(darwinPresale.userDeposit({
        value: minDeposit,
      })).to.be.revertedWith("InvalidDepositAmount");  
      
    });

    it("should fail if above max deposit", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      const maxDeposit = await (await darwinPresale.RAISE_MAX()).add(1);
  
      await expect(darwinPresale.userDeposit({
        value: maxDeposit,
      })).to.be.revertedWith("InvalidDepositAmount");  
      
    });

  });

  describe("stages", async() => {

    it("transfers to the next stage after enough tokens have been deposited", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);
  
      const darwinBalanceBefore = await darwin.balanceOf(owner.address);
      const darwinPresaleBalance = await darwin.balanceOf(darwinPresale.address);
  
      const finchBalanceBefore = await finch.balanceOf(owner.address);
      const finchPresaleBalance = await finch.balanceOf(darwinPresale.address);

      let toDeposit = 5000;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      //const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(1);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(1);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount));

    })

    it("transfers to the next 2nd stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);
  
      const darwinBalanceBefore = await darwin.balanceOf(owner.address);
      const darwinPresaleBalance = await darwin.balanceOf(darwinPresale.address);
  
      const finchBalanceBefore = await finch.balanceOf(owner.address);
      const finchPresaleBalance = await finch.balanceOf(darwinPresale.address);

      let toDeposit = 17_569;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      //const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(1);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(2);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount));

    })

    it("transfers to the next 3rd stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);
  
      const darwinBalanceBefore = await darwin.balanceOf(owner.address);
      const darwinPresaleBalance = await darwin.balanceOf(darwinPresale.address);
  
      const finchBalanceBefore = await finch.balanceOf(owner.address);
      const finchPresaleBalance = await finch.balanceOf(darwinPresale.address);

      let toDeposit = 31_063;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);

      //const 4thStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(3);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount).sub(thirdStageAmount));

    })

    it("transfers to the next 4th stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);
  
      const darwinBalanceBefore = await darwin.balanceOf(owner.address);
      const darwinPresaleBalance = await darwin.balanceOf(darwinPresale.address);
  
      const finchBalanceBefore = await finch.balanceOf(owner.address);
      const finchPresaleBalance = await finch.balanceOf(darwinPresale.address);

      let toDeposit = 45_545;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);

      const fourthStageAmount = ethers.utils.parseEther("1").mul(41_000).mul(14_482);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(4);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount).sub(thirdStageAmount).sub(fourthStageAmount));

    })

    it("transfers to the next 5th stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      let toDeposit = 61_170;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);

      const fourthStageAmount = ethers.utils.parseEther("1").mul(41_000).mul(14_482);

      const fifthStageAmount = ethers.utils.parseEther("1").mul(38_000).mul(15_625);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(5);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount).sub(thirdStageAmount).sub(fourthStageAmount).sub(fifthStageAmount));

    });

    it("transfers to the next 6th stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      let toDeposit = 78_135;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);

      const fourthStageAmount = ethers.utils.parseEther("1").mul(41_000).mul(14_482);

      const fifthStageAmount = ethers.utils.parseEther("1").mul(38_000).mul(15_625);

      const sixthStageAmount = ethers.utils.parseEther("1").mul(35_000).mul(16_965);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(6);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount).sub(thirdStageAmount).sub(fourthStageAmount).sub(fifthStageAmount)
      .sub(sixthStageAmount));

    });

    it("transfers to the next 7th stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      let toDeposit = 96_690;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);

      const fourthStageAmount = ethers.utils.parseEther("1").mul(41_000).mul(14_482);

      const fifthStageAmount = ethers.utils.parseEther("1").mul(38_000).mul(15_625);

      const sixthStageAmount = ethers.utils.parseEther("1").mul(35_000).mul(16_965);

      const seventhStageAmount = ethers.utils.parseEther("1").mul(32_000).mul(18_555);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(7);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount).sub(thirdStageAmount).sub(fourthStageAmount).sub(fifthStageAmount)
      .sub(sixthStageAmount).sub(seventhStageAmount));

    });

    it("transfers to the next 8th stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      let toDeposit = 117_164;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);

      const fourthStageAmount = ethers.utils.parseEther("1").mul(41_000).mul(14_482);

      const fifthStageAmount = ethers.utils.parseEther("1").mul(38_000).mul(15_625);

      const sixthStageAmount = ethers.utils.parseEther("1").mul(35_000).mul(16_965);

      const seventhStageAmount = ethers.utils.parseEther("1").mul(32_000).mul(18_555);

      const eigthStageAmount = ethers.utils.parseEther("1").mul(29_000).mul(20_474);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(8);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount).sub(thirdStageAmount).sub(fourthStageAmount).sub(fifthStageAmount)
      .sub(sixthStageAmount).sub(seventhStageAmount).sub(eigthStageAmount));

    });

    it("transfers to the next 9th stage with correct amounts", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      let toDeposit = 140_000;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      const firstStageAmount = ethers.utils.parseEther("1").mul(50000).mul(5000);

      const secondStageAmount = ethers.utils.parseEther("1").mul(47000).mul(12569);

      const thirdStageAmount = ethers.utils.parseEther("1").mul(44000).mul(13_494);

      const fourthStageAmount = ethers.utils.parseEther("1").mul(41_000).mul(14_482);

      const fifthStageAmount = ethers.utils.parseEther("1").mul(38_000).mul(15_625);

      const sixthStageAmount = ethers.utils.parseEther("1").mul(35_000).mul(16_965);

      const seventhStageAmount = ethers.utils.parseEther("1").mul(32_000).mul(18_555);
      
      const eigthStageAmount = ethers.utils.parseEther("1").mul(29_000).mul(20_474);

      const ninthStageAmount = ethers.utils.parseEther("1").mul(26_131).mul(22_836);
  
      expect(await darwinPresale.getCurrentStage()).to.be.eq(8);

      expect(await darwin.balanceOf(darwinPresale.address)).to.be.equal(darwinAllocation.sub(firstStageAmount).sub(secondStageAmount).sub(thirdStageAmount).sub(fourthStageAmount).sub(fifthStageAmount)
      .sub(sixthStageAmount).sub(seventhStageAmount).sub(eigthStageAmount).sub(ninthStageAmount));

    });

    it("fails if exceeds hardcap", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      let toDeposit = 140_000;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

      await expect(darwinPresale.connect(others[i]).userDeposit({
        value: ethers.utils.parseEther("1"),
      })).to.be.revertedWith("PresaleNotActive");

      await expect(darwinPresale.calculateDarwinAmount(ethers.utils.parseEther("1"))).to.be.revertedWith("AmountExceedsHardcap");

    });

  });

  describe("tiers", async() => {

    it("properly sets a users tier", async() => {

      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      const ethTeirDepositAmount= [0.1, 1, 2.5, 5, 10, 50, 400];

      const signer:SignerWithAddress = others[5];

      expect(await darwinEcosystem.connect(signer).getPresaleTier(signer.address)).to.be.equal(0);

      let currentDeposit = 0;

      for(let i = 0; i < ethTeirDepositAmount.length; i++) {

        let amount = ethTeirDepositAmount[i] - currentDeposit;

        const deposit = await darwinPresale.connect(signer).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        expect(await darwinEcosystem.getPresaleTier(signer.address)).to.be.equal(i);

        currentDeposit += amount;


      }

    })

  })

  describe("setters", async() => {

    it("can set ecosystem", async() => {

      await darwinPresale.setDarwinEcosystem(ethers.constants.AddressZero);

    })

    it("sets end date correctly", async() => {

      await darwinPresale.setPresaleEndDate(endTime + 10);

      await expect(darwinPresale.setPresaleEndDate(startTime - 1)).to.be.revertedWith("InvalidEndDate");

    })

    it("sets wallets", async() => {

      await expect(darwinPresale.setWallets(ethers.constants.AddressZero, ethers.constants.AddressZero)).to.be.revertedWith("ZeroAddress");

      await darwinPresale.setWallets(others[5].address, others[6].address);

    })

  })

  describe.only("withdraw funds and deposit liquidity", async() => {

    it("can withdraw if presale is funded", async() => {

        await fundPresale();

        await darwinPresale.provideLpAndWithdrawTokens();

    });

  })

  async function fundPresale() {

    const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const timestamp = block.timestamp;
      const presaleStart = timestamp + 10;
  
      await darwinPresale.initPresale(
        uniswapRouterAddress,
        darwinEcosystem.address,
        marketingWallet.address,
        teamWallet.address
      );
  
      await setNetworkTimeStamp(BigNumber.from(presaleStart));
  
      await darwin.transfer(darwinPresale.address, darwinAllocation);
      await finch.transfer(darwinPresale.address, finchAllocation);

      let toDeposit = 140_000;

      const maxDeposit = 4000;

      let i = 0;

      while(toDeposit > 0) {

        let amount;

        if(maxDeposit > toDeposit) {
          amount = toDeposit;
        } else {
          amount = maxDeposit;
        }

        const deposit = await darwinPresale.connect(others[i]).userDeposit({
          value: ethers.utils.parseEther(amount.toString()),
        });

        toDeposit -= amount;
        i++;

      }

  }

  async function deployPancakeswap() {
    // Hardhat always runs the compile task when running scripts with its command
    const [owner, ...others] = await ethers.getSigners()

    const WBNB = await ethers.getContractFactory("WBNB")
    const PancakeFactory = await ethers.getContractFactory("PancakeFactory");
    const PancakeRouter01 = await ethers.getContractFactory("PancakeRouter01");
    const PancakeRouter = await ethers.getContractFactory("PancakeRouter");


    const wBNB = await WBNB.deploy();
    const pancakeFactory = await PancakeFactory.deploy(owner.address) as PancakeFactory
    const pancakeRouter01 = await PancakeRouter01.deploy(pancakeFactory.address, wBNB.address)
    const pancakeRouter = await PancakeRouter.deploy(pancakeFactory.address, wBNB.address) as IUniswapV2Router02

    // console.log(` INIT_CODE_PAIR_HASH: ${await pancakeFactory.INIT_CODE_PAIR_HASH()}`)

    return {
        wBNB: wBNB,
        pancakeFactory: pancakeFactory,
        pancakeRouter01: pancakeRouter01,
        pancakeRouter: pancakeRouter
    }
}

  
  

  

  //   it("Users should be able to deposit base token", async function () {
  //     const decimals = BigNumber.from(10 ** (await darwin.decimals()));
  //     const info = await darwinPresale.presaleInfo();
  //     const tokensPerETH = BigNumber.from(200 * 1000).mul(decimals);

  //     const slippage = BigNumber.from(100);

  //     await setNetworkTimeStamp(info.presaleStart.add(10));

  //     await darwinPresale.connect(address0).userDeposit({
  //       value: ethers.utils.parseEther("2"),
  //     });

  //     const owned = await darwinPresale.tokensOwned(address0.address);

  //     expect(
  //       owned.gte(tokensPerETH.mul(2).sub(slippage)) &&
  //         owned.lte(tokensPerETH.mul(2).add(slippage))
  //     );
  //   });

  //   it("Users should get correct amount of tokens", async function () {
  //     const decimals = BigNumber.from(10 ** (await token.decimals()));
  //     const info = await darwinPresale.presaleInfo();
  //     const lockDuration = await darwinPresale.lockDelay();

  //     const tokensPerETH = BigNumber.from(200 * 1000).mul(decimals);

  //     const expectedTokens = tokensPerETH.mul(2);

  //     const slippage = BigNumber.from(100);

  //     await setNetworkTimeStamp(info.presaleStart.add(10));

  //     await darwinPresale.connect(address0).userDeposit({
  //       value: ethers.utils.parseEther("2"),
  //       from: address0.address,
  //     });

  //     const owned = await darwinPresale.tokensOwned(address0.address);

  //     expect(
  //       owned.gte(expectedTokens.sub(slippage)) &&
  //         owned.lte(expectedTokens.add(slippage))
  //     );

  //     await setNetworkTimeStamp(info.presaleEnd.add(lockDuration).add(10));

  //     const balanceBefore = await token.balanceOf(address0.address);

  //     await darwinPresale.connect(address0).userWithdrawTokens({
  //       from: address0.address,
  //     });

  //     const balanceAfter = await token.balanceOf(address0.address);

  //     const gains = balanceAfter.sub(balanceBefore);

  //     expect(
  //       gains.gte(expectedTokens.sub(slippage)) &&
  //         owned.lte(expectedTokens.add(slippage))
  //     );
  //   });
});
