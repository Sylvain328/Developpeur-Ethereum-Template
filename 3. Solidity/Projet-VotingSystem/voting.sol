// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    /**
    * Structs
    */

    // Voter struct
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    // Proposal struct
    struct Proposal {
        string description;
        uint voteCount;
    }

    /**
    * Enums
    */

    // Enum to describe the different state of the voting process
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /**
    * Events
    */
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);

    /**
    * State variables
    */

    // Status of the voting process
    WorkflowStatus public votingStatus;

    // Voters of the voting session
    mapping(address => Voter) whiteListVoters;

    // Store all the voterAddresses
    address[] public voterAddresses;

    // All proposals made by voters
    Proposal[] public proposals;

    // Winning proposals
    uint[] winningProposals;

    /**
    * Modifiers
    */

    /**
    * Action is possible only at a specific voting process step
    */
    modifier onlyIfProcessStepOpened(WorkflowStatus _workflowStatus) {
        require(votingStatus == _workflowStatus, "Voting process don't allow this action now");
        _;
    }

    /**
    * Action is possible only when the voting process is not ended
    */
    modifier onlyIfProcessIsNotEnded {
        // When the last step is reached, we can't up the voting process
        require(uint(votingStatus) < uint(WorkflowStatus.VotesTallied), "Voting process is ended");
        _;
    }

    /**
    * Action is possible only if the voter is not registered
    */
    modifier onlyUnregisteredVoter(address _address) {
        require(!whiteListVoters[_address].isRegistered, "Voter already registered");
        _;
    }

    /**
    * Action is possible only if the voter is registered
    */
    modifier onlyRegisteredVoter() {
        require(whiteListVoters[msg.sender].isRegistered, "Not allowed, you are not a Voter");
        _;
    }

    /**
    * Action is possible only if the proposal exists
    */
    modifier onlyIfProposalExists(uint _id) {
        require(_id <= proposals.length, "Proposal doesn't exists");
        _;
    }

    /**
    * Action is possible only if the address in parameter is from a voter who has voted
    */
    modifier onlyVoterWhoHasVoted(address _voterAddress) {
        require(whiteListVoters[msg.sender].hasVoted, "This voter didn't vote");
        _;
    }

    /**
    * Action is possible only if there is voters 
    */
    modifier onlyIfVotersNotEmpty() {
        require(voterAddresses.length > 0, "As there are not voters, this action is not possible");
        _;
    }

    /**
    * Action is possible only if there is proposal
    */
    modifier onlyIfProposalsNotEmpty() {
        require(proposals.length > 0, "As there are no proposals, this action is not possible");
        _;
    }

    /**
    * Action is possible only if at least one voter has voted
    */
    modifier onlyIfVotersVote() {
        
        bool didAnyoneVote = false;

        for(uint i = 0; i < proposals.length; i++) {
            if(proposals[i].voteCount >= 1){
                didAnyoneVote = true;
            }
        }
        
        require(didAnyoneVote, "No winner because no one voted");
        _;
    }

    /**
    * Functions
    */

    /**
    * Set the voting process to the next step
    */
    function upProcessStep() external onlyOwner onlyIfProcessIsNotEnded {

        uint oldStatus = uint(votingStatus);
        // Up the voting step process
        votingStatus = WorkflowStatus(oldStatus+1);

        // Run the process to determine winning proposal
        if(votingStatus == WorkflowStatus.VotesTallied) {
            processProposalVoteCount();
            determineWinningProposals();
        }

        emit WorkflowStatusChange(WorkflowStatus(oldStatus), votingStatus);
    }

    /**
    * Add a new voter in the whitelistVoters
    */
    function addVoter(address _address) external onlyOwner onlyIfProcessStepOpened(WorkflowStatus.RegisteringVoters) onlyUnregisteredVoter(_address) {

        // Create a new voter and store it to the mapping
        whiteListVoters[_address] = Voter(true, false, 0);
        // Store voter address in an array
        voterAddresses.push(_address);

        emit VoterRegistered(_address);
    }

    /**
    * Allow voter to add a new proposal
    */
    function addProposal(string memory _description) external onlyIfProcessStepOpened(WorkflowStatus.ProposalsRegistrationStarted) onlyRegisteredVoter {

        // Add new proposal in the array
        proposals.push(Proposal(_description, 0));

        emit ProposalRegistered(proposals.length-1);
    }

    /**
    * Allow voter to vote for a proposal
    */
    function vote(uint _proposalId) external onlyIfProcessStepOpened(WorkflowStatus.VotingSessionStarted) onlyRegisteredVoter onlyIfProposalsNotEmpty onlyIfProposalExists(_proposalId) {
        
        // Set the voter proposalId
        whiteListVoters[msg.sender].votedProposalId = _proposalId;
        // Voter has now voted
        whiteListVoters[msg.sender].hasVoted = true;

        emit Voted(msg.sender, _proposalId);
    }

    /**
    * Compute proposals vote count
    */
    function processProposalVoteCount() private  {

        uint voterLength = voterAddresses.length;

        // This loop will check the vote of all voters and calculate the number of votes of the proposal
        for (uint i = 0; i < voterLength; i++) {
            // Get address of the next voter
            address toCheckAddress = voterAddresses[i];

            // If voter has voted, we can count his vote
            if(whiteListVoters[toCheckAddress].hasVoted) {
                uint proposalId = whiteListVoters[toCheckAddress].votedProposalId;
                proposals[proposalId].voteCount++;
            }
        }
    }

    /**
    * Compute and determine the winning proposals of the vote
    */
    function determineWinningProposals() private {

        uint proposalLength = proposals.length;
        uint highestVoteCount;

        // This loop will get the proposal with the highest number of votes
        for (uint i = 0; i < proposalLength; i++) {
            
            uint currentProposalVoteCount = proposals[i].voteCount;

            // If the current proposal has more votes, we have a new winner
            // If it's equal, we have two winner
            if(currentProposalVoteCount >= highestVoteCount) {
                
                // If it's a new winner, the old winners have to be removed
                if(currentProposalVoteCount > highestVoteCount) {
                    highestVoteCount = currentProposalVoteCount;
                    delete winningProposals;
                }
                
                // Push a new winning proposals
                winningProposals.push(i);
            }
        }
    }

    /**
    * Get the winning proposals
    */
    function getWinner() external view onlyIfProcessStepOpened(WorkflowStatus.VotesTallied) onlyIfVotersNotEmpty onlyIfProposalsNotEmpty onlyIfVotersVote returns (uint _numberOfWinner, uint[] memory _proposalWinnerIds) {
        return (winningProposals.length, winningProposals);
    }

    /**
    * Get the proposal a voter voted for - only available from VotingSessionEnded step
    */
    function getVoteFromVoter(address _voterAddress) external onlyIfProcessStepOpened(WorkflowStatus.VotingSessionEnded) onlyVoterWhoHasVoted(_voterAddress) view returns (uint) {
        return whiteListVoters[msg.sender].votedProposalId;
    }

    /**
    * Reset all the voting process and voters
    */
    function resetVote() external onlyOwner  {

        // Reset WinningProposalId
        delete winningProposals;   
        
        // Reset Voters
        resetVoters();

        // Reset Proposals
        delete proposals;

        // Reset Step of the process
        votingStatus = WorkflowStatus.RegisteringVoters;
    }

    /**
    * Reset the voters 
    */
    function resetVoters() private {

        uint voterLength = voterAddresses.length;

        // Loop to reset all the voters in the array of voters
        for (uint i = 0; i < voterLength; i++) {

            address toCheckAddress = voterAddresses[i];
            whiteListVoters[toCheckAddress].isRegistered = false;
            whiteListVoters[toCheckAddress].hasVoted = false;
            whiteListVoters[toCheckAddress].votedProposalId = 0;
        }

        // Reset array of Voters addresses
        delete voterAddresses;
    }
}