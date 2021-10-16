// SPDX-License-Identifier: MIT
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraisers is Ownable {
    mapping(address => bool) public charities;

    modifier isOwnerOrCharity(address charityAddress) {
        require(
            msg.sender == owner() || msg.sender == charityAddress,
            "unauthorized"
        );
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
}
