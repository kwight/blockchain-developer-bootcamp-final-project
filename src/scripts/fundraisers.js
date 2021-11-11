import { ethers } from './ethers-5.1.esm.min.js';

const contractAddress = '0xb4896ea2F21DFbE58fe0439E3d2a16F8561b15D7';
const abi = [
    'function getCharities() public view returns (address[] memory)',
    'function registerCharity(address charityAddress) public',
    'function removeCharity(address charityAddress) public',
    'function getEvents() view returns (tuple(string title, uint8 status, address charity, uint256 timestamp)[])',
    'function registerEvent(string memory title, uint256 timestamp)',
    'function cancelEvent(uint256 index)',
];
const provider = ethers.getDefaultProvider('http://localhost:9545');
const contract = new ethers.Contract(contractAddress, abi, provider);

const init = () => {
    window.fundraisers = {
        contract,
        ethers,
        provider,
    };
}

init();
