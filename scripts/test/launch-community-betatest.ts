// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers, upgrades } from "hardhat";
import { DarwinBurner, DarwinCommunity } from "../../typechain-types";
import { Darwin, DarwinStaking, DarwinVester5, DarwinVester7, LootboxTicket, MultiplierNFT, StakedDarwin } from "../../typechain-types/contracts";
import { ADDRESSES_ARB_GOERLI } from "../constants";


async function main() {

  // DECLARE ARBITRUM FACTORIES
  const darwinVester5Factory = await ethers.getContractFactory("DarwinVester5");
  const darwinVester7Factory = await ethers.getContractFactory("DarwinVester7");
  const darwinCommunityFactory = await ethers.getContractFactory("DarwinCommunity");
  const darwinFactory = await ethers.getContractFactory("Darwin");
  const stakedDarwinFactory = await ethers.getContractFactory("StakedDarwin");
  const darwinBurnerFactory = await ethers.getContractFactory("DarwinBurner");
  const stakingFactory = await ethers.getContractFactory("DarwinStaking");


  //! [DEPLOY] VESTER5
  const vester5 = await darwinVester5Factory.deploy(ADDRESSES_ARB_GOERLI.kieran) as DarwinVester5;
  await vester5.deployed();
  console.log(`🔨 Deployed Vester5 at: ${vester5.address}`);


  //! [DEPLOY] VESTER7
  const vester7 = await darwinVester7Factory.deploy([], [], []) as DarwinVester7;
  await vester7.deployed();
  console.log(`🔨 Deployed Vester7 at: ${vester7.address}`);


  //! [DEPLOY] COMMUNITY
  const community = await darwinCommunityFactory.deploy(ADDRESSES_ARB_GOERLI.kieran) as DarwinCommunity;
  await community.deployed();
  console.log(`🔨 Deployed Darwin Community at: ${community.address}`);


  //! [DEPLOY] DARWIN PROTOCOL
  const darwin = await upgrades.deployProxy(
    darwinFactory,
    [
      community.address,
      vester5.address,
      vester7.address,
      ADDRESSES_ARB_GOERLI.wallet1,
      ADDRESSES_ARB_GOERLI.kieran,
      ADDRESSES_ARB_GOERLI.charity,
      ADDRESSES_ARB_GOERLI.giveaway,
      ADDRESSES_ARB_GOERLI.bounties,
      ADDRESSES_ARB_GOERLI.drop,
      0
    ],
    {
      initializer: "initialize"
    }
  ) as Darwin;
  await darwin.deployed();
  console.log(`🔨 Deployed Darwin Protocol at: ${darwin.address}`);

  //* [INIT] UNPAUSE DARWIN
  const unpause = await darwin.emergencyUnPause();
  await unpause.wait();
  console.log(`🏁 Unpaused DARWIN`);

  //! [ATTACH] STAKED DARWIN
  const stakedDarwin = stakedDarwinFactory.attach(await darwin.stakedDarwin()) as StakedDarwin;
  await stakedDarwin.deployed();
  console.log(`🔨 Deployed Staked Darwin at: ${stakedDarwin.address}`);


  //! [DEPLOY] STAKING
  const staking = await stakingFactory.deploy(darwin.address, stakedDarwin.address, []) as DarwinStaking;
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
    ADDRESSES_ARB_GOERLI.wallet1,
    ADDRESSES_ARB_GOERLI.wallet1,
    ADDRESSES_ARB_GOERLI.wallet1,
    ADDRESSES_ARB_GOERLI.charity,
    ADDRESSES_ARB_GOERLI.eggHunt,
    ADDRESSES_ARB_GOERLI.giveaway,
    ADDRESSES_ARB_GOERLI.bounties,
    burner.address,
    ADDRESSES_ARB_GOERLI.rewardsWallet,
    community.address,
    ADDRESSES_ARB_GOERLI.wallet1,
    ADDRESSES_ARB_GOERLI.wallet1,
    ADDRESSES_ARB_GOERLI.treasury
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
    "Save to Next Week",
    "Liquidity Bundles",
    "Loot Box",
    "Treasury"
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

  const owners: string[] = ["0x2D6937030Cc4F1Df9c04848554e73be898E8098b",
    "0x5f80D2D1D177087835376F4E4aa1951eAd540341",
    "0x20ecd5d2fC408cee750E569037267cdE907B4135",
    "0xC709Bc89F76E3eDA7496CEB3B2949e775D757488",
    "0xEcFB07f54649AA12F7DA96A15202b153F1005Ce9",
    "0x4B5C916Ebc67E1F3E59667176cE347FdeD603e7D",
    "0xFAACF7BDaFe09359427e5be98cd54A880aB218fd",
    "0xB0B74B35D53b4CAA86cE239Dd129D7B473AF812F",
    "0x43c18c65d30d4d7A9356eeaFEDC41eb8c4a0d8D0",
    "0x63e9e79f414a229B9a13d683D43A19b3dbBed3F9",
    "0xc6Ac75547E82548a10A1F9e34e4E5e6A22FC526E",
    "0x6eE6978b84d4C24f1e507E529503c04B950Ee5E3",
    "0xf22b7fac789030450ba12572600246d6Aa57a720",
    "0xA5F6b66042300b8594d25882D2b75d43bF9b4293",
    "0xb210e5306Ae2fCeF93AFaD2E3034Ac3B650F8935",
    "0x08B2085893A0Ab44E6e23E8748Ee0C80aE42d69c",
    "0x201E6967af61099AFC42c4eB7E3BD0eeC896229a",
    "0xc59a3cc92c1D2467f6da903d60Ec7B3CE9ee1776",
    "0xa75AAB24d06A134dcB0EE228dB3c849b8dF4F706",
    "0x9A8eA312F36AAB8F7FA13276A01803F254a0EdbE",
    "0x6d2E09bECCeED18FBd21F22d0A9D7967BCe208ef"];
  for (let i = 0; i < owners.length; i++) {
    const tx = await darwin.transfer(owners[i], ethers.utils.parseEther("10000"));
    await tx.wait();
    console.log(`Transfer ${i}`)
  }

  console.log("✅ DARWIN PROTOCOL COMMUNITY BSC TESTNET LAUNCH COMPLETED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
