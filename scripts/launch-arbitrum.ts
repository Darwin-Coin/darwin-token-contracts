// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from "ethers";
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";
import { DarwinBurner, DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinPrivateSale, DarwinStaking, DarwinVester5, DarwinVester7, EvoturesNFT, LootboxTicket, MultiplierNFT, StakedDarwin } from "../typechain-types/contracts";
import { ADDRESSES, ADDRESSES_ARB } from "./constants";


type UserInfo = {
    withdrawn: BigNumber,
    vested: BigNumber,
    vestTimestamp: BigNumber,
    claimed: BigNumber,
    boost: BigNumber,
    tokenId: BigNumber
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
    const user = await vesterBSC.userInfo(privateSaleBuyers[i]);
    const jsUser: UserInfo = {
      withdrawn: user.withdrawn,
      vested: user.vested,
      vestTimestamp: user.vestTimestamp,
      claimed: user.claimed,
      boost: BigNumber.from(0),
      tokenId: BigNumber.from(0)
    }
    buyersInfo.push(jsUser);
  }

  console.log(`✅ Sold Darwin and Private Buyers Info fetched from BSC`);



  // ARBITRUM
  hardhat.changeNetwork("arbitrum");
  console.log(`⛓️ Chain: Arbitrum`);

  // DECLARE ARBITRUM FACTORIES
  const darwinVester5Factory = await ethers.getContractFactory("DarwinVester5");
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");
  const stakedDarwinFactory = await ethers.getContractFactory("StakedDarwin");
  const darwinBurnerFactory = await ethers.getContractFactory("DarwinBurner");
  const stakingFactory = await ethers.getContractFactory("DarwinStaking");
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");
  const multiplierFactory = await ethers.getContractFactory("MultiplierNFT");
  const ticketFactory = await ethers.getContractFactory("LootboxTicket");


  //! [DEPLOY] EVOTURES
  const evotures = await evoturesFactory.deploy() as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Deployed Evotures NFT at: ${evotures.address}`);

  //? [VERIFY] EVOTURES
  await hardhat.run("verify:verify", {
    address: evotures.address,
    constructorArguments: []
  });


  //! [DEPLOY] MULTIPLIER
  const multiplier = await multiplierFactory.deploy() as MultiplierNFT;
  await multiplier.deployed();
  console.log(`🔨 Deployed Multiplier NFT at: ${multiplier.address}`);

  //? [VERIFY] MULTIPLIER
  await hardhat.run("verify:verify", {
    address: multiplier.address,
    constructorArguments: []
  });


  //! [ATTACH] TICKET
  const ticket = ticketFactory.attach(await multiplier.ticketsContract()) as LootboxTicket;
  await ticket.deployed();
  console.log(`🔨 Deployed Lootbox Ticket at: ${ticket.address}`);

  //? [VERIFY] TICKET
  await hardhat.run("verify:verify", {
    address: ticket.address,
    constructorArguments: []
  });


  //! [DEPLOY] VESTER5
  const vester5 = await darwinVester5Factory.deploy(ADDRESSES_ARB.kieran) as DarwinVester5;
  await vester5.deployed();
  console.log(`🔨 Deployed Vester5 at: ${vester5.address}`);

  //? [VERIFY] VESTER5
  await hardhat.run("verify:verify", {
    address: vester5.address,
    constructorArguments: [ADDRESSES_ARB.kieran]
  });


  //! [DEPLOY] VESTER7
  const vester7 = await darwinVester7Factory.deploy(privateSaleBuyers, buyersInfo, evotures.address, multiplier.address) as DarwinVester7;
  await vester7.deployed();
  console.log(`🔨 Deployed Vester7 at: ${vester7.address}`);

  //? [VERIFY] VESTER7
  await hardhat.run("verify:verify", {
    address: vester7.address,
    constructorArguments: [privateSaleBuyers, buyersInfo, evotures.address, multiplier.address]
  });


  //! [DEPLOY] COMMUNITY
  const community = await darwinCommunityFactory.deploy(ADDRESSES_ARB.kieran) as DarwinCommunity;
  await community.deployed();
  console.log(`🔨 Deployed Darwin Community at: ${community.address}`);

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
  await darwin.deployed();
  console.log(`🔨 Deployed Darwin Protocol at: ${darwin.address}`);

  //! [ATTACH] STAKED DARWIN
  const stakedDarwin = stakedDarwinFactory.attach(await darwin.stakedDarwin()) as StakedDarwin;
  await stakedDarwin.deployed();
  console.log(`🔨 Deployed Staked Darwin at: ${stakedDarwin.address}`);

  //? [VERIFY] DARWIN PROTOCOL
  await hardhat.run("verify:verify", {
    address: darwin.address,
    constructorArguments: []
  });

  //? [VERIFY] STAKED DARWIN
  await hardhat.run("verify:verify", {
    address: stakedDarwin.address,
    constructorArguments: []
  });


  //! [DEPLOY] STAKING
  const staking = await stakingFactory.deploy(darwin.address, stakedDarwin.address, evotures.address, multiplier.address) as DarwinStaking;
  await staking.deployed();
  console.log(`🔨 Deployed Darwin Staking at: ${staking.address}`);

  //? [VERIFY] STAKING
  await hardhat.run("verify:verify", {
    address: staking.address,
    constructorArguments: [darwin.address, stakedDarwin.address, evotures.address, multiplier.address]
  });

  //* [INIT] DARWIN WITH STAKING
  const setStaking = await darwin.setDarwinStaking(staking.address);
  await setStaking.wait();
  console.log(`🏁 Staking address set for Darwin and Staked Darwin`);


  //! [DEPLOY] DARWIN BURNER
  const burner = await darwinBurnerFactory.deploy(darwin.address) as DarwinBurner;
  console.log(`🔨 Deployed Darwin Burner at: ${burner.address}`);
  await burner.deployed();

  //? [VERIFY] DARWIN BURNER
  await hardhat.run("verify:verify", {
    address: burner.address,
    constructorArguments: [darwin.address]
  });




  //! [CONST] FUND ADDRESSES
  const fundAddress: string[] = [
    ADDRESSES_ARB.wallet1,
    ADDRESSES_ARB.wallet1,
    ADDRESSES_ARB.wallet1,
    ADDRESSES_ARB.charity,
    ADDRESSES_ARB.giveaway,
    ADDRESSES_ARB.giveaway,
    ADDRESSES_ARB.bounties,
    burner.address,
    ADDRESSES_ARB.rewardsWallet,
    community.address
  ];

  //! [CONST] FUND PROPOSALS
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

  //! [CONST] RESTRICTED SIGNATURES
  const restrictedProposalSignatures: string[] = [
    "upgradeTo(address)",
    "upgradeToAndCall(address,bytes)",
    "setMinter(address,bool)",
    "setMaintenance(address,bool)",
    "setSecurity(address,bool)",
    "setUpgrader(address,bool)",
    "setReceiveRewards(address,bool)",
    "communityPause()"
  ];




  //* [SEND] 25% TO BSC PRIVATESALE BUYERS (ON ARBITRUM)
  for (let i = 0; i < privateSaleBuyers.length; i++) {
    const tx = await darwin.transfer(privateSaleBuyers[i], buyersInfo[i].vested.div(3));
    await tx.wait();
  }
  console.log(`🏁 Private-Sale Buyers fulfilled (25%)`);

  //* [INIT] MULTIPLIER
  await multiplier.init(darwin.address);
  console.log(`🏁 Multiplier initialized`);

  //* [INIT] VESTER5
  await vester5.init(darwin.address);
  console.log(`🏁 Private-Sale initialized`);

  //* [INIT] VESTER7
  await vester7.init(darwin.address);
  console.log(`🏁 Presale initialized`);

  //* [INIT] COMMUNITY
  await community.init(darwin.address, fundAddress, initialFundProposalStrings, restrictedProposalSignatures);
  console.log(`🏁 Community initialized`);

  console.log("✅ DARWIN PROTOCOL ARBITRUM LAUNCH COMPLETED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
