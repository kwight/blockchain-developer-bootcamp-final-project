// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraisers is Ownable {
    mapping(address => bool) public charities;
    address[] public charityList;
    Event[] public events;

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

    event CharityRegistered(address charity);

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
    }

    function cancelEvent(uint256 index) public onlyCharity {
        require(events[index].charity == msg.sender, "unauthorized");
        events[index].status = EventStatus.Cancelled;
    }
}
