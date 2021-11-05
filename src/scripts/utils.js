import { ethers } from './ethers-5.1.esm.min.js';

const { ethereum } = window;
const contractAddress = '0x17ea93d5357b1e371561740883AB6A56993C2b22';
const abi = [
    "function getCharities() public view returns (address[] memory)"
];

export const isMetaMaskInstalled = () => typeof ethereum !== 'undefined';

export const connectToMetaMask = async () => {
    await ethereum.request({ method: 'eth_requestAccounts' });
    return ethereum.selectedAddress;
}

export const getConnectedAccount = async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return (accounts.length > 0) ? ethereum.selectedAddress : false;
}

export const isValidAddress = (address) => ethers.utils.isAddress(address);

export const addAccountsChangedListener = (listener) => ethereum.on('accountsChanged', listener);

export const registerCharity = async (address) => {
    const writableContract = new ethers.Contract(contractAddress, abi, signer);
    return await writableContract.registerCharity(address);
}

export const getCharities = async () => {
    const provider = ethers.getDefaultProvider('http://localhost:9545');
    const fundraisers = new ethers.Contract(contractAddress, abi, provider);
    return await fundraisers.getCharities();
}
