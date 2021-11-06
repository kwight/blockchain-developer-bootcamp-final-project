import { ethers } from './ethers-5.1.esm.min.js';

const contractAddress = '0xb4896ea2F21DFbE58fe0439E3d2a16F8561b15D7';
const abi = [
    'function getCharities() public view returns (address[] memory)',
    'function registerCharity(address charityAddress) public',
    'function removeCharity(address charityAddress) public',
];
const provider = ethers.getDefaultProvider('http://localhost:9545');
const contract = new ethers.Contract(contractAddress, abi, provider);

const init = async () => {
    window.fundraisers = {
        contract,
        ethers,
        getCharities,
        provider,
    };
}

export const getCharities = async () => {
    const { contract } = window.fundraisers;
    return await contract.getCharities();
}

init();
