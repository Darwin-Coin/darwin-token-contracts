import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";


import { ethers } from "hardhat";
import { Darwin, DarwinCommunity } from "../../typechain";
import { daysToSeconds, deploy, hoursToSeconds, lastBlockTime, NewProposalParams, now, weeksToSeconds } from "../utils";

describe("NotCommunity", () => {
    let darwinComunity:DarwinCommunity
    let darwin: Darwin
    let snapShotId: number;

    let owner: SignerWithAddress
    let address0: SignerWithAddress
    let address1: SignerWithAddress
    let address2: SignerWithAddress

    let others: SignerWithAddress[]

    before(async () => {
        [owner, address0, address1, address2, ...others] = await ethers.getSigners()
    })

    beforeEach(async () => {
        let deployedContract = await deploy();
        darwinComunity = deployedContract.darwinCommunity
        darwin = deployedContract.darwin
        snapShotId = deployedContract.snapShotId;
    })

    afterEach(async () => {
        if (snapShotId)
            await ethers.provider.send("evm_revert", [snapShotId]);
    })

    let getProposalParams = async (): Promise<NewProposalParams> => {

        let functionSig = darwinComunity.interface.functions["newFundCandidate(address,string)"]
        let calldata = ethers.utils.defaultAbiCoder.encode(functionSig.inputs, [address0.address, "Proposal Name 123"])

        return {
            targets: [darwinComunity.address],
            values: [BigNumber.from(0)],
            signatures: [functionSig.format()],
            calldatas: [calldata],
            title: "Title",
            description: "Description",
            other: "",
            endTime: daysToSeconds(3).add((await lastBlockTime()))
        }
    }

    let createNewProposal = (params: NewProposalParams, account = owner,) => {

        return darwinComunity.connect(account).propose(params.targets, params.values, params.signatures, params.calldatas, params.title, params.description, params.other, params.endTime)

        // let proposalId = await darwinComunity._lastProposalId()

        // let proposal = await darwinComunity.getProposal(proposalId)

        // proposal.calldatas.forEach((it, index) => {

        //     let face = new ethers.utils.Interface([`function ${proposal.signatures[index]}`])
        //     let f = face.getFunction(proposal.signatures[index])

        //     console.log(ethers.utils.defaultAbiCoder.decode(f.inputs, it))
        // })
    }

    describe("Create Proposals", () => {

        it("Account with no or less then 10k $NOT shouldn't be able to create proposal", async () => {

            let result = createNewProposal(await getProposalParams(), address0)

            await expect(result).to.be.revertedWith("NC::canAccess: not enouch $NOT");
        });


        it("proposals with too early end date should fail", async () => {

            let params = await getProposalParams();

            params.endTime = await lastBlockTime()

            let resultWithTooEarlyEndDate = createNewProposal(params)

            await expect(resultWithTooEarlyEndDate).to.be.revertedWith("NC::propose: too early end time");
        })

        it("proposals with too late end date should fail", async () => {


            let params = await getProposalParams();

            params.endTime = weeksToSeconds(2).add(await lastBlockTime())

            let resultWithTooLateEndDate = createNewProposal(params)

            await expect(resultWithTooLateEndDate).to.be.revertedWith("NC::propose: too late end time");

        })

        it("proposal with valid data should success with incrementing proposal id", async () => {

            let lastProposalId = await darwinComunity._lastProposalId();

            let result = await createNewProposal(await getProposalParams())

            let proposalId = await darwinComunity._lastProposalId();

            expect(proposalId).to.equal(lastProposalId.add(1))
        })


        it("should emit correct proposal values on event", async () => {

            let lastProposalId = await darwinComunity._lastProposalId();

            let params = await getProposalParams();

            let result = await createNewProposal(params)


            let log = await result.wait()

            let proposalId = await darwinComunity._lastProposalId();

            const {
                id,
                proposer,
                startTime,
                endTime,
                title,
                description,
                other
            } = log.events!![0].args as any

            let timestamp = await lastBlockTime()

            expect(id).to.equal(proposalId).equal(lastProposalId.add(1))
            expect(proposer).to.equal(owner.address)
            expect(startTime).to.equal((await darwinComunity.minVotingDelay()).add(timestamp))
            expect(endTime).to.equal(params.endTime)
            expect(title).to.equal(params.title)
            expect(description).to.equal(params.description)
            expect(other).to.equal(params.other)
        })

        it("should set proper proposal values", async () => {

            let lastProposalId = await darwinComunity._lastProposalId();

            let params = await getProposalParams();

            let result = await createNewProposal(params)


            let proposalId = await darwinComunity._lastProposalId();

            let proposal = await darwinComunity.getProposal(proposalId);

            let timestamp = await lastBlockTime()


            expect(proposal.id).to.equal(proposalId).equal(lastProposalId.add(1))
            expect(proposal.proposer).to.equal(owner.address)
            expect(proposal.targets).to.deep.equal(params.targets)
            expect(proposal[3]).to.deep.equal(params.values)
            expect(proposal.signatures).to.deep.equal(params.signatures)
            expect(proposal.calldatas).to.deep.equal(params.calldatas)
            expect(proposal.startTime).to.equal((await darwinComunity.minVotingDelay()).add(timestamp))
            expect(proposal.endTime).to.equal(params.endTime)
            expect(proposal.forVotes).to.equal(BigNumber.from(0))
            expect(proposal.againstVotes).to.equal(BigNumber.from(0))
            expect(proposal.canceled).to.be.false
            expect(proposal.executed).to.be.false
        })

    });


    const createPropoal = async (endTime: number) => {
        await darwin.transfer(address0.address, BigNumber.from(100000 * 10 ** 9))
        await darwin.transfer(address1.address, BigNumber.from(100000 * 10 ** 9))

        let params = await getProposalParams();

        params.endTime = endTime;

        await createNewProposal(params, address0)

        return await darwinComunity._lastProposalId();
    }


    describe("Cancel Proposal", () => {

        it("owner should be cancel proposal", async () => {

            let proposalId = await createPropoal(daysToSeconds(3).add(now()).toNumber());

            await darwinComunity.cancel(proposalId);

            let proposal = await darwinComunity.getProposal(proposalId)

            expect(proposal.canceled).to.be.true;
        })

        it("proposal owner should be cancel proposal", async () => {

            let proposalId = await createPropoal(daysToSeconds(3).add(now()).toNumber());

            await darwinComunity.connect(address0).cancel(proposalId, {
                from: address0.address
            });

            let proposal = await darwinComunity.connect(address0).getProposal(proposalId, {
                from: address0.address
            })

            expect(proposal.canceled).to.be.true;

        })

        it("people other then proposal owner or owner should not be cancel proposal", async () => {

            let proposalId = await createPropoal(daysToSeconds(3).add(now()).toNumber());

            let result = darwinComunity.connect(address1).cancel(proposalId, {
                from: address1.address
            });

            await expect(result).to.revertedWith("NC::cancel: cannot cancel proposal");
        })

    })





    describe("Proposal Voting", () => {

        let proposalId: number

        beforeEach(async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            proposalId = (await createPropoal(endDate.toNumber())).toNumber();

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])
        })

        it("Account with no or less then 10k $NOT shouldn't be able to vote on proposal", async () => {


            let result = darwinComunity.connect(address2).castVote(proposalId, true, {
                from: address2.address
            });

            await expect(result).to.be.revertedWith("NC::canAccess: not enouch $NOT");

        });

        it("Account with 10k $NOT shouldn be able to vote on proposal", async () => {

            await darwin.transfer(address2.address, BigNumber.from(10000 * 10 ** 9))

            await darwinComunity.connect(address2).castVote(proposalId, false, {
                from: address2.address
            });

        });


        it("Should correctly store up vote", async () => {


            let proposalBeforeVote = await darwinComunity.getProposal(proposalId);

            await darwinComunity.castVote(proposalId, true);

            let proposalAfterVote = await darwinComunity.getProposal(proposalId);

            let recepit = await darwinComunity.getVoteReceipt(proposalId);

            expect(proposalAfterVote.forVotes).to.equal(proposalBeforeVote.forVotes.add(1))
            expect(proposalAfterVote.againstVotes).to.equal(proposalBeforeVote.againstVotes)
            expect(recepit.hasVoted).to.be.true;
            expect(recepit.inSupport).to.be.true;
        });


        it("Should correctly store down vote", async () => {

            let proposalBeforeVote = await darwinComunity.getProposal(proposalId);

            await darwinComunity.castVote(proposalId, false);

            let proposalAfterVote = await darwinComunity.getProposal(proposalId);

            let recepit = await darwinComunity.getVoteReceipt(proposalId);

            expect(proposalAfterVote.forVotes).to.equal(proposalBeforeVote.forVotes)
            expect(proposalAfterVote.againstVotes).to.equal(proposalBeforeVote.againstVotes.add(1))
            expect(recepit.hasVoted).to.be.true;
            expect(recepit.inSupport).to.be.false;
        });

        it("It shouldn't let vote twice", async () => {

            await darwinComunity.castVote(proposalId, true);

            let result = darwinComunity.castVote(proposalId, true);

            await expect(result).to.be.revertedWith("NC::castVoteInternal: voter already voted")
        });

        it("It shouldn't let vote on ended proposals", async () => {

            await ethers.provider.send("evm_setNextBlockTimestamp", [daysToSeconds(12).add(await lastBlockTime()).toNumber()])
            await ethers.provider.send("evm_mine", [])

            let result = darwinComunity.castVote(proposalId, true);

            await expect(result).to.be.revertedWith("NC::castVoteInternal: voting is closed");
        });

    });



    describe("Action Execution", () => {


        it("it shouldn't let action to be performed before the proposal ends", async () => {

            let proposalId = await createPropoal(daysToSeconds(4).add(now()).toNumber());

            let result = darwinComunity.execute(proposalId);

            await expect(result).to.revertedWith("NC::execute: proposal can only be executed if it is queued");
        })

        it("it should revert if vote is not is favour", async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            let proposalId = await createPropoal(endDate.toNumber());

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])

            await darwinComunity.castVote(proposalId, false)

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.add(hoursToSeconds(1)).toNumber()])
            await ethers.provider.send("evm_mine", [])

            let result = darwinComunity.execute(proposalId);

            await expect(result).to.revertedWith("NC::execute: proposal can only be executed if it is queued");
        })

        it("it should call the correct function of vote was in favour", async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            let proposalId = await createPropoal(endDate.toNumber());

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])

            await darwinComunity.castVote(proposalId, true)

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.add(hoursToSeconds(1)).toNumber()])
            await ethers.provider.send("evm_mine", [])

            let prevFundCandidateCount = (await darwinComunity.getActiveFundDandidateIds()).length;

            await darwinComunity.execute(proposalId);

            let proposal = await darwinComunity.getProposal(proposalId);

            let newFundCandidateCount = (await darwinComunity.getActiveFundDandidateIds()).length;

            expect(proposal.executed).to.be.true;
            expect(newFundCandidateCount).to.be.equal(prevFundCandidateCount + 1);
        })


        it("it shouldn't let calculate result if it was already caluclated", async () => {

            let endDate = daysToSeconds(5).add(await lastBlockTime())

            let proposalId = await createPropoal(endDate.toNumber());

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.sub(hoursToSeconds(1)).toNumber()])

            await darwinComunity.castVote(proposalId, true)

            await ethers.provider.send("evm_setNextBlockTimestamp", [endDate.add(hoursToSeconds(1)).toNumber()])
            await ethers.provider.send("evm_mine", [])

            await darwinComunity.execute(proposalId);
            let result = darwinComunity.execute(proposalId);

            expect(result).to.revertedWith("NC::execute: proposal can only be executed if it is queued")
        })

    });

});