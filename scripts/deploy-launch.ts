// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";
import { DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinPresale, DarwinPrivateSale } from "../typechain-types/contracts";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner, ...others] = await hardhat.ethers.getSigners();

  console.log(`💻 Deployer: ${owner.address}`);

  // TODO: SET PRIVATESALE START TIMESTAMP!!!
  const PRIVATESALE_START = 1676473200; //? Wednesday, 15 February 2023 15:00:00 UTC

  // DECLARE FACTORIES
  const darwinPresaleFactory = await ethers.getContractFactory("DarwinPresale");
  const darwinPrivateSaleFactory = await ethers.getContractFactory("DarwinPrivateSale");
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");


  //! [DEPLOY] PRESALE
  const presale = await darwinPresaleFactory.deploy() as DarwinPresale;
  console.log(`🔨 Deployed Darwin Presale at: ${presale.address}`);

  //? [VERIFY] PRESALE
  await presale.deployed();
  await hardhat.run("verify:verify", {
    address: presale.address,
    constructorArguments: []
  });


  //! [DEPLOY] PRIVATE SALE
  const privateSale = await darwinPrivateSaleFactory.deploy() as DarwinPrivateSale;
  console.log(`🔨 Deployed Darwin Private-Sale at: ${privateSale.address}`);

  //? [VERIFY] PRIVATE SALE
  await privateSale.deployed();
  await hardhat.run("verify:verify", {
    address: privateSale.address,
    constructorArguments: []
  });


  //! [DEPLOY] COMMUNITY
  const community = await upgrades.deployProxy(
    darwinCommunityFactory,
    [],
    {
      initializer: "initialize"
    }
  ) as DarwinCommunity;
  console.log(`🔨 Deployed Darwin Community at: ${community.address}`);

  //? [VERIFY] COMMUNITY
  await community.deployed();
  await hardhat.run("verify:verify", {
    address: community.address,
    constructorArguments: []
  });


  //! [DEPLOY] DARWIN PROTOCOL
  const darwin = await upgrades.deployProxy(
    darwinFactory,
    [presale.address, privateSale.address, community.address],
    {
      initializer: "initialize"
    }
  ) as Darwin;
  console.log(`🔨 Deployed Darwin Protocol at: ${darwin.address}`);

  //? [VERIFY] DARWIN PROTOCOL
  await darwin.deployed();
  await hardhat.run("verify:verify", {
    address: darwin.address,
    constructorArguments: []
  });


  //* [INIT] PRIVATE SALE
  await privateSale.init(darwin.address, PRIVATESALE_START);
  console.log(`🏁 Private-Sale initialized`);

  //* [INIT] PRESALE
  await presale.init(darwin.address);
  console.log(`🏁 Presale initialized`);

  //* [INIT] COMMUNITY
  await community.setDarwinAddress(darwin.address);
  console.log(`🏁 Community initialized`);

  console.log("✅ DARWIN PROTOCOL LAUNCH COMPLETED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
