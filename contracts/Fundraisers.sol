// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraisers is Ownable {
    mapping(address => Charity) private charities;
    address[] private charityList;
    Event[] private events;
    mapping(uint256 => mapping(address => bool)) private eventParticipants;
    Donation[] private donations;

    enum EventStatus {
        Active,
        Complete,
        Cancelled
    }

    struct Charity {
        string name;
        uint256 index;
    }

    struct Event {
        string title;
        EventStatus status;
        address charity;
        uint256 timestamp;
    }

    struct Donation {
        address doner;
        address participant;
        uint256 eventId;
        uint256 amount;
    }

    event CharityRegistered(address charityAddress, string name);
    event CharityRemoved(address charityAddress);
    event EventRegistered(uint256 eventId, address charityAddress);
    event EventCancelled(uint256 eventId, address charityAddress);
    event EventCompleted(uint256 eventId, address charityAddress);
    event ParticipantRegistered(address participantAddress, uint256 eventId);
    event ParticipantDeregistered(address participantAddress, uint256 eventId);

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
        if (charityList.length == 0) return false;
        return (charityList[charities[charityAddress].index] == charityAddress);
    }

    function registerCharity(address charityAddress, string memory name)
        public
        onlyOwner
    {
        require(
            isRegisteredCharity(charityAddress) == false,
            "charity already exists"
        );
        charityList.push(charityAddress);
        charities[charityAddress].name = name;
        charities[charityAddress].index = charityList.length - 1;
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
        uint256 toRemove = charities[charityAddress].index;
        address toMove = charityList[charityList.length - 1];
        charities[toMove].index = toRemove;
        charityList[toRemove] = toMove;
        charityList.pop();
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
        return charities[charityAddress];
    }

    function getCharities() public view returns (address[] memory) {
        return charityList;
    }

    function getEvents() public view returns (Event[] memory) {
        return events;
    }

    function registerEvent(string memory title, uint256 timestamp)
        public
        onlyCharity
    {
        require(
            block.timestamp + 43200 < timestamp,
            "event is scheduled too soon"
        );
        events.push(
            Event({
                title: title,
                status: EventStatus.Active,
                charity: msg.sender,
                timestamp: timestamp
            })
        );
        emit EventRegistered(events.length - 1, msg.sender);
    }

    function cancelEvent(uint256 index) public onlyCharity {
        require(events.length > index, "event does not exist");
        require(events[index].charity == msg.sender, "unauthorized");
        require(
            events[index].status == EventStatus.Active,
            "event is not active"
        );
        events[index].status = EventStatus.Cancelled;
        emit EventCancelled(index, msg.sender);
    }

    function completeEvent(uint256 index) public onlyCharity {
        require(events.length > index, "event does not exist");
        require(events[index].charity == msg.sender, "unauthorized");
        require(
            events[index].status == EventStatus.Active,
            "event is not active"
        );
        events[index].status = EventStatus.Complete;
        emit EventCompleted(index, msg.sender);
    }

    function registerForEvent(uint256 id) public {
        require(events.length > id, "event does not exist");
        require(
            eventParticipants[id][msg.sender] == false,
            "already registered for event"
        );
        eventParticipants[id][msg.sender] = true;
        emit ParticipantRegistered(msg.sender, id);
    }

    function deregisterForEvent(uint256 id) public {
        require(events.length > id, "event does not exist");
        require(
            eventParticipants[id][msg.sender] == true,
            "not registered for event"
        );
        eventParticipants[id][msg.sender] = false;
        emit ParticipantDeregistered(msg.sender, id);
    }

    function isParticipatingInEvent(address participant, uint256 id)
        public
        view
        returns (bool)
    {
        return eventParticipants[id][participant];
    }

    function donate(
        uint256 eventId,
        address participant,
        uint256 amount
    ) public payable {
        require(events.length > eventId, "event does not exist");
        require(
            events[eventId].status == EventStatus.Active,
            "event is not active"
        );
        require(
            isParticipatingInEvent(participant, eventId),
            "participant is not registered in this event"
        );
        require(msg.value == amount, "amount must equal value sent");
        donations.push(
            Donation({
                doner: msg.sender,
                participant: participant,
                eventId: eventId,
                amount: amount
            })
        );
    }

    function getDonations() public view returns (Donation[] memory) {
        return donations;
    }
}
