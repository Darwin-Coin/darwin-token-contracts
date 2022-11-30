// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as hardhat from "hardhat";
import { ethers, upgrades } from "hardhat";


async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  const [owner, ...others] = await hardhat.ethers.getSigners()
  
  const DarwinEcosystem = await ethers.getContractFactory("DarwinEcosystem") 
  const DarwinPresale = await ethers.getContractFactory("DarwinPresale") 

  const presale = await DarwinPresale.deploy()

  const darwinEcosystem  = await upgrades.deployProxy(DarwinEcosystem,[presale.address])

  console.log(`Deployed Darwin DarwinPresale at: ${presale.address}`)
  console.log(`Deployed Darwin darwinEcosystem at: ${darwinEcosystem.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
