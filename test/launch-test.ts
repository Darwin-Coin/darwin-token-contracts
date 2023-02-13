// Darwin Protocol launch test.

import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";

import { DarwinCommunity, TestRouter } from "../typechain-types";
import { Darwin, DarwinPresale, DarwinPrivateSale } from "../typechain-types/contracts";

describe("Launch", function () {






  async function deployFixture() {
    const [owner, addr1, addr2] = await hardhat.ethers.getSigners();
    const darwinPresaleFactory = await ethers.getContractFactory("DarwinPresale");
    const darwinPrivateSaleFactory = await ethers.getContractFactory("DarwinPrivateSale");
    const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
    const darwinFactory = await ethers.getContractFactory("Darwin");
    const testRouterFactory = await ethers.getContractFactory("TestRouter");
    const presale = await darwinPresaleFactory.deploy() as DarwinPresale;
    const privateSale = await darwinPrivateSaleFactory.deploy() as DarwinPrivateSale;
    const community = await upgrades.deployProxy(
      darwinCommunityFactory,
      [],
      {
        initializer: "initialize"
      }
    ) as DarwinCommunity;
    const darwin = await upgrades.deployProxy(
      darwinFactory,
      [presale.address, privateSale.address, community.address],
      {
        initializer: "initialize"
      }
    ) as Darwin;
    const router = await testRouterFactory.deploy() as TestRouter;
    const PRIVATESALE_START = (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;
    await privateSale.init(darwin.address, PRIVATESALE_START + 1);
    await presale.init(darwin.address);
    await community.setDarwinAddress(darwin.address);
    await presale.setRouter(router.address);
    const wallet1 = "0x0bF1C4139A6168988Fe0d1384296e6df44B27aFd";
    const wallet2 = "0xBE013CeAB3611Dc71A4f150577375f8Cb8d9f6c3";
    return {presale, privateSale, community, darwin, router, owner, addr1, addr2, wallet1, wallet2};
  }






  // PRESALE
  describe("Presale", function () {
    it("We can activate presale whenever", async function () {
      const { presale } = await loadFixture(deployFixture);
      await expect(await presale.startPresale()).to.not.be.reverted;
    });

    it("When BNB is sent to contract it automatically pays the buyer based on the tier", async function () {
      const { presale, darwin, owner } = await loadFixture(deployFixture);
      await presale.startPresale();
      const darwinAmount = await presale.calculateDarwinAmount(ethers.utils.parseEther("1.0"));
      await expect(
        await presale.userDeposit({value: ethers.utils.parseEther("1.0")})
      ).to.changeTokenBalance(darwin, owner, darwinAmount);
    });

    it("When BNB is sent to contract 30% is sent to Wallet 1", async function () {
      const { presale, wallet1 } = await loadFixture(deployFixture);
      await presale.startPresale();
      await expect(
        await presale.userDeposit({value: ethers.utils.parseEther("1.0")})
      ).to.changeEtherBalance(wallet1, ethers.utils.parseEther("0.3"));
    });

    it("When BNB is sent to contract 70% goes into it", async function () {
      const { presale } = await loadFixture(deployFixture);
      await presale.startPresale();
      await expect(
        await presale.userDeposit({value: ethers.utils.parseEther("1.0")})
      ).to.changeEtherBalance(presale, ethers.utils.parseEther("0.7"));
    });

    it("Once pre-sale ends 20% of BNB is sent to Wallet 2 and 5% of BNB is sent to Wallet 1", async function () {
      const { presale, wallet1, wallet2 } = await loadFixture(deployFixture);
      await presale.startPresale();
      await presale.userDeposit({value: ethers.utils.parseEther("100.0")});
      await time.increase(90 * 86400);
      const raised = (await presale.status()).raisedAmount;
      await expect(
        await presale.provideLpAndWithdrawTokens()
      ).to.changeEtherBalances([wallet1, wallet2], [raised.mul(5).div(100), raised.mul(20).div(100)]);
    });

    it("We can set the router address to create the LP at any time", async function () {
      const { presale, wallet1 } = await loadFixture(deployFixture);
      await expect(await presale.setRouter(wallet1)).to.not.be.reverted;
    });

    it ("60,000,000 $DARWIN in contract – 50,000,000 for pre-sale / 10,000,000 for LP creation", async function () {
      const { presale, darwin } = await loadFixture(deployFixture);
      const darwinPresaleBalance = await darwin.balanceOf(presale.address);
      const darwinForLP = await presale.LP_AMOUNT();
      expect(
        darwinPresaleBalance
      ).to.be.equal(darwinForLP.add(ethers.utils.parseEther("50000000")));
    });

    it ("MIN Purchase = 0.1BNB", async function () {
      const { presale } = await loadFixture(deployFixture);
      expect(
        await presale.RAISE_MIN()
      ).to.be.equal(ethers.utils.parseEther("0.1"));
    });

    it ("MAX Purchase = 4,000BNB", async function () {
      const { presale } = await loadFixture(deployFixture);
      expect(
        await presale.RAISE_MAX()
      ).to.be.equal(ethers.utils.parseEther("4000"));
    });
  });






  // PRIVATE SALE
  describe("Private Sale", function () {
    it("When BNB sent to contract it automatically pays the buyer 600 $DARWIN per 1 BNB", async function () {
      const { privateSale, darwin, owner } = await loadFixture(deployFixture);
      await expect(
        await privateSale.userDeposit({value: ethers.utils.parseEther("1")})
      ).to.changeTokenBalance(darwin, owner, ethers.utils.parseEther("600"));
    });

    it("When BNB sent to contract the BNB is sent straight to Wallet 1", async function () {
      const { privateSale, wallet1 } = await loadFixture(deployFixture);
      await expect(
        await privateSale.userDeposit({value: ethers.utils.parseEther("1")})
      ).to.changeEtherBalance(wallet1, ethers.utils.parseEther("1"));
    });

    it("Any unsold $DARWIN are sent to Wallet 1 at end of private sale", async function () {
      const { privateSale, darwin, wallet1 } = await loadFixture(deployFixture);
      await privateSale.userDeposit({value: ethers.utils.parseEther("100.0")});
      await time.increase(14 * 86400);
      const balance = darwin.balanceOf(privateSale.address);
      expect(
        await privateSale.withdrawUnsoldDarwin()
      ).to.changeTokenBalance(darwin, wallet1, balance);
    });

    it ("250,000 $DARWIN in contract", async function () {
      const { privateSale, darwin } = await loadFixture(deployFixture);
      expect(
        await darwin.balanceOf(privateSale.address)
      ).to.be.equal(ethers.utils.parseEther("250000"));
    });

    it ("MIN Purchase = 0.1BNB", async function () {
      const { privateSale } = await loadFixture(deployFixture);
      expect(
        await privateSale.RAISE_MIN()
      ).to.be.equal(ethers.utils.parseEther("0.1"));
    });
  });






  // COMMUNITY
  describe("Community", function () {
    it("Proposals work for the $DARWIN contract so that we can update things if we need to", async function () {
      const { community, darwin } = await loadFixture(deployFixture);
      expect(await darwin.isPaused()).to.be.true;
      const timestamp = await time.latest();
      await darwin.approve(community.address, ethers.utils.parseEther("1000000"));
      const proposalId = await community.callStatic.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Eddaje","Eddajeeeeeeeeee","Eddaje",timestamp + (3 * 86400));
      await community.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Eddaje","Eddajeeeeeeeeee","Eddaje",timestamp + (3 * 86400));
      await time.increase(2 * 86400);
      await community.castVote(proposalId, true, ethers.utils.parseEther("1"));
      await time.increase(2 * 86400);
      await community.execute(proposalId);
      expect(await darwin.isPaused()).to.be.false;
    });

    it("Users can access DarwinCommunity (propose) with min 1 $DARWIN", async function () {
      const { community, darwin, addr1, presale } = await loadFixture(deployFixture);
      let timestamp = await time.latest();
      darwin.transfer(addr1.address, ethers.utils.parseEther("0.99"));
      await presale.startPresale();
      await time.increase(91 * 86400);
      timestamp = await time.latest();
      await presale.provideLpAndWithdrawTokens();
      const community1 = community.connect(addr1);
      await darwin.connect(addr1).approve(community.address, ethers.utils.parseEther("10000"));
      // Expect a proposal made by someone with less than 1 darwin to be reverted
      await expect(
        community1.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Eddaje","Eddajeeeeeeeeee","Eddaje",timestamp + (3 * 86400))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      darwin.transfer(addr1.address, ethers.utils.parseEther("0.01"));
      await expect(
        await community1.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Eddaje","Eddajeeeeeeeeee","Eddaje",timestamp + (3 * 86400))
      ).to.not.be.reverted;
    });

    it("Users can vote on proposals by submitting $DARWIN tokens", async function () {
      const { community, darwin, addr1, presale } = await loadFixture(deployFixture);
      let timestamp = await time.latest();
      darwin.transfer(addr1.address, ethers.utils.parseEther("2"));
      await presale.startPresale();
      await time.increase(91 * 86400);
      timestamp = await time.latest();
      await presale.provideLpAndWithdrawTokens();
      const community1 = community.connect(addr1);
      await darwin.connect(addr1).approve(community.address, ethers.utils.parseEther("10000"));
      await community1.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Eddaje","Eddajeeeeeeeeee","Eddaje",timestamp + (3 * 86400))
      await time.increase(2 * 86400);
      await expect(
        await community1.castVote(1, true, ethers.utils.parseEther("1"))
      ).to.not.be.reverted;
    });

    it("Non-allowed users cannot make proposals with restricted signatures", async function () {
      const { community, darwin, addr1, presale } = await loadFixture(deployFixture);
      let timestamp = await time.latest();
      darwin.transfer(addr1.address, ethers.utils.parseEther("2"));
      await presale.startPresale();
      await time.increase(91 * 86400);
      timestamp = await time.latest();
      await presale.provideLpAndWithdrawTokens();
      const community1 = community.connect(addr1);
      await darwin.connect(addr1).approve(community.address, ethers.utils.parseEther("10000"));
      const data = ethers.utils.defaultAbiCoder.encode(["address"],["0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16"]);
      await expect(
        community1.propose([darwin.address],[0],["upgradeTo(address)"],[data],"Eddaje","Eddajeeeeeeeeee","Eddaje",timestamp + (3 * 86400))
      ).to.be.revertedWith("DC::propose:Proposal signature restricted");
    })
  });
});