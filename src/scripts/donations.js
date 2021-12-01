import { ethers } from "./ethers-5.1.esm.min.js";
import { contract, getAddressMarkup, renderNotice } from "./fundraisers.js";
import { getPrograms } from "./programs.js";

const spinner = document.getElementById('spinner');
const registeredDonations = document.getElementById('registered-donations');
const registeredDonation = document.getElementById('registered-donation');

export const getDonations = async () => {
    try {
        return await contract.getDonations();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

export const renderDonations = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        registeredDonations.replaceChildren(loading);
        const donations = await getDonations();
        if (donations.length === 0) {
            registeredDonations.innerText = 'No donations have been made.';
            return;
        }
        const programs = await getPrograms();
        registeredDonations.innerHTML = '<thead><tr><th>Amount</th><th>Program</th><th class="address-column">Donor</th></tr></thead><tbody></tbody>';
        const tableBody = registeredDonations.querySelector('tbody');
        donations.forEach(async (donationData, index) => {
            const donation = registeredDonation.content.cloneNode(true);
            const addressMarkup = await getAddressMarkup(donationData.doner);
            const amountInEther = ethers.utils.formatEther(donationData.amount);
            donation.querySelector('.donation').id = `donation-${index}`;
            donation.querySelector('.donation-amount').innerText = parseFloat(amountInEther).toFixed(4);
            donation.querySelector('.program-title').innerText = programs[donationData.programId].title;
            donation.querySelector('.doner').replaceChildren(addressMarkup);
            tableBody.appendChild(donation);
        });
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}
