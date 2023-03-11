// Darwin Protocol launch test.

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";

import { DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinVester5, DarwinVester7 } from "../typechain-types/contracts";

describe("Launch", function () {
  async function deployFixture() {
    const [owner] = await hardhat.ethers.getSigners()
    const darwinVester5Factory = await ethers.getContractFactory("DarwinVester5");
    const darwinVester7Factory = await ethers.getContractFactory("DarwinVester7");
    const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
    const darwinFactory = await ethers.getContractFactory("Darwin");
    const vester5 = await darwinVester5Factory.deploy(owner.address) as DarwinVester5;
    await vester5.deployed();
    const vester7 = await darwinVester7Factory.deploy([], []) as DarwinVester7;
    await vester7.deployed();
    const community = await darwinCommunityFactory.deploy(owner.address) as DarwinCommunity;
    await community.deployed();
    const darwin = await upgrades.deployProxy(
      darwinFactory,
      [
        owner.address,
        vester5.address,
        vester7.address,
        owner.address,
        owner.address,
        owner.address,
        owner.address,
        owner.address,
        owner.address,
        owner.address,
        0
      ],
      {
        initializer: "initialize"
      }
    ) as Darwin;
    await vester5.init(darwin.address);
    await vester7.init(darwin.address);
    //await community.init(darwin.address);
    return { owner }
  }

  describe("Test", function () {
    it("Test", async function () {
      const { owner } = await loadFixture(deployFixture);
    });
  });
});