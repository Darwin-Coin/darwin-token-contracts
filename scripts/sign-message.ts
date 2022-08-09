// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// import { ethers, upgrades } = require("hardhat"); // from "hardhat";

import { ethers } from "hardhat";

enum CommunityFundVoteType {
    STAGE_1 = "FUND_STAGE_1_VOTE",
    STAGE_2 = "FUND_STAGE_2_VOTE",
    STAGE_3 = "FUND_STAGE_3_VOTE",
}
interface CommunityFundStag1Vote {
    weekNumber: number;
    vote: number;
    nonce: string;
    type: CommunityFundVoteType
}

interface CommunityFundStag2Vote {
    weekNumber: number;
    vote: number[];
    nonce: string;
    type: CommunityFundVoteType
}

export interface Stage3Vote {
    id: number,
    percentage: number
}

export interface CommunityFundStag3VotePayload {
    weekNumber: number;
    vote: Stage3Vote[];
    nonce: string;
    type: CommunityFundVoteType;
}

export interface PollVotePayload {
    pollId: string;
    vote: string;
    nonce: string;
}


async function main() {

    const [owner, address0, ...others] = await ethers.getSigners()

    const signer = await ethers.getSigner(owner.address)

    let nonce = "8YQCXU7R";

    let signedMessage = await signer.signMessage(nonce)

    console.log(signedMessage)
    

    // let address =  ethers.utils.verifyMessage(nonce, signedMessage)

    {
        {
            // let stage1Vote : CommunityFundStag1Vote = {
            //     weekNumber:0,
            //     vote: 3,
            //     nonce: "NRZOSWUB",
            //     type: CommunityFundVoteType.STAGE_1
            // }

            // let dataRaw =  JSON.stringify(stage1Vote)

            // let signedMessage = await signer.signMessage(dataRaw)

            // console.log(dataRaw, signedMessage, signer.address) 
        }



        {
            // let stage2Vote : CommunityFundStag2Vote = {
            //     weekNumber:0,
            //     vote: [3,5,1],
            //     nonce: "HPH9QVOQ",
            //     type: CommunityFundVoteType.STAGE_2
            // }

            // let dataRaw =  JSON.stringify(stage2Vote)

            // let signedMessage = await signer.signMessage(dataRaw)

            // let address = ethers.utils.verifyMessage(dataRaw,signedMessage)

            // console.log(dataRaw, signedMessage, address, signer.address) 
        }

        {
            // let stage3Vote: CommunityFundStag3VotePayload = {
            //     weekNumber: 0,
            //     vote: [{
            //         id: 1,
            //         percentage: 40
            //     },
            //     {
            //         id: 3,
            //         percentage: 40
            //     },
            //     {
            //         id: 12,
            //         percentage: 20
            //     }],
            //     nonce: "Q9FMNWKK",
            //     type: CommunityFundVoteType.STAGE_3

            // let dataRaw = JSON.stringify(stage3Vote)

            // let signedMessage = await signer.signMessage(dataRaw)

        }
    }
       

    {
        // let pollVote : PollVotePayload = {
        //     pollId :"5869005e-c43e-4bb1-a57d-4e9a0d4a2ef5",
        //     vote: "6d317c0e-583d-4155-9219-56be1258f5a1",
        //     nonce: "WBKW0N8N",
        // }

        // let dataRaw =  JSON.stringify(pollVote)

        // let signedMessage = await signer.signMessage(dataRaw)

        // console.log(dataRaw, signedMessage, signer.address) 
    }

        // let address = ethers.utils.verifyMessage(dataRaw, signedMessage)

        // console.log(dataRaw, signedMessage, address, signer.address)
    


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
