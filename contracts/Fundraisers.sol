// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraisers is Ownable {
    mapping(address => bool) public charities;

    mapping(uint256 => Event) public events;

    uint256 eventsCount = 1;

    enum EventStatus {
        Active,
        Complete,
        Cancelled
    }

    struct Event {
        uint256 id;
        string title;
        EventStatus status;
        address charity;
    }

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
        charities[charityAddress] = true;
    }

    function removeCharity(address charityAddress)
        public
        isOwnerOrCharity(charityAddress)
    {
        delete charities[charityAddress];
    }

    function registerEvent(string memory title)
        public
        onlyCharity
        returns (uint256)
    {
        events[eventsCount] = Event({
            id: eventsCount,
            title: title,
            status: EventStatus.Active,
            charity: msg.sender
        });
        return events[eventsCount].id;
    }
}
