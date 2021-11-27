import { ethers } from './ethers-5.1.esm.min.js';

// Update this to your migrated contract address if developing locally,
// or to your public contract address when deploying the front-end to production.
const contractAddress = '0x0000000000000000000000000000000000000000';

const abi = [
    'function owner() public view returns (address)',
    'function getCharities() public view returns (address[] memory)',
    'function getCharity(address charityAddress) public view returns (tuple(string name, uint256 index))',
    'function registerCharity(address charityAddress, string name) public',
    'function removeCharity(address charityAddress) public',
    'function getPrograms() view returns (tuple(string title, uint8 status, address charity, uint256 timestamp)[])',
    'function registerProgram(string memory title)',
    'function cancelProgram(uint256 index)',
    'function completeProgram(uint256 index)',
    'function donate(uint256 programId) public payable',
    'function getDonations() view returns (tuple(address doner, uint256 programId, uint256 amount)[])',
    'event CharityRegistered(address charityAddress)',
    'event CharityRemoved(address charityAddress)',
    'event ProgramRegistered(uint256 ProgramId, address charityAddress)',
    'event ProgramCancelled(uint256 programId, address charityAddress)',
    'event ProgramCompleted(uint256 programId, address charityAddress)',
    'event DonationReceived(uint256 amount, address charityAddress, uint256 programId, address doner)',
];

// Use this provider if developing locally (and verify the localhost port).
const provider = ethers.getDefaultProvider('http://localhost:9545');

// Use this provider to give your own keys for ethers.js.
// const provider = ethers.getDefaultProvider('ropsten', {
//     etherscan: ETHERSCAN_API_KEY,
//     infura: INFURA_PROJECT_ID
// });

export const contract = new ethers.Contract(contractAddress, abi, provider);

export const formatAddress = address => {
    if (!ethers.utils.isAddress(address)) {
        return false;
    }

    return `${address.slice(0, 4).toLowerCase()}...${address.slice(-4).toLowerCase()}`;
}

export const getAddressRole = async address => {
    if (!ethers.utils.isAddress(address)) {
        return false;
    }

    const donations = await contract.getDonations();
    const doners = donations.map(donation => donation.doner);
    if (doners.includes(address)) {
        return 'doner';
    }

    const charities = await contract.getCharities();
    if (charities.includes(address)) {
        return 'charity';
    }

    const ownerAddress = await contract.owner();
    if (ownerAddress === address) {
        return 'owner';
    }

    return 'none';
}

export const getAddressMarkup = async address => {
    const pill = document.createElement('span');
    const role = await getAddressRole(address);
    pill.classList.add('address', `role-${role}`);
    pill.innerText = formatAddress(address);
    return pill;
}
