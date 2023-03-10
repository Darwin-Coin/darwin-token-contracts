// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from "ethers";
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";
import { DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinPrivateSale, DarwinVester5, DarwinVester7 } from "../typechain-types/contracts";
import { ADDRESSES, ADDRESSES_ARB } from "./constants";


type UserInfo = {
    withdrawn: BigNumber,
    vested: BigNumber,
    vestTimestamp: BigNumber,
    claimed: BigNumber
}


async function main() {
  // BSC
  hardhat.changeNetwork("bsc");
  console.log(`⛓️ Chain: BSC`);

  // DECLARE BSC FACTORIES
  const darwinPrivateSaleFactory = await ethers.getContractFactory("DarwinPrivateSale");
  const darwinVester7Factory = await ethers.getContractFactory("DarwinVester7");
  const privateBSC = darwinPrivateSaleFactory.attach(ADDRESSES.privateSales[0]) as DarwinPrivateSale;
  const vesterBSC = darwinVester7Factory.attach(ADDRESSES.vester) as DarwinVester7;
  const privateSoldDarwin = (await privateBSC.status()).soldAmount;
  const privateSaleBuyers = ADDRESSES.privateSaleBuyers;
  const buyersInfo: UserInfo[] = [];

  for (let i = 0; i < privateSaleBuyers.length; i++) {
    buyersInfo.push(await vesterBSC.userInfo(privateSaleBuyers[i]));
  }

  console.log(`✅ Sold Darwin and Private Buyers Info fetched from BSC`);



  // ARBITRUM
  hardhat.changeNetwork("arbitrum");
  console.log(`⛓️ Chain: Arbitrum`);

  // DECLARE ARBITRUM FACTORIES
  const darwinVester5Factory = await ethers.getContractFactory("DarwinVester5");
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");


  //! [DEPLOY] VESTER5
  const vester5 = await darwinVester5Factory.deploy(ADDRESSES_ARB.kieran) as DarwinVester5;
  console.log(`🔨 Deployed Vester5 at: ${vester5.address}`);
  await vester5.deployed();

  //? [VERIFY] VESTER5
  await hardhat.run("verify:verify", {
    address: vester5.address,
    constructorArguments: [ADDRESSES_ARB.kieran]
  });


  //! [DEPLOY] VESTER7
  const vester7 = await darwinVester7Factory.deploy(privateSaleBuyers, buyersInfo) as DarwinVester7;
  console.log(`🔨 Deployed Vester7 at: ${vester7.address}`);
  await vester7.deployed();

  //? [VERIFY] VESTER7
  await hardhat.run("verify:verify", {
    address: vester7.address,
    constructorArguments: [privateSaleBuyers, buyersInfo]
  });


  //! [DEPLOY] COMMUNITY
  const community = await darwinCommunityFactory.deploy(ADDRESSES_ARB.kieran) as DarwinCommunity;
  console.log(`🔨 Deployed Darwin Community at: ${community.address}`);
  await community.deployed();

  //? [VERIFY] COMMUNITY
  await hardhat.run("verify:verify", {
    address: community.address,
    constructorArguments: [ADDRESSES_ARB.kieran]
  });


  //! [DEPLOY] DARWIN PROTOCOL
  const darwin = await upgrades.deployProxy(
    darwinFactory,
    [
      community.address,
      vester5.address,
      vester7.address,
      ADDRESSES_ARB.wallet1,
      ADDRESSES_ARB.wallet2,
      ADDRESSES_ARB.kieran,
      ADDRESSES_ARB.charity,
      ADDRESSES_ARB.giveaway,
      ADDRESSES_ARB.bounties,
      ADDRESSES_ARB.drop,
      privateSoldDarwin
    ],
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


  //* [INIT] VESTER5
  await vester5.init(darwin.address);
  console.log(`🏁 Private-Sale initialized`);

  //* [INIT] VESTER7
  await vester7.init(darwin.address);
  console.log(`🏁 Presale initialized`);

  //* [INIT] COMMUNITY
  await community.init(darwin.address);
  console.log(`🏁 Community initialized`);

  console.log("✅ DARWIN PROTOCOL ARBITRUM LAUNCH COMPLETED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
