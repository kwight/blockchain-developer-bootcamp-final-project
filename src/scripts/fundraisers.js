import { ethers } from './ethers-5.1.esm.min.js';

const contractAddress = '0x8C26141B255E2eefA6087737ACBC7141f00484bd';
const abi = [
    'function getCharities() public view returns (address[] memory)',
    'function registerCharity(address charityAddress, string name) public',
    'function removeCharity(address charityAddress) public',
    'function getPrograms() view returns (tuple(string title, uint8 status, address charity, uint256 timestamp)[])',
    'function registerProgram(string memory title)',
    'function cancelProgram(uint256 index)',
    'function completeProgram(uint256 index)',
    'function donate(uint256 programId) public payable',
    'event CharityRegistered(address charityAddress)',
    'event CharityRemoved(address charityAddress)',
    'event ProgramRegistered(uint256 ProgramId, address charityAddress)',
    'event ProgramCancelled(uint256 programId, address charityAddress)',
    'event ProgramCompleted(uint256 programId, address charityAddress)',
];
const provider = ethers.getDefaultProvider();
export const contract = new ethers.Contract(contractAddress, abi, provider);
