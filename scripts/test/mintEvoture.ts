import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { EvoturesNFT, LootboxTicket } from "../typechain-types/contracts";
import { ADDRESSES_ARB_GOERLI, ADDRESSES_ARB } from "./constants";

enum Rarity {
    COMMON,
    RARE,
    ULTRARARE,
    MYTHICAL,
    ANCIENT
}

enum Alignment {
    DIVINE,
    ABOMINATION
}

async function main() {
  const TEST = false;
  const ADDRESSES = TEST ? ADDRESSES_ARB_GOERLI : ADDRESSES_ARB;
  const EVOTURES = ADDRESSES.evotures;
  const TICKETS = ADDRESSES.tickets;

  const [owner] = await ethers.getSigners();

  // DECLARE ARBITRUM FACTORIES
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");
  const ticketFactory = await ethers.getContractFactory("LootboxTicket");

  //! [ATTACH] EVOTURES
  const evotures = evoturesFactory.attach(EVOTURES) as EvoturesNFT;
  console.log(`🔨 Attach Evotures NFT at: ${evotures.address}`);

  //! [ATTACH] TICKET
  const ticket = ticketFactory.attach(TICKETS) as LootboxTicket;
  console.log(`🔨 Attach Lootbox Ticket at: ${ticket.address}`);

  const mintTicket = await ticket.mint(owner.address, Rarity.ULTRARARE);
  await mintTicket.wait();
  const ticketId = (await ticket.lastTicketId()).sub(1);
  const ticketRarity = await ticket.rarity(ticketId);
  console.log(`🔨 Minted Ticket #${ticketId} - Rarity ${ticketRarity}`);

  const mintEvoture = await ticket.openLootBox(ticketId);
  await mintEvoture.wait();
  const evotureId = (await evotures.lastTokenId()).sub(1);
  const stats = await evotures.stats(evotureId);
  console.log(`🔨 Minted Evoture #${evotureId}`);
  console.log({
    no: stats.no.toNumber(),
    hp: stats.hp.toNumber(),
    attack: stats.attack.toNumber(),
    defense: stats.defense.toNumber(),
    speed: stats.speed.toNumber(),
    special: stats.special.toNumber(),
    alignment: stats.alignment,
    rarity: stats.rarity,
    multiplier: stats.multiplier
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});