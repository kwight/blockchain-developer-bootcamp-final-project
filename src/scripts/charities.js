import { contract } from "./fundraisers.js";

const spinner = document.getElementById('spinner');
const registeredCharities = document.getElementById('registered-charities');
const registeredCharity = document.getElementById('registered-charity');

export const getCharities = async () => {
    return await contract.getCharities();
}

export const renderCharities = async () => {
    const loading = spinner.content.cloneNode(true);
    registeredCharities.replaceChildren(loading);
    const charities = await getCharities();
    registeredCharities.innerHTML = '<thead><tr><th>Name</th><th>Address</th></tr></thead><tbody></tbody>';
    const tableBody = registeredCharities.querySelector('tbody');
    for (const address of charities) {
        const charityData = await contract.getCharity(address);
        const charity = registeredCharity.content.cloneNode(true);
        charity.querySelector('.charity').id = `charity-${address}`;
        charity.querySelector('.charity-name').innerText = charityData.name;
        charity.querySelector('.charity-address').innerText = address;
        tableBody.appendChild(charity);
    }
}
