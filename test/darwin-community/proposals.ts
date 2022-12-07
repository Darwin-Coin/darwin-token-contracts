import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";


import { ethers } from "hardhat";
import { Darwin, DarwinCommunity } from "../../typechain";
import { daysToSeconds, deploy, hoursToSeconds, lastBlockTime, NewProposalParams, setNetworkTimeStamp, weeksToSeconds } from "../utils";

describe("Darwin Community", () => {
    let darwinCommunity:DarwinCommunity
    let darwin: Darwin
    let snapShotId: number;

    let owner: SignerWithAddress
    let devWallet: SignerWithAddress
    
    let others: SignerWithAddress[]

    let addressWith10kTokens : SignerWithAddress
    let addressWithout10kTokens : SignerWithAddress
    
    let decimals : BigNumber

    beforeEach(async () => {

        [owner, ...others] = await ethers.getSigners()
        
        let deployedContract = await deploy();
        darwinCommunity = deployedContract.darwinCommunity
        darwin = deployedContract.darwin
        snapShotId = deployedContract.snapShotId;
        devWallet = deployedContract.dev;
        
        addressWith10kTokens = others[0]
        addressWithout10kTokens  = others[1]

        await darwin.transfer(addressWith10kTokens.address, ethers.utils.parseEther("10000"));

        decimals  = BigNumber.from(10).pow(await darwin.decimals())

        await setNetworkTimeStamp( BigNumber.from(await lastBlockTime()).add(daysToSeconds(20)))
    })

    afterEach(async () => {
        if (snapShotId)
            await ethers.provider.send("evm_revert", [snapShotId]);
    })

    let getProposalParams = async (): Promise<NewProposalParams> => {

        let functionSig = darwinCommunity.interface.functions["newFundCandidate(address,string)"]
        let calldata = ethers.utils.defaultAbiCoder.encode(functionSig.inputs, [darwinCommunity.address, "Proposal Name 123"])

        return {
            targets: [darwinCommunity.address],
            values: [BigNumber.from(0)],
            signatures: [functionSig.format()],
            calldatas: [calldata],
            title: "Title",
            description: "Description",
            other: "",
            endTime: daysToSeconds(3).add((await lastBlockTime()))
        }
    }

    let createNewProposal = async (params: NewProposalParams, account = owner,) => {
        await darwin.connect(account).approve(darwinCommunity.address, decimals.mul(10000))
        return darwinCommunity.connect(account).propose(
            params.targets,
            params.values, 
            params.signatures, 
            params.calldatas, 
            params.title, 
            params.description, 
            params.other, 
            params.endTime, 
            {
                from:account.address
            })
    }

    describe("Create Proposals", () => {

        it("Account with no or less than 10k $DARWIN shouldn't be able to create proposal", async () => {
            let result =  createNewProposal(await getProposalParams(), addressWithout10kTokens)

            await expect(result).to.be.revertedWith("DC::canAccess: not enough $DARWIN");
        });


        it("proposals with too early end date should fail", async () => {

            let params = await getProposalParams();

            params.endTime = await lastBlockTime()

            let resultWithTooEarlyEndDate = createNewProposal(params)

            await expect(resultWithTooEarlyEndDate).to.be.revertedWith("DC::propose: too early end time");
        })

        it("proposals with too late end date should fail", async () => {

            let params = await getProposalParams();

            params.endTime = weeksToSeconds(2).add(await lastBlockTime())

            let resultWithTooLateEndDate = createNewProposal(params)

            await expect(resultWithTooLateEndDate).to.be.revertedWith("DC::propose: too late end time");

        })

        it("proposal with valid data should success with incrementing proposal id", async () => {

            let lastProposalId = await darwinCommunity._lastProposalId();

            let result = await createNewProposal(await getProposalParams())

            let proposalId = await darwinCommunity._lastProposalId();

            expect(proposalId).to.equal(lastProposalId.add(1))
        })


        it("should emit correct proposal values on event", async () => {

            let lastProposalId = await darwinCommunity._lastProposalId();

            let params = await getProposalParams();

            let result = await createNewProposal(params)


            let log = await result.wait()

            let proposalId = await darwinCommunity._lastProposalId();

            const {
                id,
                proposer,
                startTime,
                endTime,
                title,
                description,
                other
            } = log.events!![2].args as any

            let timestamp = await lastBlockTime()

            expect(id).to.equal(proposalId).equal(lastProposalId.add(1))
            expect(proposer).to.equal(owner.address)
            expect(startTime).to.equal((await darwinCommunity.minVotingDelay()).add(timestamp))
            expect(endTime).to.equal(params.endTime)
            expect(title).to.equal(params.title)
            expect(description).to.equal(params.description)
            expect(other).to.equal(params.other)
        })

        it("should set proper proposal values", async () => {

            let lastProposalId = await darwinCommunity._lastProposalId();

            let params = await getProposalParams();

            let result = await createNewProposal(params)


            let proposalId = await darwinCommunity._lastProposalId();

            let proposal = await darwinCommunity.getProposal(proposalId);

            let timestamp = await lastBlockTime()


            expect(proposal.id).to.equal(proposalId).equal(lastProposalId.add(1))
            expect(proposal.proposer).to.equal(owner.address)
            expect(proposal.targets).to.deep.equal(params.targets)
            expect(proposal[3]).to.deep.equal(params.values)
            expect(proposal.signatures).to.deep.equal(params.signatures)
            expect(proposal.calldatas).to.deep.equal(params.calldatas)
            expect(proposal.startTime).to.equal((await darwinCommunity.minVotingDelay()).add(timestamp))
            expect(proposal.endTime).to.equal(params.endTime)
            expect(proposal.forVotes).to.equal(BigNumber.from(0))
            expect(proposal.againstVotes).to.equal(BigNumber.from(0))
            expect(proposal.canceled).to.be.false
            expect(proposal.executed).to.be.false
        })

    });


    const createProposal = async (endTime: number) => {
       
        let params = await getProposalParams();

        params.endTime = endTime;

        await createNewProposal(params, addressWith10kTokens)

        return await darwinCommunity._lastProposalId();
    }


    describe("Cancel Proposal", () => {

        it("owner should be cancel proposal", async () => {

            let proposalId = await createProposal(daysToSeconds(3).add(await lastBlockTime()).toNumber());

            await darwinCommunity.cancel(proposalId);

            let proposal = await darwinCommunity.getProposal(proposalId)

            expect(proposal.canceled).to.be.true;
        })

        it("proposal owner should be cancel proposal", async () => {

            let proposalId = await createProposal(daysToSeconds(3).add(await lastBlockTime()).toNumber());

            await darwinCommunity.connect(addressWith10kTokens).cancel(proposalId, {
                from: addressWith10kTokens.address
            });

            let proposal = await darwinCommunity.connect(addressWith10kTokens).getProposal(proposalId, {
                from: addressWith10kTokens.address
            })

            expect(proposal.canceled).to.be.true;

        })

        it("people other than proposal owner or owner should not be cancel proposal", async () => {

            let proposalId = await createProposal(daysToSeconds(3).add(await lastBlockTime()).toNumber());

            let result = darwinCommunity.connect(devWallet).cancel(proposalId, {
                from: devWallet.address
            });

            await expect(result).to.revertedWith("DC::cancel: cannot cancel proposal");
        })

    })


    describe("Proposal Voting", () => {

        let proposalId: number

        beforeEach(async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            proposalId = (await createProposal(endDate.toNumber())).toNumber();

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])
        })

        it("Account with no or less than 10k $DARWIN shouldn't be able to vote on proposal", async () => {
            await darwin.connect(addressWithout10kTokens).approve(darwinCommunity.address, ethers.utils.parseEther("10000"));

            let result = darwinCommunity.connect(addressWithout10kTokens).castVote(proposalId, true, decimals, {
                from: addressWithout10kTokens.address
            });

            await expect(result).to.be.revertedWith("DC::canAccess: not enough $DARWIN");
        });

        it("Account with 10k $DARWIN should be able to vote on proposal", async () => {
            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"));
            await darwinCommunity.connect(addressWith10kTokens).castVote(proposalId, false, decimals, {
                from: addressWith10kTokens.address
            });

        });


        it("Should correctly store up vote", async () => {
            let proposalBeforeVote = await darwinCommunity.getProposal(proposalId);

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            await darwinCommunity.castVote(proposalId, true,decimals);

            let proposalAfterVote = await darwinCommunity.getProposal(proposalId);

            let recepit = await darwinCommunity.getVoteReceipt(proposalId);

            expect(proposalAfterVote.forVotes).to.equal(proposalBeforeVote.forVotes.add(1))
            expect(proposalAfterVote.againstVotes).to.equal(proposalBeforeVote.againstVotes)
            expect(recepit.hasVoted).to.be.true;
            expect(recepit.inSupport).to.be.true;
        });


        it("Should correctly store down vote", async () => {

            let proposalBeforeVote = await darwinCommunity.getProposal(proposalId);

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            await darwinCommunity.castVote(proposalId, false, decimals);

            let proposalAfterVote = await darwinCommunity.getProposal(proposalId);

            let recepit = await darwinCommunity.getVoteReceipt(proposalId);

            expect(proposalAfterVote.forVotes).to.equal(proposalBeforeVote.forVotes)
            expect(proposalAfterVote.againstVotes).to.equal(proposalBeforeVote.againstVotes.add(1))
            expect(recepit.hasVoted).to.be.true;
            expect(recepit.inSupport).to.be.false;
        });

        it("should not vote twice", async () => {
            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            await darwinCommunity.castVote(proposalId, true, decimals);

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            let result = darwinCommunity.castVote(proposalId, true, decimals);

            await expect(result).to.be.revertedWith("DC::castVoteInternal: voter already voted")
        });

        it("should not vote on ended proposals", async () => {

            await ethers.provider.send("evm_setNextBlockTimestamp", [daysToSeconds(12).add(await lastBlockTime()).toNumber()])
            await ethers.provider.send("evm_mine", [])

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            let result = darwinCommunity.castVote(proposalId, true, decimals);

            await expect(result).to.be.revertedWith("DC::castVoteInternal: voting is closed");
        });

    });

    describe("Action Execution", () => {

        it("shouldn't let action to be performed before the proposal ends", async () => {

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            let proposalId = await createProposal(daysToSeconds(4).add(await lastBlockTime()).toNumber());

            let result = darwinCommunity.execute(proposalId);

            await expect(result).to.revertedWith("DC::execute: proposal can only be executed if it is queued");
        })

        it("should revert if vote is not is favour", async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            let proposalId = await createProposal(endDate.toNumber());

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            await darwinCommunity.castVote(proposalId, false, decimals)

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.add(hoursToSeconds(1)).toNumber()])
            await ethers.provider.send("evm_mine", [])

            let result = darwinCommunity.execute(proposalId);

            await expect(result).to.revertedWith("DC::execute: proposal can only be executed if it is queued");
        })

        it("should call the correct function of vote was in favour", async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            let proposalId = await createProposal(endDate.toNumber());

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            await darwinCommunity.castVote(proposalId, true, decimals)

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.add(hoursToSeconds(1)).toNumber()])
            await ethers.provider.send("evm_mine", [])

            let prevFundCandidateCount = (await darwinCommunity.getActiveFundDandidateIds()).length;

            await darwinCommunity.execute(proposalId);

            let proposal = await darwinCommunity.getProposal(proposalId);

            let newFundCandidateCount = (await darwinCommunity.getActiveFundDandidateIds()).length;

            expect(proposal.executed).to.be.true;
            expect(newFundCandidateCount).to.be.equal(prevFundCandidateCount + 1);
        })


        it("shouldn't calculate result if it was already calculated", async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            let proposalId = await createProposal(endDate.toNumber());

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])

            await darwin.approve(darwinCommunity.address, ethers.utils.parseEther("10000"))
            await darwinCommunity.castVote(proposalId, true, decimals)

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.add(hoursToSeconds(1)).toNumber()])
            await ethers.provider.send("evm_mine", [])

            await darwinCommunity.execute(proposalId);
            let result = darwinCommunity.execute(proposalId);

            expect(result).to.revertedWith("DC::execute: proposal can only be executed if it is queued")
        })

    });

});