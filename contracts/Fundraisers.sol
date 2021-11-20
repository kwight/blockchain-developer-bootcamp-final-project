// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraisers is Ownable {
    mapping(address => Charity) private charityRegistry;
    address[] private charities;
    Program[] private programs;
    Donation[] private donations;

    enum ProgramStatus {
        Active,
        Complete,
        Cancelled
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

    event CharityRegistered(address charityAddress, string name);
    event CharityRemoved(address charityAddress);
    event ProgramRegistered(uint256 programId, address charityAddress);
    event ProgramCancelled(uint256 programId, address charityAddress);
    event ProgramCompleted(uint256 programId, address charityAddress);

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

    function isRegisteredCharity(address charityAddress)
        public
        view
        returns (bool)
    {
        if (charities.length == 0) return false;
        return (charities[charityRegistry[charityAddress].index] ==
            charityAddress);
    }

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

    function getCharities() public view returns (address[] memory) {
        return charities;
    }

    function getPrograms() public view returns (Program[] memory) {
        return programs;
    }

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

    function donate(uint256 programId, uint256 amount) public payable {
        require(programs.length > programId, "program does not exist");
        require(
            programs[programId].status == ProgramStatus.Active,
            "program is not active"
        );
        require(msg.value == amount, "amount must equal value sent");
        donations.push(
            Donation({doner: msg.sender, programId: programId, amount: amount})
        );
    }

    function getDonations() public view returns (Donation[] memory) {
        return donations;
    }
}
