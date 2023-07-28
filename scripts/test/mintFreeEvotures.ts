import * as hardhat from "hardhat";
import { ethers } from "hardhat";
import { BoosterNFT, MainnetNFTCounter } from "../../typechain-types/contracts";
import { IBoosterNFT } from "../../typechain-types/contracts/BoosterNFT";
import { EvoturesNFT, VRFv2Consumer } from "../../typechain-types";
import { ADDRESSES_ARB, ADDRESSES_MAINNET } from "../constants";

const MINT_ARRAY: string[] = [
  "0x3f76118822CEE609771291d225d60133af6b311E",
  "0x6d31FF53c9f3678E4426508f189Bd3E1D08eE286",
  "0x5d133C0558924a6D93D94524Cb784A8669FfDb16",
  "0x69eC61209728528f618039935e6887Bfee84655c",
  "0x745309f30deB0a8271F5f521925222F5E1280641",
  "0x416FE6d7c5E2D8eB7Fc8D8c0f7E7969272d10997",
  "0x0Dd936acE5DF9Dc03891F9CD8a9bac74BF835407",
  "0x197B034cf68096b07643f4Bd4DB6fB4221fF3DCe",
  "0x86291Db0001648de1c4bedDF0e44ceecC887D6B1",
  "0x86291Db0001648de1c4bedDF0e44ceecC887D6B1"
]

const MINT_ARRAY_DEPLOYER: string[] = [
  "0xC4D5C91322a9e32ba7Ebf0c509221062AEbEb4FB",
  "0x81e36b8FeBF1871d7f7657E26FFf45B740B788aE",
  "0xD9954AEA7252D01974549F99c412bCad0C25D2a4",
  "0xA105589F20D7599872b9A1b964372c5EfaCD27B4"
]

async function main() {

  let STEP = 2;
  const [owner, rewards] = await ethers.getSigners();

  // DECLARE ARBITRUM FACTORIES
  const evoturesFactory = await ethers.getContractFactory("EvoturesNFT");

  //! [DEPLOY] EVOTURES
  const evotures = evoturesFactory.attach(ADDRESSES_ARB.evotures) as EvoturesNFT;
  await evotures.deployed();
  console.log(`🔨 Attach Evotures NFT at: ${evotures.address}`);

  console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`)

  if (STEP === 1) {
    for (let i = 0; i < MINT_ARRAY.length; i++) {
      const mint = await evotures.hardMint(1, 5, MINT_ARRAY[i]);
      await mint.wait();
      console.log(`🍵 Minted 1 evoture and 5 boosters to ${MINT_ARRAY[i]}`);
      console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`);
    }

    for (let i = 0; i < 2; i++) {
      const mint = await evotures.hardMint(1, 5, owner.address);
      await mint.wait();
      console.log(`🍵 Minted 1 evoture and 5 boosters to ${owner.address}`);
      console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`)
    }

    for (let i = 2; i < 4; i++) {
      const mint = await evotures.hardMint(1, 5, rewards.address);
      await mint.wait();
      console.log(`🍵 Minted 1 evoture and 5 boosters to ${rewards.address}`);
      console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`)
    }
  } else {
    const ownerMinted = await evotures.userMinted(owner.address);
    for (let i = 0; i < ownerMinted.length; i++) {
      const transfer = await evotures.transferFrom(owner.address, MINT_ARRAY_DEPLOYER[i], ownerMinted[i]);
      await transfer.wait();
      console.log(`🍵 Transfered 1 evoture and 5 boosters to ${MINT_ARRAY_DEPLOYER[i]}`);
      console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`)
    }

    const rewardsMinted = await evotures.userMinted(rewards.address);
    for (let i = 0; i < rewardsMinted.length; i++) {
      const transfer = await evotures.connect(rewards).transferFrom(rewards.address, MINT_ARRAY_DEPLOYER[i + 2], rewardsMinted[i]);
      await transfer.wait();
      console.log(`🍵 Transfered 1 evoture and 5 boosters to ${MINT_ARRAY_DEPLOYER[i + 2]}`);
      console.log(`Balance: ${ethers.utils.formatEther(await owner.getBalance())}`)
    }
  }

  console.log("✅ COMPLETED")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
