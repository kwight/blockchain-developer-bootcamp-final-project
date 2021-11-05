import { ethers } from './ethers-5.1.esm.min.js';

const contractAddress = '0x17ea93d5357b1e371561740883AB6A56993C2b22';
const abi = [
    "function getCharities() public view returns (address[] memory)",
    "function registerCharity(address charityAddress) public",
];
const provider = ethers.getDefaultProvider('http://localhost:9545');

const init = async () => {
    window.fundraisers = {
        abi,
        contractAddress,
        ethers,
        getCharities,
        provider,
    };
}

export const getCharities = async () => {
    const fundraisers = new ethers.Contract(contractAddress, abi, provider);
    return await fundraisers.getCharities();
}

init();
