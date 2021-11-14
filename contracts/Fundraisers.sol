// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraisers is Ownable {
    mapping(address => bool) public charities;
    address[] public charityList;
    Event[] public events;
    mapping(uint256 => mapping(address => bool)) public eventParticipants;
    address[] public participants;

    enum EventStatus {
        Active,
        Complete,
        Cancelled
    }

    struct Event {
        string title;
        EventStatus status;
        address charity;
        uint256 timestamp;
    }

    event CharityRegistered(address charityAddress);
    event CharityRemoved(address charityAddress);
    event EventRegistered(uint256 eventId, address charityAddress);
    event EventCancelled(uint256 eventId, address charityAddress);
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
        require(charities[msg.sender] == true, "unauthorized");
        _;
    }

    function registerCharity(address charityAddress) public onlyOwner {
        require(charityList.length < 5, "maximum charities already registered");
        charities[charityAddress] = true;
        charityList.push(charityAddress);
        emit CharityRegistered(charityAddress);
    }

    function removeCharity(address charityAddress)
        public
        isOwnerOrCharity(charityAddress)
    {
        delete charities[charityAddress];
        for (uint256 index = 0; index < charityList.length; index++) {
            if (charityList[index] == charityAddress) {
                charityList[index] = charityList[charityList.length - 1];
                charityList.pop();
            }
        }
        emit CharityRemoved(charityAddress);
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
        require(events[index].charity == msg.sender, "unauthorized");
        events[index].status = EventStatus.Cancelled;
        emit EventCancelled(index, msg.sender);
    }

    function registerForEvent(uint256 id) public {
        eventParticipants[id][msg.sender] = true;
        participants.push(msg.sender);
        emit ParticipantRegistered(msg.sender, id);
    }

    function deregisterForEvent(uint256 id) public {
        eventParticipants[id][msg.sender] = false;
        emit ParticipantDeregistered(msg.sender, id);
    }

    function getParticipants() public view returns (address[] memory) {
        return participants;
    }
}
