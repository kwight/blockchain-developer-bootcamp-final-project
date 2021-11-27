import { ethers } from "./ethers-5.1.esm.min.js";
import { contract } from "./fundraisers.js";
import { getPrograms } from "./programs.js";

const spinner = document.getElementById('spinner');
const registeredDonations = document.getElementById('registered-donations');
const registeredDonation = document.getElementById('registered-donation');

export const getDonations = async () => {
    try {
        return await contract.getDonations();
    } catch (error) {
        console.log(error);
    }
}

export const renderDonations = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        registeredDonations.replaceChildren(loading);
        const donations = await getDonations();
        const programs = await getPrograms();
        registeredDonations.innerHTML = '<thead><tr><th>Amount</th><th>Program</th><th>Doner</th></tr></thead><tbody></tbody>';
        const tableBody = registeredDonations.querySelector('tbody');
        donations.forEach((donationData, index) => {
            const donation = registeredDonation.content.cloneNode(true);
            const amountInEther = ethers.utils.formatEther(donationData.amount);
            donation.querySelector('.donation').id = `donation-${index}`;
            donation.querySelector('.donation-amount').innerText = parseFloat(amountInEther).toFixed(8);
            donation.querySelector('.program-title').innerText = programs[donationData.programId].title;
            donation.querySelector('.doner').innerText = donationData.doner;
            tableBody.appendChild(donation);
        });
    } catch (error) {
        console.log(error);
    }
}
