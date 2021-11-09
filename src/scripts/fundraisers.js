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

const registeredCharities = document.getElementById('registered-charities');
const registeredCharity = document.getElementById('registered-charity').content;

const init = () => {
    window.fundraisers = {
        contract,
        ethers,
        getCharities,
        getEvents,
        provider,
    };
    renderCharities();
}

export const getCharities = async () => {
    const { contract } = window.fundraisers;
    return await contract.getCharities();
}

export const getEvents = async () => {
    const { contract } = window.fundraisers;
    return await contract.getEvents();
}

export const renderCharities = async (isOwner = false) => {
    const charities = await window.fundraisers.getCharities();
    registeredCharities.innerHTML = '';
    charities.forEach(address => {
        const charity = registeredCharity.cloneNode(true);
        charity.querySelector('.charity').id = `charity-${address}`;
        charity.querySelector('.charity-address').innerText = address;
        if (isOwner) {
            const button = document.createElement('button');
            button.classList.add('remove-charity');
            button.innerText = 'X';
            button.addEventListener('click', () => removeCharity(address));
            charity.querySelector('.charity').appendChild(button);
        }
        registeredCharities.appendChild(charity);
    });
}

init();
