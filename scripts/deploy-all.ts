// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// import { ethers, upgrades } = require("hardhat"); // from "hardhat";

import { HardhatUpgrades } from "@openzeppelin/hardhat-upgrades";
import { getManifestAdmin } from "@openzeppelin/hardhat-upgrades/dist/admin";
import { BigNumber } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import hardhat, { ethers, upgrades } from "hardhat";
import { Darwin, DarwinCommunity, Darwin__factory, ProxyAdmin, ProxyAdmin__factory } from "../typechain";
import { getUniswapRouterAddress } from "./helpers";


async function main() {
    const up = upgrades as HardhatUpgrades
    
    const [owner, address0, address1, ...others] = await hardhat.ethers.getSigners()
    const devWallet = owner;
    const DarwinCommunity = await ethers.getContractFactory("DarwinCommunity")
    const Darwin = await ethers.getContractFactory("Darwin");

    let darwinTokenContract = Darwin__factory.connect(ethers.constants.AddressZero, ethers.getDefaultProvider())
    let proxyAdminContract = ProxyAdmin__factory.connect(ethers.constants.AddressZero, ethers.getDefaultProvider())

    const proposalCandidates = [
        {
            proposal: "Marketing",
            address: owner.address
        },
        {
            proposal: "Product development",
            address: owner.address
        },
        {
            proposal: "Operations",
            address: owner.address
        },
        {
            proposal: "Charity",
            address: owner.address
        },
        {
            proposal: "Egg hunt",
            address: owner.address
        },
        {
            proposal: "Giveaways",
            address: owner.address
        },
        {
            proposal: "Bounties",
            address: owner.address
        },
        {
            proposal: "Burn",
            address: owner.address
        },
        {
            proposal: "Reflections",
            address: owner.address
        },
        {
            proposal: "Save to Next Week",
            address: owner.address
        }
    ]

    const restrictedProposalSignatures = [
        proxyAdminContract.interface.functions["upgrade(address,address)"],
        proxyAdminContract.interface.functions["upgradeAndCall(address,address,bytes)"],
    ].map(it => it.format())
        .map(it => keccak256(toUtf8Bytes(it)))
        .map(it => BigNumber.from(it))


    const fundProposals = proposalCandidates.map(it => it.proposal);
    const fundProposalsAddresses = proposalCandidates.map(it => it.address);

    const darwinCommunity = await upgrades.deployProxy(
        DarwinCommunity,
        [restrictedProposalSignatures, fundProposals, fundProposalsAddresses],
        {
            initializer: "initialize"
        }
    ) as DarwinCommunity;

    console.log("DarwinCommunity deployed at:", darwinCommunity.address);

    const uniswapV2RouterAddress = await getUniswapRouterAddress(hardhat.network.name)

    const darwinToken = await up.deployProxy(
        Darwin,
        [uniswapV2RouterAddress, darwinCommunity.address, devWallet.address],
        {
            initializer: "initialize"
        }
    ) as Darwin;

    await darwinToken.deployed();

    console.log("DarwinCoin deployed at:", darwinToken.address);

    await darwinCommunity.setDarwinAddress(darwinToken.address);

    const proxyAdmin = await getManifestAdmin(hardhat) as ProxyAdmin;

    // await proxyAdmin.transferOwnership(darwinCommunity.address);

    console.log(`deployment finished`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
