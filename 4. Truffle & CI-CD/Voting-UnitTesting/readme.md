# Alyra Test Voting

## Unit Tests

* 79 valid tests
* 1 failed tests : 
    * Error in a setVote() require => require(voters[msg.sender].hasVoted != true, 'You have already voted'); 

file: Voting.test.js, spitted as follow.

### GETTER

In this part, you will find the unit tests related to the two getters of the contract.

 - getVoter() Method :
     1. should return is registered
     2. should return not registered

 - getOneProposal() method :
     1. should return a proposal
 
### METHODS

In this category, you will find the unit tests related to each methods of the contract.

- addVoter() method :
    1. should add voter in voter map

- addProposal() method :
    1. should add new proposal in proposal array

- startProposalsRegistering() method :
    1. should update the voting session to ProposalsRegistrationStarted step

- endProposalsRegistering() method : 
    1. should update the voting session to ProposalsRegistrationEnded step

- startVotingSession() method :
    1. should update the voting session to VotingSessionStarted step

- endVotingSession() method
    1. should update the voting session to VotingSessionEnded step

- setVote() method : 
    1. should set hasVoted on the voter
    2. should set votedProposalId on the voter
    3. should update voteCount on the proposal

- tallyVotes() method :
    1. should set second proposition as winner proposal
    2. should keep proposal with the lowest id if two proposals have the same vote count
    3. should set workflowStatus to VotesTallied

### REQUIRES

- getVoter() method :
    1. should revert => you're not a voter, on getOneProposal() method

- addVoter() method :
    1. should revert => because you're not the owner
    2. should revert => because you are already registered
    3. should revert => because voters registration is not open yet when the status is ProposalsRegistrationStarted
    4. should revert => because voters registration is not open yet when the status is ProposalsRegistrationEnded
    5. should revert => because voters registration is not open yet when the status is VotingSessionStarted
    6. should revert => because voters registration is not open yet when the status is VotingSessionEnded
    7. should revert => because voters registration is not open yet when the status is VotesTallied

- addProposal() method :
    1. should revert => you're not a voter
    2. should revert => Proposals are not allowed yet
    3. should revert => Vous ne pouvez pas ne rien proposer
    4. should revert => Proposals are not allowed yet on ProposalsRegistrationEnded
    5. should revert => Proposals are not allowed yet on VoteSessionStarted status
    6. should revert => Proposals are not allowed yet on VoteSessionEnded status
    7. should revert => Proposals are not allowed yet on VotingTallied status

- setVote() method :
    1. should revert => you're not a voter
    2. should revert => Voting session havent started yet on RegisteringVoters status
    3. should revert => Voting session havent started yet on ProposalsRegistrationStarted status
    4. should revert => Voting session havent started yet on ProposalsRegistrationEnded
    5. should revert => Proposal not found
    6. should revert => Proposal not found when id equal length
    7. should revert => You have already voted
    8. should revert => Voting session havent started yet on VotingSessionEnded status
    9. should revert => Voting session havent started yet on VotingTallied status

- startProposalsRegistering() method :
    1. should revert => you're not the owner
    2. should revert => Registering proposals cant be started now, on ProposalRegistrationStarted status
    3. should revert => Registering proposals cant be started now, on ProposalsRegistrationEnded status
    4. should revert => Registering proposals cant be started now, on VoteSessionStarted status
    5. should revert => Registering proposals cant be started now, on VoteSessionEnded status
    6. should revert => Registering proposals cant be started now, on VoteTallied status

- endProposalsRegistering() method :
    1. should revert => you're not the owner
    2. should revert => Registering proposals havent started yet, on RegisteringVoters status
    3. should revert => Registering proposals cant be started now, on ProposalsRegistrationEnded status
    4. should revert => Registering proposals cant be started now, on VoteSessionStarted status
    5. should revert => Registering proposals cant be started now, on VoteSessionEnded status
    6. should revert => Registering proposals cant be started now, on VoteTallied status

- startVotingSession() method :
    1. should revert => you're not the owner
    2. should revert => Registering proposals phase is not finished, on RegisteringVoters status
    3. should revert => Registering proposals phase is not finished, on ProposalRegisteringStarted status
    5. should revert => Registering proposals phase is not finished, on VoteSessionStarted status
    6. should revert => Registering proposals phase is not finished, on VoteSessionEnded status
    7. should revert => Registering proposals phase is not finished, on VoteTallied status

- endVotingSession() method :
    1. should revert => You're not the owner
    2. should revert => Voting session havent started yet, on RegisteringVoter status
    3. should revert => Voting session havent started yet, on ProposalRegisteringStarted status
    4. should revert => Voting session havent started yet, on ProposalRegisteringEnded status
    5. should revert => Voting session havent started yet, on VotingSessionEnded status
    6. should revert => Voting session havent started yet, on VoteTallied status

- tallyVotes() method : 
    1. should revert => You're not the owner
    2. should revert => Current status is not voting session ended, on RegisteringVoter status
    3. should revert => Current status is not voting session ended, on ProposalRegisteringStarted status
    4. should revert => Current status is not voting session ended, on ProposalRegisteringEnded status
    5. should revert => Current status is not voting session ended, on VoteSessionStarted status
    6. should revert => Current status is not voting session ended, on VoteTallied status


### EVENTS

1. should emits => VoterRegistered
2. should emits => WorkflowStatusChange, from RegisteringVoters to ProposalsRegistrationStarted
3. should emits => ProposalRegistered
4. should emits => WorkflowStatusChange, from ProposalsRegistrationStarted to ProposalsRegistrationEnded
5. should emits => WorkflowStatusChange, from ProposalsRegistrationEnded to VotingSessionStarted
6. should emits => Voted
7. should emits => WorkflowStatusChange, from VotingSessionStarted to VotingSessionEnded
8. should emits => WorkflowStatusChange from VotingSessionEnded to VotesTallied

### REVERTS

1. should revert unspecified on getVoter() => inexistant voter in voters array
2. should revert unspecified on getOneProposal() => inexistant proposal in proposals array