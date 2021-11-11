import { contract } from "./fundraisers.js";

const registeredCharities = document.getElementById('registered-charities');
const registeredCharity = document.getElementById('registered-charity');

export const getCharities = async () => {
    return await contract.getCharities();
}

export const renderCharities = async () => {
    const charities = await getCharities();
    registeredCharities.innerHTML = '';
    charities.forEach(address => {
        const charity = registeredCharity.content.cloneNode(true);
        charity.querySelector('.charity').id = `charity-${address}`;
        charity.querySelector('.charity-address').innerText = address;
        registeredCharities.appendChild(charity);
    });
}

Object.assign(window.fundraisers, { getCharities });
