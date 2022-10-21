// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// import { ethers, upgrades } = require("hardhat"); // from "hardhat";

import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DarwinCommunity__factory, Darwin__factory } from "../typechain";
import { daysToSeconds, lastBlockTime } from "./helpers";



async function main() {


    const [owner, address0, ...others] = await ethers.getSigners()

    const darwinComunity = DarwinCommunity__factory.connect("0xc77c6d7a75409469824C0F5999499468658C807C",owner)
    const darwin = Darwin__factory.connect("0x9EE244AF31D513c5cf57b20fEBdC42D10db19962",owner)

    const  decimals  = BigNumber.from(10).pow(await darwin.decimals())


    await darwin.transfer( address0.address,decimals.mul(100000))

    let functionSig = darwinComunity.interface.functions["newFundCandidate(address,string)"]
    let calldata = ethers.utils.defaultAbiCoder.encode(functionSig.inputs, [darwinComunity.address, "Proposal Name 123"])

    const params =  {
        targets: [darwinComunity.address],
        values: [BigNumber.from(0)],
        signatures: [functionSig.format()],
        calldatas: [calldata],
        title: "Title",
        description: "Description",
        other: "",
        endTime: daysToSeconds(3).add((await lastBlockTime()))
    }
    
    
  const txn  = await darwinComunity.connect(owner).propose(
        params.targets,
        params.values, 
        params.signatures, 
        params.calldatas, 
        params.title, 
        params.description, 
        params.other, 
        params.endTime, 
    {
        from:owner.address
    })


    console.log(txn)


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
