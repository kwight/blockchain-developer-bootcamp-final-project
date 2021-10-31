import { ethers } from './ethers-5.1.esm.min.js';

const { ethereum } = window;
const contractAddress = '0x5b00D792A7A6ceFc7cFB6ee39DE6d4FD916B2402';
const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "charities",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "events",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            },
            {
                "internalType": "enum Fundraisers.EventStatus",
                "name": "status",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "charity",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "charityAddress",
                "type": "address"
            }
        ],
        "name": "registerCharity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "charityAddress",
                "type": "address"
            }
        ],
        "name": "removeCharity",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "title",
                "type": "string"
            }
        ],
        "name": "registerEvent",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
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
