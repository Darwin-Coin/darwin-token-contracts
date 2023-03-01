// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { DarwinPrivateSale, DarwinVester } from "../typechain-types/contracts";
import { ADDRESSES } from "./constants";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner] = await hardhat.ethers.getSigners();

  console.log(`💻 Deployer: ${owner.address}`);

  // TODO: SET PRIVATESALE START TIMESTAMP!!!
  const PRIVATESALE_START = 1677747600; //? 2 March 2023 09:00:00 UTC
  const PRIVATESALE_AMOUNT = 10_000_000;
  const DARWIN = ADDRESSES.darwin;
  const PRELAUNCH = false;

  // DECLARE FACTORIES
  const darwinPrivateSaleFactory = await ethers.getContractFactory("DarwinPrivateSale");
  const darwinFactory = await ethers.getContractFactory("Darwin");
  const vesterFactory = await ethers.getContractFactory("DarwinVester");

  const darwin = darwinFactory.attach(DARWIN);


  //! [DEPLOY] PRIVATE SALE
  const privateSale = await darwinPrivateSaleFactory.deploy() as DarwinPrivateSale;
  console.log(`🔨 Deployed Darwin Private-Sale at: ${privateSale.address}`);
  await privateSale.deployed();

  //? [VERIFY] PRIVATE SALE
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


  //! [DEPLOY] VESTER
  const vester = await vesterFactory.deploy(darwin.address) as DarwinVester;
  console.log(`🔨 Deployed Vester at: ${vester.address}`);
  await vester.deployed();

  //? [VERIFY] VESTER
  try {
  await hardhat.run("verify:verify", {
    address: vester.address,
    constructorArguments: [darwin.address]
  }); } catch {
    console.log("❌ Verification Failed")
  }


  //* [ADD] PRIVATE SALE
  const vAdd = await darwin.setPrivateSaleAddress(privateSale.address);
  await vAdd.wait();
  console.log(`🏁 Private-Sale added to Darwin`);

  //* [ADD] VESTER
  const pAdd = await darwin.setPrivateSaleAddress(vester.address);
  await pAdd.wait();
  console.log(`🏁 Vester added to Darwin`);

  //* [INIT] VESTER
  const vInit = await vester.init(privateSale.address);
  await vInit.wait();
  console.log(`🏁 Vester Initialized`);

  //* [SEND] 10M DARWIN TO PRIVATESALE
  const send = await darwin.transfer(privateSale.address, ethers.utils.parseEther(PRIVATESALE_AMOUNT.toString()));
  await send.wait();
  console.log(`🏁 10m $DARWIN sent to Private-Sale`);

  //* [INIT] PRIVATE SALE
  const pInit = await privateSale.init(darwin.address, vester.address, PRIVATESALE_START);
  await pInit.wait();
  console.log(`🏁 Private-Sale initialized`);

  console.log("✅ PRESALE LAUNCH COMPLETED");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
