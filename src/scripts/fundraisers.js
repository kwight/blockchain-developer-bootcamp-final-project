import { ethers } from './ethers-5.1.esm.min.js';

const contractAddress = '0x5b00D792A7A6ceFc7cFB6ee39DE6d4FD916B2402';
const abi = [
    'function getCharities() public view returns (address[] memory)',
    'function registerCharity(address charityAddress, string name) public',
    'function removeCharity(address charityAddress) public',
    'function getPrograms() view returns (tuple(string title, uint8 status, address charity, uint256 timestamp)[])',
    'function registerProgram(string memory title)',
    'function cancelProgram(uint256 index)',
    'function completeProgram(uint256 index)',
    'function donate(uint256 programId, uint256 amount) public payable',
    'event CharityRegistered(address charityAddress)',
    'event CharityRemoved(address charityAddress)',
    'event ProgramRegistered(uint256 ProgramId, address charityAddress)',
    'event ProgramCancelled(uint256 programId, address charityAddress)',
    'event ProgramCompleted(uint256 programId, address charityAddress)',
];
const provider = ethers.getDefaultProvider('http://localhost:9545');
export const contract = new ethers.Contract(contractAddress, abi, provider);
