import { contract, getAddressMarkup, renderNotice } from "./fundraisers.js";

const spinner = document.getElementById('spinner');
const registeredCharities = document.getElementById('registered-charities');
const registeredCharity = document.getElementById('registered-charity');

export const getCharities = async () => {
    try {
        const charities = await contract.getCharities();
        return charities.map(charity => charity.toLowerCase());
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

export const renderCharities = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        registeredCharities.replaceChildren(loading);
        const charities = await getCharities();
        if (charities.length === 0) {
            registeredCharities.innerText = 'No charities are registered.';
            return;
        }
        registeredCharities.innerHTML = '<thead><tr><th>Name</th><th class="address-column">Address</th></tr></thead><tbody></tbody>';
        const tableBody = registeredCharities.querySelector('tbody');
        for (const address of charities) {
            const charityData = await contract.getCharity(address);
            const addressMarkup = await getAddressMarkup(address);
            const charity = registeredCharity.content.cloneNode(true);
            charity.querySelector('.charity').id = `charity-${address}`;
            charity.querySelector('.charity-name').innerText = charityData.name;
            charity.querySelector('.charity-address').replaceChildren(addressMarkup);
            tableBody.appendChild(charity);
        }
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}
