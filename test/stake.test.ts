// Darwin Protocol launch test.

import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

import { DarwinBurner, DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinStaking, DarwinVester5, DarwinVester7, EvoturesNFT, MultiplierNFT } from "../typechain-types/contracts";
import { ADDRESSES_ARB } from "../scripts/constants";

describe("Launch", function () {
  async function deployFixture() {
    const [owner, addr1, addr2] = await hardhat.ethers.getSigners()
    const darwinVester5Factory = await ethers.getContractFactory("DarwinVester5");
    const darwinVester7Factory = await ethers.getContractFactory("DarwinVester7");
    const evotureFactory = await ethers.getContractFactory("EvoturesNFT");
    const multiplierFactory = await ethers.getContractFactory("MultiplierNFT");
    const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
    const darwinFactory = await ethers.getContractFactory("Darwin");
    const darwinStakingFactory = await ethers.getContractFactory("DarwinStaking");
    const stakedDarwinFactory = await ethers.getContractFactory("StakedDarwin");
    const darwinBurnerFactory = await ethers.getContractFactory("DarwinBurner");
    const evotures = await evotureFactory.deploy() as EvoturesNFT;
    await evotures.deployed();
    const multiplier = await multiplierFactory.deploy() as MultiplierNFT;
    await multiplier.deployed();
    const vester5 = await darwinVester5Factory.deploy(owner.address) as DarwinVester5;
    await vester5.deployed();
    const vester7 = await darwinVester7Factory.deploy([], [], [evotures.address, multiplier.address]) as DarwinVester7;
    await vester7.deployed();
    const community = await darwinCommunityFactory.deploy(owner.address) as DarwinCommunity;
    await community.deployed();
    const darwin = await upgrades.deployProxy(
      darwinFactory,
      [
        community.address,
        vester5.address,
        vester7.address,
        owner.address, //ADDRESSES_ARB.wallet1,
        owner.address, //ADDRESSES_ARB.kieran,
        owner.address, //ADDRESSES_ARB.charity,
        owner.address, //ADDRESSES_ARB.giveaway,
        owner.address, //ADDRESSES_ARB.bounties,
        owner.address, //ADDRESSES_ARB.drop,
        0 //privateSoldDarwin
      ],
      {
        initializer: "initialize"
      }
    ) as Darwin;
    const stakedDarwin = stakedDarwinFactory.attach(await darwin.stakedDarwin());
    const staking = await darwinStakingFactory.deploy(darwin.address, stakedDarwin.address, [evotures.address, multiplier.address]) as DarwinStaking;
    await staking.deployed();
    const burner = await darwinBurnerFactory.deploy(darwin.address) as DarwinBurner;
    await burner.deployed();
    await vester5.init(darwin.address);
    await vester7.init(darwin.address);
    const fundAddress: string[] = [
      owner.address, //ADDRESSES_ARB.wallet1,
      owner.address, //ADDRESSES_ARB.wallet1,
      owner.address, //ADDRESSES_ARB.wallet1,
      owner.address, //ADDRESSES_ARB.charity,
      owner.address, //ADDRESSES_ARB.giveaway,
      owner.address, //ADDRESSES_ARB.giveaway,
      owner.address, //ADDRESSES_ARB.bounties,
      burner.address,
      owner.address, //ADDRESSES_ARB.rewardsWallet,
      community.address
    ];
    const initialFundProposalStrings: string[] = [
      "Marketing",
      "Product development",
      "Operations",
      "Charity",
      "Egg hunt",
      "Giveaways",
      "Bounties",
      "Burn",
      "Reflections",
      "Save to Next Week"
    ];
    const restrictedProposalSignatures: string[] = [
      "upgradeTo(address)",
      "upgradeToAndCall(address,bytes)",
      "setMinter(address,bool)",
      "setMaintenance(address,bool)",
      "setSecurity(address,bool)",
      "setUpgrader(address,bool)",
      "setReceiveRewards(address,bool)",
      "setHoldingLimitWhitelist(address,bool)",
      "setSellLimitWhitelist(address,bool)",
      "registerPair(address)",
      "communityPause()"
    ];
    await community.init(darwin.address, fundAddress, initialFundProposalStrings, restrictedProposalSignatures);
    await darwin.approve(community.address, ethers.utils.parseEther("100000"));
    await darwin.approve(staking.address, ethers.utils.parseEther("100000"));
    await darwin.setDarwinStaking(staking.address);
    return { staking, darwin, stakedDarwin, community, evotures, owner };
  };

    

  // COMMUNITY
  describe("Staking", function () {
    it("Stake works", async function () {
      const { staking, darwin } = await loadFixture(deployFixture);
      await darwin.emergencyUnPause();
      await staking.stake(ethers.utils.parseEther("1"), 1);
      await staking.stake(ethers.utils.parseEther("1"), 1);
    });
  });

  // EVOTURES
  describe("Evotures", function () {
    it("Minting works", async function () {
      const { evotures, owner } = await loadFixture(deployFixture);

      // misc
      expect((await evotures.unminted())[0]).to.be.eq(1);
      expect((await evotures.unminted())[(await evotures.unminted()).length - 1]).to.be.eq(2119);
      expect((await evotures.unminted()).includes(2061)).to.be.false;
      expect((await evotures.unminted()).includes(2120)).to.be.false;
      expect(await evotures.multipliers(2061)).to.be.eq(1000);
      expect(await evotures.multipliers(2120)).to.be.eq(1000);
      expect(await evotures.multipliers(2118)).to.be.eq(200);
      expect(await evotures.multipliers(33)).to.be.eq(250);

      // initial asserts
      expect((await evotures.userMinted(owner.address)).length).to.be.eq(0);
      expect((await evotures.unminted()).length).to.be.eq(358);
      expect(await evotures.totalMinted()).to.be.eq(2);

      // insufficient eth works
      await expect(evotures.mint(1, 0)).to.be.revertedWith("EvoturesNFT::mint: INSUFFICIENT_ETH");
      
      // minting works
      await expect(await evotures.mint(1, 0, {value: ethers.utils.parseEther("0.04")})).to.not.be.reverted;
      expect((await evotures.userMinted(owner.address)).length).to.be.eq(1);
      expect((await evotures.unminted()).length).to.be.eq(357);
      expect(await evotures.totalMinted()).to.be.eq(3);
      
      // insufficient eth 2 works
      await expect(evotures.mint(1, 1, {value: ethers.utils.parseEther("0.04")})).to.be.revertedWith("EvoturesNFT::mint: INSUFFICIENT_ETH");
      
      // minting 2 works
      await expect(await evotures.mint(2, 1, {value: ethers.utils.parseEther("0.092")})).to.not.be.reverted;
      expect((await evotures.userMinted(owner.address)).length).to.be.eq(3);
      expect((await evotures.unminted()).length).to.be.eq(355);
      expect(await evotures.totalMinted()).to.be.eq(5);
      
      // reverts with forbidden when reached 3 evotures
      await expect(evotures.mint(1, 0, {value: ethers.utils.parseEther("0.04")})).to.be.revertedWith("EvoturesNFT::mint: FORBIDDEN");
    });
  });
});