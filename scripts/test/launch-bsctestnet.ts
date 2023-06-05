// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { BigNumber } from "ethers";
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";
import { DarwinBurner, DarwinCommunity } from "../../typechain-types";
import { Darwin, DarwinPrivateSale, DarwinStaking, DarwinVester5, DarwinVester7, EvoturesNFT, LootboxTicket, StakedDarwin } from "../../typechain-types/contracts";
import { ADDRESSES, ADDRESSES_ARB } from "../constants";


type UserInfo = {
    withdrawn: BigNumber,
    vested: BigNumber,
    vestTimestamp: BigNumber,
    claimed: BigNumber
}


async function main() {

  // DECLARE ARBITRUM FACTORIES
  const darwinVester5Factory = await ethers.getContractFactory("DarwinVester5");
  const darwinVester7Factory = await ethers.getContractFactory("DarwinVester7");
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");
  const stakedDarwinFactory = await ethers.getContractFactory("StakedDarwin");
  const darwinBurnerFactory = await ethers.getContractFactory("DarwinBurner");
  const stakingFactory = await ethers.getContractFactory("DarwinStaking");
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");
  const ticketFactory = await ethers.getContractFactory("LootboxTicket");


  //! [DEPLOY] EVOTURES
  const evotures = evoturesFactory.attach("0xe254958D2B112376593801BdD4c9786D73e1579C") as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Deployed Evotures NFT at: ${evotures.address}`);


  //! [ATTACH] TICKET
  const ticket = ticketFactory.attach(await evotures.ticketsContract()) as LootboxTicket;
  await ticket.deployed();
  console.log(`🔨 Deployed Lootbox Ticket at: ${ticket.address}`);


  //! [DEPLOY] VESTER5
  const vester5 = darwinVester5Factory.attach("0x84F5dBD0ea31D3cb46e1879D0bbc295Fc91Ad7cc") as DarwinVester5;
  await vester5.deployed();
  console.log(`🔨 Deployed Vester5 at: ${vester5.address}`);


  //! [DEPLOY] VESTER7
  const vester7 = darwinVester7Factory.attach("0x07C4212E96ed5229792D854A8a45c879721F013D") as DarwinVester7;
  await vester7.deployed();
  console.log(`🔨 Deployed Vester7 at: ${vester7.address}`);


  //! [DEPLOY] COMMUNITY
  const community = await darwinCommunityFactory.deploy(ADDRESSES_ARB.kieran) as DarwinCommunity;
  await community.deployed();
  console.log(`🔨 Deployed Darwin Community at: ${community.address}`);


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
      0
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


  //! [DEPLOY] STAKING
  const staking = await stakingFactory.deploy(darwin.address, stakedDarwin.address, evotures.address, ticket.address) as DarwinStaking;
  await staking.deployed();
  console.log(`🔨 Deployed Darwin Staking at: ${staking.address}`);

  //* [INIT] DARWIN WITH STAKING
  const setStaking = await darwin.setDarwinStaking(staking.address);
  await setStaking.wait();
  console.log(`🏁 Staking address set for Darwin and Staked Darwin`);


  //! [DEPLOY] DARWIN BURNER
  const burner = await darwinBurnerFactory.deploy(darwin.address) as DarwinBurner;
  console.log(`🔨 Deployed Darwin Burner at: ${burner.address}`);
  await burner.deployed();




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
