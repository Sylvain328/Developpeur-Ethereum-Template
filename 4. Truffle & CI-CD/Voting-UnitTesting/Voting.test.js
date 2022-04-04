const Voting = artifacts.require("./Voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {

    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const voter3 = accounts[3];

    ///////////////////////////////
    ///         GETTER          ///
    ///////////////////////////////

    context("Getters Tests", () => {

        beforeEach(async () => {
            VotingInstance = await Voting.new({from:owner});
        });

        describe("getVoter() method", function () {

            it("should return is registered", async () => {
                await VotingInstance.addVoter(owner);
                const storedData = await VotingInstance.getVoter(owner,{from: owner});
                expect(storedData.isRegistered).to.be.ok;
            });
    
            it("should return not registered", async () => {
                await VotingInstance.addVoter(owner);
                const storedData = await VotingInstance.getVoter(voter2, {from: owner});
                expect(storedData.isRegistered).to.be.false;
            });
        });

        describe("getOneProposal() method", () => {

            it("should return a proposal", async () => {
                await VotingInstance.addVoter(owner, {from: owner});
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.addProposal("proposition", {from: owner});
                const proposal = await VotingInstance.getOneProposal(0, {from: owner});

                expect(proposal.description).to.equal("proposition");
                expect(new BN(proposal.voteCount)).to.be.bignumber.equal(new BN(0));
            });
        });
        
    });

    ///////////////////////////////
    ///         METHODS         ///
    ///////////////////////////////

    context("Methods tests", () => {

        beforeEach(async () => {
            VotingInstance = await Voting.new({from:owner});
        });

        describe("addVoter() method", () => {

            it("should add voter in voter map", async () => {
                await VotingInstance.addVoter(owner, {from: owner});
                const storedData = await VotingInstance.getVoter(owner, {from: owner});
                expect(storedData.isRegistered).to.be.ok;
            });
        });

        describe("addProposal() method", () => {

            it("should add new proposal in proposal array", async () => {
                // Add new 
                await VotingInstance.addVoter(owner, {from: owner});
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.addProposal("proposition", {from: owner});
                const proposal = await VotingInstance.getOneProposal(0, {from: owner});

                expect(proposal.description).to.equal("proposition");
                expect(new BN(proposal.voteCount)).to.be.bignumber.equal(new BN(0));
            });
        });

        describe("startProposalsRegistering() method", () => {

            it("should update the voting session to ProposalsRegistrationStarted step", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                const step = await VotingInstance.workflowStatus();
                expect(new BN(step)).to.be.bignumber.equal(new BN(1));
            });
        });

        describe("endProposalsRegistering() method", () => {

            it("should update the voting session to ProposalsRegistrationEnded step", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.endProposalsRegistering({from: owner});
                const step = await VotingInstance.workflowStatus.call();
                expect(new BN(step)).to.be.bignumber.equal(new BN(2));
            });
        });

        describe("startVotingSession() method", () => {

            it("should update the voting session to VotingSessionStarted step", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.endProposalsRegistering({from: owner});
                await VotingInstance.startVotingSession({from: owner});
                const step = await VotingInstance.workflowStatus.call();
                expect(new BN(step)).to.be.bignumber.equal(new BN(3));
            });
        });

        describe("endVotingSession() method", () => {

            it("should update the voting session to VotingSessionEnded step", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.endProposalsRegistering({from: owner});
                await VotingInstance.startVotingSession({from: owner});
                await VotingInstance.endVotingSession({from: owner});
                const step = await VotingInstance.workflowStatus.call();
                expect(new BN(step)).to.be.bignumber.equal(new BN(4));
            });
        });

        describe("setVote() method", () => {

            /**
             * Create a voter, create proposal and vote for the second Proposal
             */
            async function voterAddProposalsAndVoteForSecondProposal() {
                await VotingInstance.addVoter(owner, {from: owner});
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.addProposal("proposition 1", {from: owner});
                await VotingInstance.addProposal("proposition 2", {from: owner});
                await VotingInstance.endProposalsRegistering({from: owner});
                await VotingInstance.startVotingSession({from: owner});
                await VotingInstance.setVote(1, {from: owner});
            }

            it("should set hasVoted on the voter", async () => {

                await voterAddProposalsAndVoteForSecondProposal();
                const voterData = await VotingInstance.getVoter(owner, {from: owner});

                expect(voterData.hasVoted).to.be.ok;
            });

            it("should set votedProposalId on the voter", async () => {

                await voterAddProposalsAndVoteForSecondProposal();
                const voterData = await VotingInstance.getVoter(owner, {from: owner});

                expect(new BN(voterData.votedProposalId)).to.be.bignumber.equal(new BN(1));
            });

            it("should update voteCount on the proposal", async () => {

                await voterAddProposalsAndVoteForSecondProposal();
                const proposalData = await VotingInstance.getOneProposal(1, {from: owner});
                expect(new BN(proposalData.voteCount)).to.be.bignumber.equal(new BN(1));
            });
        });

        describe("tallyVotes() method", () => {

            async function prepareVoteSession() {
                await VotingInstance.addVoter(owner, {from: owner});
                await VotingInstance.addVoter(voter1, {from: owner});
                await VotingInstance.addVoter(voter2, {from: owner});
                await VotingInstance.addVoter(voter3, {from: owner});
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.addProposal("proposition 1", {from: owner});
                await VotingInstance.addProposal("proposition 2", {from: voter1});
                await VotingInstance.addProposal("proposition 3", {from: voter1});
                await VotingInstance.addProposal("proposition 4", {from: voter3});
                await VotingInstance.endProposalsRegistering({from: owner});
                await VotingInstance.startVotingSession({from: owner});
            }

            it("should set second proposition as winner proposal", async () => {

                await prepareVoteSession();

                await VotingInstance.setVote(1, {from: owner});
                await VotingInstance.setVote(1, {from: voter1});
                await VotingInstance.setVote(3, {from: voter2});
                await VotingInstance.setVote(1, {from: voter3});
                await VotingInstance.endVotingSession({from: owner});
                await VotingInstance.tallyVotes({from: owner})

                const winner = await VotingInstance.winningProposalID.call();

                expect(new BN(winner)).to.be.bignumber.equal(new BN(1));
            });

            it("should keep proposal with the lowest id if two proposals have the same vote count", async () => {

                await prepareVoteSession();

                await VotingInstance.setVote(1, {from: owner});
                await VotingInstance.setVote(1, {from: voter1});
                await VotingInstance.setVote(3, {from: voter2});
                await VotingInstance.setVote(3, {from: voter3});
                await VotingInstance.endVotingSession({from: owner});
                await VotingInstance.tallyVotes({from: owner})

                const winner = await VotingInstance.winningProposalID.call();
                expect(new BN(winner)).to.be.bignumber.equal(new BN(1));
            });

            it("should set workflowStatus to VotesTallied", async () => {

                await prepareVoteSession();
                await VotingInstance.setVote(1, {from: owner});
                await VotingInstance.endVotingSession({from: owner});
                await VotingInstance.tallyVotes({from: owner})

                const status = await VotingInstance.workflowStatus.call();
                expect(new BN(status)).to.be.bignumber.equal(new BN(5));
            });

            
        });
    });

    ///////////////////////////////
    ///         REQUIRES        ///
    ///////////////////////////////

    context("Requires Tests", () => {

        
        describe("getVoter() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => you're not a voter", async () => {
                await expectRevert(VotingInstance.getVoter(owner, {from: owner}), "You're not a voter");
            });
        });

        describe("getVoter() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => you're not a voter, on getOneProposal() method", async () => {
                await expectRevert(VotingInstance.getOneProposal(owner, {from: owner}), "You're not a voter");
            });
        });

        describe("addVoter() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });
    
            it("should revert => because you're not the owner", async () => {
                await expectRevert(VotingInstance.addVoter(owner, {from: voter2}), "Ownable: caller is not the owner");
            });

            it("should revert => because you are already registered", async () => {
                await VotingInstance.addVoter(owner, {from: owner});
                await expectRevert(VotingInstance.addVoter(owner, {from: owner}), "Already registered");
            });

            it("should revert => because voters registration is not open yet when the status is ProposalsRegistrationStarted", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.addVoter(owner, {from: owner}), "Voters registration is not open yet");
            });

            it("should revert => because voters registration is not open yet when the status is ProposalsRegistrationEnded", async () => {
                await VotingInstance.endProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.addVoter(owner, {from: owner}), "Voters registration is not open yet");
            });

            it("should revert => because voters registration is not open yet when the status is VotingSessionStarted", async () => {
                await VotingInstance.startVotingSession({from: owner});
                await expectRevert(VotingInstance.addVoter(owner, {from: owner}), "Voters registration is not open yet");
            });

            it("should revert => because voters registration is not open yet when the status is VotingSessionEnded", async () => {
                await VotingInstance.endVotingSession({from: owner});
                await expectRevert(VotingInstance.addVoter(owner, {from: owner}), "Voters registration is not open yet");
            });

            it("should revert => because voters registration is not open yet when the status is VotesTallied", async () => {
                await VotingInstance.tallyVotes({from: owner});
                await expectRevert(VotingInstance.addVoter(owner, {from: owner}), "Voters registration is not open yet");
            });
        });

        describe("addProposal() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => you're not a voter", async () => {
                await expectRevert(VotingInstance.addProposal("test", {from: owner}), "You're not a voter");
            });

            it("should revert => Proposals are not allowed yet", async () => {
                await VotingInstance.addVoter(owner, {from: owner});
                await expectRevert(VotingInstance.addProposal("test", {from: owner}), "Proposals are not allowed yet");
            });

            it("should revert => Vous ne pouvez pas ne rien proposer", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.addProposal("", {from: owner}), "Vous ne pouvez pas ne rien proposer");
            });

            it("should revert => Proposals are not allowed yet on ProposalsRegistrationEnded", async () => {
                await VotingInstance.endProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.addProposal("test", {from: owner}), "Proposals are not allowed yet");
            });

            it("should revert => Proposals are not allowed yet on VoteSessionStarted status", async () => {
                await VotingInstance.startVotingSession({from: owner});
                await expectRevert(VotingInstance.addProposal("test", {from: owner}), "Proposals are not allowed yet");
            });

            it("should revert => Proposals are not allowed yet on VoteSessionEnded status", async () => {
                await VotingInstance.endVotingSession({from: owner});
                await expectRevert(VotingInstance.addProposal("test", {from: owner}), "Proposals are not allowed yet");
            });

            it("should revert => Proposals are not allowed yet on VotingTallied status", async () => {
                await VotingInstance.tallyVotes({from: owner});
                await expectRevert(VotingInstance.addProposal("test", {from: owner}), "Proposals are not allowed yet");
            });
        });

        describe("setVote() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => you're not a voter", async () => {
                await expectRevert(VotingInstance.setVote(0, {from: owner}), "You're not a voter");
            });

            it("should revert => Voting session havent started yet on RegisteringVoters status", async () => {
                await VotingInstance.addVoter(owner, {from: owner});
                await expectRevert(VotingInstance.setVote(0, {from: owner}), "Voting session havent started yet");
            });

            it("should revert => Voting session havent started yet on ProposalsRegistrationStarted status", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await VotingInstance.addProposal("Proposition", {from: owner});
                await expectRevert(VotingInstance.setVote(0, {from: owner}), "Voting session havent started yet");
            });

            it("should revert => Voting session havent started yet on ProposalsRegistrationEnded", async () => {
                await VotingInstance.endProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.setVote(0, {from: owner}), "Voting session havent started yet");
            });

            it("should revert => Proposal not found", async () => {
                await VotingInstance.startVotingSession({from: owner});
                await expectRevert(VotingInstance.setVote(15, {from: owner}), "Proposal not found");
            });

            // This test is KO because of the require => require(_id <= proposalsArray.length, 'Proposal not found') 
            // Proposal one doesn't exists
            it("should revert => Proposal not found when id equal length", async () => {
                await expectRevert(VotingInstance.setVote(1, {from: owner}), "Proposal not found");
            });

            it("should revert => You have already voted", async () => {
                VotingInstance.setVote(0, {from: owner});
                await expectRevert(VotingInstance.setVote(0, {from: owner}), "You have already voted");
            });

            it("should revert => Voting session havent started yet on VotingSessionEnded status", async () => {
                await VotingInstance.endVotingSession({from: owner});
                await expectRevert(VotingInstance.setVote(0, {from: owner}), "Voting session havent started yet");
            });

            it("should revert => Voting session havent started yet on VotingTallied status", async () => {
                await VotingInstance.tallyVotes({from: owner});
                await expectRevert(VotingInstance.setVote(0, {from: owner}), "Voting session havent started yet");
            });
        });

        describe("startProposalsRegistering() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => you're not the owner", async () => {
                await expectRevert(VotingInstance.startProposalsRegistering({from: voter2}), "Ownable: caller is not the owner");
            });

            it("should revert => Registering proposals cant be started now, on ProposalRegistrationStarted status", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.startProposalsRegistering({from: owner}), "Registering proposals cant be started now");
            });

            it("should revert => Registering proposals cant be started now, on ProposalsRegistrationEnded status", async () => {
                await VotingInstance.endProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.startProposalsRegistering({from: owner}), "Registering proposals cant be started now");
            });

            it("should revert => Registering proposals cant be started now, on VoteSessionStarted status", async () => {
                await VotingInstance.startVotingSession({from: owner});
                await expectRevert(VotingInstance.startProposalsRegistering({from: owner}), "Registering proposals cant be started now");
            });

            it("should revert => Registering proposals cant be started now, on VoteSessionEnded status", async () => {
                await VotingInstance.endVotingSession({from: owner});
                await expectRevert(VotingInstance.startProposalsRegistering({from: owner}), "Registering proposals cant be started now");
            });

            it("should revert => Registering proposals cant be started now, on VoteTallied status", async () => {
                await VotingInstance.tallyVotes({from: owner});
                await expectRevert(VotingInstance.startProposalsRegistering({from: owner}), "Registering proposals cant be started now");
            });
            
        });

        describe("endProposalsRegistering() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => you're not the owner", async () => {
                await expectRevert(VotingInstance.endProposalsRegistering({from: voter2}), "Ownable: caller is not the owner");
            });

            it("should revert => Registering proposals havent started yet, on RegisteringVoters status", async () => {
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), "Registering proposals havent started yet");
            });

            it("should revert => Registering proposals havent started yet, on RegisteringProposalEnded status", async () => {
                await VotingInstance.startProposalsRegistering();
                await VotingInstance.endProposalsRegistering();
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), "Registering proposals havent started yet");
            });

            it("should revert => Registering proposals havent started yet, on VotingSessionStarted status", async () => {
                await VotingInstance.startVotingSession();
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), "Registering proposals havent started yet");
            });

            it("should revert => Registering proposals havent started yet, on VotingSessionEnded status", async () => {
                await VotingInstance.endVotingSession();
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), "Registering proposals havent started yet");
            });

            it("should revert => Registering proposals havent started yet, on VoteTallied status", async () => {
                await VotingInstance.tallyVotes();
                await expectRevert(VotingInstance.endProposalsRegistering({from: owner}), "Registering proposals havent started yet");
            });

        });

        describe("startVotingSession() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => you're not the owner", async () => {
                await expectRevert(VotingInstance.startVotingSession({from: voter2}), "Ownable: caller is not the owner");
            });

            it("should revert => Registering proposals phase is not finished, on RegisteringVoters status", async () => {
                await expectRevert(VotingInstance.startVotingSession({from: owner}), "Registering proposals phase is not finished");
            });

            it("should revert => Registering proposals phase is not finished, on ProposalRegisteringStarted status", async () => {
                await VotingInstance.startProposalsRegistering();
                await expectRevert(VotingInstance.startVotingSession({from: owner}), "Registering proposals phase is not finished");
            });

            it("should revert => Registering proposals phase is not finished, on VoteSessionStarted status", async () => {
                await VotingInstance.endProposalsRegistering();
                await VotingInstance.startVotingSession();
                await expectRevert(VotingInstance.startVotingSession({from: owner}), "Registering proposals phase is not finished");
            });

            it("should revert => Registering proposals phase is not finished, on VoteSessionEnded status", async () => {
                await VotingInstance.endVotingSession();
                await expectRevert(VotingInstance.startVotingSession({from: owner}), "Registering proposals phase is not finished");
            });

            it("should revert => Registering proposals phase is not finished, on VoteTallied status", async () => {
                await VotingInstance.tallyVotes();
                await expectRevert(VotingInstance.startVotingSession({from: owner}), "Registering proposals phase is not finished");
            });
        });

        describe("endVotingSession() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => You're not the owner", async () => {
                await expectRevert(VotingInstance.endVotingSession({from: voter2}), "Ownable: caller is not the owner");
            });

            it("should revert => Voting session havent started yet, on RegisteringVoter status", async () => {
                await expectRevert(VotingInstance.endVotingSession({from: owner}), "Voting session havent started yet");
            });

            it("should revert => Voting session havent started yet, on ProposalRegisteringStarted status", async () => {
                await VotingInstance.startProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.endVotingSession({from: owner}), "Voting session havent started yet");
            });

            it("should revert => Voting session havent started yet, on ProposalRegisteringEnded status", async () => {
                await VotingInstance.endProposalsRegistering({from: owner});
                await expectRevert(VotingInstance.endVotingSession({from: owner}), "Voting session havent started yet");
            });

            it("should revert => Voting session havent started yet, on VotingSessionEnded status", async () => {
                await VotingInstance.startVotingSession({from: owner});
                await VotingInstance.endVotingSession({from: owner});
                await expectRevert(VotingInstance.endVotingSession({from: owner}), "Voting session havent started yet");
            });

            it("should revert => Voting session havent started yet, on VoteTallied status", async () => {
                await VotingInstance.tallyVotes({from: owner});
                await expectRevert(VotingInstance.endVotingSession({from: owner}), "Voting session havent started yet");
            });
        });

        describe("tallyVotes() method", () => {

            before(async () => {
                VotingInstance = await Voting.new({from:owner});
            });

            it("should revert => You're not the owner", async () => {
                await expectRevert(VotingInstance.tallyVotes({from: voter2}), "Ownable: caller is not the owner");
            });

            it("should revert => Current status is not voting session ended, on RegisteringVoter status", async () => {
                await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
            });

            it("should revert => Current status is not voting session ended, on ProposalRegisteringStarted status", async () => {
                await VotingInstance.startProposalsRegistering({from: owner})
                await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
            });

            it("should revert => Current status is not voting session ended, on ProposalRegisteringEnded status", async () => {
                await VotingInstance.endProposalsRegistering({from: owner})
                await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
            });

            it("should revert => Current status is not voting session ended, on VoteSessionStarted status", async () => {
                await VotingInstance.startVotingSession({from: owner})
                await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
            });

            it("should revert => Current status is not voting session ended, on VoteTallied status", async () => {
                await VotingInstance.endVotingSession({from: owner})
                await VotingInstance.tallyVotes({from: owner})
                await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
            });
        });

    });

    ///////////////////////////////
    ///         EVENTS          ///
    ///////////////////////////////

    context("Event Tests", () => {

        before(async () => {
            VotingInstance = await Voting.new({from:owner});
        });

        it("should emits => VoterRegistered", async () => {
            expectEvent(await VotingInstance.addVoter(owner, { from: owner }), "VoterRegistered", {voterAddress: owner});
        });

        it("should emits => WorkflowStatusChange, from RegisteringVoters to ProposalsRegistrationStarted", async () => {
            
            expectEvent(await VotingInstance.startProposalsRegistering({ from: owner }), "WorkflowStatusChange", {previousStatus: new BN(0), newStatus: new BN(1)});
        });

        it("should emits => ProposalRegistered", async () => {
            
            expectEvent(await VotingInstance.addProposal("Proposition", { from: owner }), "ProposalRegistered", {proposalId: new BN(0)});
        });

        it("should emits => WorkflowStatusChange, from ProposalsRegistrationStarted to ProposalsRegistrationEnded", async () => {
            
            expectEvent(await VotingInstance.endProposalsRegistering({ from: owner }), "WorkflowStatusChange", {previousStatus: new BN(1), newStatus: new BN(2)});
        });

        it("should emits => WorkflowStatusChange, from ProposalsRegistrationEnded to VotingSessionStarted", async () => {
            
            expectEvent(await VotingInstance.startVotingSession({ from: owner }), "WorkflowStatusChange", {previousStatus: new BN(2), newStatus: new BN(3)});
        });

        it("should emits => Voted", async () => {
            
            expectEvent(await VotingInstance.setVote(0, { from: owner }), "Voted", {voter: owner, proposalId: new BN(0)});
        });

        it("should emits => WorkflowStatusChange, from VotingSessionStarted to VotingSessionEnded", async () => {
            
            expectEvent(await VotingInstance.endVotingSession({ from: owner }), "WorkflowStatusChange", {previousStatus: new BN(3), newStatus: new BN(4)});
        });

        it("should emits => WorkflowStatusChange from VotingSessionEnded to VotesTallied", async () => {
            
            expectEvent(await VotingInstance.tallyVotes({ from: owner }), "WorkflowStatusChange", {previousStatus: new BN(4), newStatus: new BN(5)});
        });
    });

    ///////////////////////////////
    ///         REVERTS         ///
    ///////////////////////////////

    context("Reverts Tests", () => {

        before(async () => {
            VotingInstance = await Voting.new({from:owner});
        });

        it("should revert unspecified on getVoter() => inexistant voter in voters array", async () => {
            await expectRevert.unspecified(VotingInstance.getVoter(voter1, { from: owner }));
        });

        it("should revert unspecified on getOneProposal() => inexistant proposal in proposals array", async () => {
            await expectRevert.unspecified(VotingInstance.getOneProposal(10, { from: owner }));
        });
    });
});