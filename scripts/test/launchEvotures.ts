import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { EvoturesNFT, LootboxTicket } from "../typechain-types/contracts";


async function main() {
  const VERIFY = false;

  // DECLARE ARBITRUM FACTORIES
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");
  const ticketFactory = await ethers.getContractFactory("LootboxTicket");

  //! [DEPLOY] EVOTURES
  const evotures = await evoturesFactory.deploy() as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Deployed Evotures NFT at: ${evotures.address}`);

  if (VERIFY) {
    //? [VERIFY] EVOTURES
    await hardhat.run("verify:verify", {
      address: evotures.address,
      constructorArguments: []
    });
  }

  //! [ATTACH] TICKET
  const ticket = ticketFactory.attach(await evotures.ticketsContract()) as LootboxTicket;
  await ticket.deployed();
  console.log(`🔨 Deployed Lootbox Ticket at: ${ticket.address}`);

  if (VERIFY) {
    //? [VERIFY] TICKET
    await hardhat.run("verify:verify", {
      address: ticket.address,
      constructorArguments: []
    });
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
