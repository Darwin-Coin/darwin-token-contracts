// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";
import { DarwinCommunity } from "../typechain-types";
import { Darwin, DarwinPrivateSale } from "../typechain-types/contracts";
import { ADDRESSES } from "./constants";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  console.log(`💻 Deployer: ${owner.address}`);

  // TODO: SET PRIVATESALE START TIMESTAMP!!!
  const PRIVATESALE_START = 1677682800; //? 1 March 2023 15:00:00 UTC
  const PRIVATESALE_AMOUNT = 2_500_000;
  const DARWIN = ADDRESSES.darwin;
  const PRELAUNCH = true;

  // DECLARE FACTORIES
  const darwinPrivateSaleFactory = await ethers.getContractFactory("DarwinPrivateSale");
  const darwinFactory = await ethers.getContractFactory("Darwin");

  const darwin = darwinFactory.attach(DARWIN);


  //! [DEPLOY] PRIVATE SALE
  const privateSale = await darwinPrivateSaleFactory.deploy() as DarwinPrivateSale;
  console.log(`🔨 Deployed Darwin Private-Sale at: ${privateSale.address}`);

  //? [VERIFY] PRIVATE SALE
  await privateSale.deployed();

  try {
  await hardhat.run("verify:verify", {
    address: privateSale.address,
    constructorArguments: []
  }); } catch {
    console.log("❌ Verification Failed")
  }

  if (PRELAUNCH) {
    const set = await darwin.emergencySetNotLive();
    await set.wait();
  }

  const send = await darwin.transfer(privateSale.address, ethers.utils.parseEther(PRIVATESALE_AMOUNT.toString()));
  await send.wait();

  //* [INIT] PRIVATE SALE
  await privateSale.init(darwin.address, PRIVATESALE_START);
  console.log(`🏁 Private-Sale initialized`);

  console.log("✅ PRESALE LAUNCH COMPLETED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
