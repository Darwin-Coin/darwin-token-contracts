// Darwin Protocol launch test.

import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

import { DarwinBurner, DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinVester5, DarwinVester7 } from "../typechain-types/contracts";
import { ADDRESSES_ARB } from "../scripts/constants";

describe("Launch", function () {
  async function deployFixture() {
    const [owner, addr1, addr2] = await hardhat.ethers.getSigners()
    const darwinVester5Factory = await ethers.getContractFactory("DarwinVester5");
    const darwinVester7Factory = await ethers.getContractFactory("DarwinVester7");
    const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
    const darwinFactory = await ethers.getContractFactory("Darwin");
    const darwinBurnerFactory = await ethers.getContractFactory("DarwinBurner");
    const vester5 = await darwinVester5Factory.deploy(owner.address) as DarwinVester5;
    await vester5.deployed();
    const vester7 = await darwinVester7Factory.deploy([], []) as DarwinVester7;
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

    // SET addr1 seniorProposer
    let timestamp = await time.latest();
    let data = ethers.utils.defaultAbiCoder.encode(["address","bool"],[addr1.address, true]);
    let propId = await community.callStatic.propose([community.address],[0],["setSeniorProposer(address,bool)"],[data],"Test","Test","Test",timestamp + (3 * 86400));
    await community.propose([community.address],[0],["setSeniorProposer(address,bool)"],[data],"Test","Test","Test",timestamp + (3 * 86400));
    await time.increase(86400 + 1);
    await community.castVote(propId, true, ethers.utils.parseEther("1000"));
    await time.increase(2 * 86400 + 1);
    await community.execute(propId);

    // SET addr2 proposer
    timestamp = await time.latest();
    data = ethers.utils.defaultAbiCoder.encode(["address","bool"],[addr2.address, true]);
    propId = await community.callStatic.propose([community.address],[0],["setProposer(address,bool)"],[data],"Test","Test","Test",timestamp + (3 * 86400));
    await community.propose([community.address],[0],["setProposer(address,bool)"],[data],"Test","Test","Test",timestamp + (3 * 86400));
    await time.increase(86400 + 1);
    await community.castVote(propId, true, ethers.utils.parseEther("1000"));
    await time.increase(2 * 86400 + 1);
    await community.execute(propId);
    return { owner, community, darwin, addr1, addr2, darwinFactory }
  }

  // COMMUNITY
  describe("Community", function () {
    it("Proposals work for the $DARWIN contract so that we can update things if we need to", async function () {
      const { community, darwin } = await loadFixture(deployFixture);
      expect(await darwin.isPaused()).to.be.true;
      const timestamp = await time.latest();
      await darwin.approve(community.address, ethers.utils.parseEther("1000000"));
      const propId = await community.callStatic.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Test","Test","Test",timestamp + (3 * 86400));
      await community.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Test","Test","Test",timestamp + (3 * 86400));
      await time.increase(86400 + 1);
      await community.castVote(propId, true, ethers.utils.parseEther("1000"));
      await time.increase(2 * 86400 + 1);
      await community.execute(propId);
      expect(await darwin.isPaused()).to.be.false;
    });

    it("Users can access DarwinCommunity (propose) with min 1 $DARWIN", async function () {
      const { community, darwin, addr1 } = await loadFixture(deployFixture);
      let timestamp = await time.latest();
      darwin.transfer(addr1.address, ethers.utils.parseEther("0.99"));
      await darwin.emergencyUnPause();
      await time.increase(91 * 86400);
      timestamp = await time.latest();
      const community1 = community.connect(addr1);
      await darwin.connect(addr1).approve(community.address, ethers.utils.parseEther("10000"));
      // Expect a proposal made by someone with less than 1 darwin to be reverted
      await expect(
        community1.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Test","Test","Test",timestamp + (3 * 86400))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      darwin.transfer(addr1.address, ethers.utils.parseEther("0.01"));
      await expect(
        await community1.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Test","Test","Test",timestamp + (3 * 86400))
      ).to.not.be.reverted;
    });

    it("Users can vote on proposals by submitting $DARWIN tokens", async function () {
      const { community, darwin, addr1 } = await loadFixture(deployFixture);
      let timestamp = await time.latest();
      darwin.transfer(addr1.address, ethers.utils.parseEther("2"));
      await darwin.emergencyUnPause();
      await time.increase(91 * 86400);
      timestamp = await time.latest();
      const community1 = community.connect(addr1);
      await darwin.connect(addr1).approve(community.address, ethers.utils.parseEther("10000"));
      const propId = await community1.callStatic.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Test","Test","Test",timestamp + (3 * 86400))
      await community1.propose([darwin.address],[0],["communityUnPause()"],["0x00"],"Test","Test","Test",timestamp + (3 * 86400))
      await time.increase(2 * 86400);
      await expect(
        await community1.castVote(propId, true, ethers.utils.parseEther("1"))
      ).to.not.be.reverted;
    });

    it("Non-allowed users cannot make proposals with restricted signatures", async function () {
      const { community, darwin, addr2 } = await loadFixture(deployFixture);
      let timestamp = await time.latest();
      darwin.transfer(addr2.address, ethers.utils.parseEther("2"));
      await darwin.emergencyUnPause();
      await time.increase(91 * 86400);
      timestamp = await time.latest();
      const community2 = community.connect(addr2);
      await darwin.connect(addr2).approve(community.address, ethers.utils.parseEther("10000"));
      const data = ethers.utils.defaultAbiCoder.encode(["address"],["0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16"]);
      await expect(
        community2.propose([darwin.address],[0],["upgradeTo(address)"],[data],"Test","Test","Test",timestamp + (3 * 86400))
      ).to.be.revertedWith("DC::propose: proposal signature restricted");
    });

    it("Allowed user can upgrade the darwin contract when needed", async function () {
      const { community, darwin, darwinFactory } = await loadFixture(deployFixture);
      let timestamp = await time.latest();
      await darwin.approve(community.address, ethers.utils.parseEther("10000"));
      const darwinNoProxy = await darwinFactory.deploy();
      const data = ethers.utils.defaultAbiCoder.encode(["address"],[darwinNoProxy.address]);
      const propId = await community.callStatic.propose([darwin.address],[0],["upgradeTo(address)"],[data],"Test","Test","Test",timestamp + (3 * 86400));
      await community.propose([darwin.address],[0],["upgradeTo(address)"],[data],"Test","Test","Test",timestamp + (3 * 86400));
      await time.increase(86400 + 1);
      await community.castVote(propId, true, ethers.utils.parseEther("1000"));
      await time.increase(2 * 86400 + 1);
      await community.execute(propId);
      const oldImplAddress = upgrades.erc1967.getImplementationAddress(darwin.address);
      expect (
        await upgrades.erc1967.getImplementationAddress(darwin.address)
      ).to.be.equal(darwinNoProxy.address).and.to.not.be.equal(oldImplAddress);
    });
  });
});