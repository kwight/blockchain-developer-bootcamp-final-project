// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraisers is Ownable {
    mapping(address => bool) public charities;
    address[] public charityList;
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
        require(charityList.length < 5, "maximum charities already registered");
        charities[charityAddress] = true;
        charityList.push(charityAddress);
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
