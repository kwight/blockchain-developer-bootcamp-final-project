// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Fundraiser donations
/// @author kwight
/// @notice This contract allows register charities to receive donations for campaigns.
contract Fundraisers is Ownable {
    mapping(address => Charity) private charityRegistry;
    address[] private charities;
    Program[] private programs;
    Donation[] private donations;

    enum ProgramStatus {
        Active,
        Cancelled,
        Complete
    }

    struct Charity {
        string name;
        uint256 index;
    }

    struct Program {
        string title;
        ProgramStatus status;
        address charity;
    }

    struct Donation {
        address doner;
        uint256 programId;
        uint256 amount;
    }

    /// @notice Emit an event when a charity is registered.
    /// @param charityAddress Address of the registered charity.
    /// @param name Name of the charity.
    event CharityRegistered(address charityAddress, string name);

    /// @notice Emit an event when a charity is removed by the owner.
    /// @param charityAddress Address of the removed charity.
    event CharityRemoved(address charityAddress);

    /// @notice Emit an event when a charity registers a program.
    /// @param programId Index in the programs array.
    /// @param charityAddress Address of the charity doing the registering.
    event ProgramRegistered(uint256 programId, address charityAddress);

    /// @notice Emit an event when a charity cancels a program.
    /// @param programId Index in the programs array.
    /// @param charityAddress Address of the charity doing the cancelling.
    event ProgramCancelled(uint256 programId, address charityAddress);

    /// @notice Emit an event when a charity marks a program as completed.
    /// @param programId Index in the programs array.
    /// @param charityAddress Address of the charity marking the completion.
    event ProgramCompleted(uint256 programId, address charityAddress);

    /// @notice Emit an event when a donation is received.
    /// @param amount Amount of the donation (in wei).
    /// @param charityAddress Address of the charity receiving the funds.
    /// @param programId Index in the programs array.
    /// @param doner Address of the doner.
    event DonationReceived(
        uint256 amount,
        address charityAddress,
        uint256 programId,
        address doner
    );

    modifier isOwnerOrCharity(address charityAddress) {
        require(
            msg.sender == owner() || msg.sender == charityAddress,
            "unauthorized"
        );
        _;
    }

    modifier onlyCharity() {
        require(isRegisteredCharity(msg.sender) == true, "unauthorized");
        _;
    }

    /// @notice Verify a given address is a registered charity.
    /// @param charityAddress Address being verified.
    /// @return True if registered, false otherwise.
    function isRegisteredCharity(address charityAddress)
        public
        view
        returns (bool)
    {
        if (charities.length == 0) return false;
        return (charities[charityRegistry[charityAddress].index] ==
            charityAddress);
    }

    /// @notice Register a charity.
    /// @param charityAddress Address of the charity to be registered.
    /// @param name Name of the charity.
    function registerCharity(address charityAddress, string memory name)
        public
        onlyOwner
    {
        require(
            isRegisteredCharity(charityAddress) == false,
            "charity already exists"
        );
        charities.push(charityAddress);
        charityRegistry[charityAddress].name = name;
        charityRegistry[charityAddress].index = charities.length - 1;
        emit CharityRegistered(charityAddress, name);
    }

    /// @notice Remove a charity.
    /// @param charityAddress Address of the charity to be removed.
    function removeCharity(address charityAddress)
        public
        isOwnerOrCharity(charityAddress)
    {
        require(
            isRegisteredCharity(charityAddress) == true,
            "charity does not exist"
        );
        uint256 toRemove = charityRegistry[charityAddress].index;
        address toMove = charities[charities.length - 1];
        charityRegistry[toMove].index = toRemove;
        charities[toRemove] = toMove;
        charities.pop();
        emit CharityRemoved(charityAddress);
    }

    /// @notice Get stored data for the given charity.
    /// @param charityAddress Address of the charity requested.
    /// @return Charity struct instance.
    function getCharity(address charityAddress)
        public
        view
        returns (Charity memory)
    {
        require(
            isRegisteredCharity(charityAddress) == true,
            "charity does not exist"
        );
        return charityRegistry[charityAddress];
    }

    /// @notice Get data for all registered charities.
    /// @return Array of Charity struct instances.
    function getCharities() public view returns (address[] memory) {
        return charities;
    }

    /// @notice Get data for all registered programs.
    /// @return Array of Program struct instances.
    function getPrograms() public view returns (Program[] memory) {
        return programs;
    }

    /// @notice Register a program.
    /// @param title The name of the program.
    function registerProgram(string memory title) public onlyCharity {
        programs.push(
            Program({
                title: title,
                status: ProgramStatus.Active,
                charity: msg.sender
            })
        );
        emit ProgramRegistered(programs.length - 1, msg.sender);
    }

    /// @notice Cancel an active program.
    /// @param programId Index of the program to be cancelled.
    function cancelProgram(uint256 programId) public onlyCharity {
        require(programs.length > programId, "program does not exist");
        require(programs[programId].charity == msg.sender, "unauthorized");
        require(
            programs[programId].status == ProgramStatus.Active,
            "program is not active"
        );
        programs[programId].status = ProgramStatus.Cancelled;
        emit ProgramCancelled(programId, msg.sender);
    }

    /// @notice Mark an active program as complete.
    /// @param programId Index of the program to be marked complete.
    function completeProgram(uint256 programId) public onlyCharity {
        require(programs.length > programId, "program does not exist");
        require(programs[programId].charity == msg.sender, "unauthorized");
        require(
            programs[programId].status == ProgramStatus.Active,
            "program is not active"
        );
        programs[programId].status = ProgramStatus.Complete;
        emit ProgramCompleted(programId, msg.sender);
    }

    /// @notice Donate ether to a charity's program.
    /// @param programId Index of the program "receiving" the donation.
    function donate(uint256 programId) public payable {
        require(programs.length > programId, "program does not exist");
        require(
            programs[programId].status == ProgramStatus.Active,
            "program is not active"
        );
        Program memory receivingProgram = programs[programId];
        donations.push(
            Donation({
                doner: msg.sender,
                programId: programId,
                amount: msg.value
            })
        );
        (bool sent, ) = receivingProgram.charity.call{value: msg.value}("");
        require(sent, "ether not sent to charity");
        emit DonationReceived(
            msg.value,
            receivingProgram.charity,
            programId,
            msg.sender
        );
    }

    /// @notice Get data for all donations.
    /// @return Array of Donation struct instances.
    function getDonations() public view returns (Donation[] memory) {
        return donations;
    }
}
