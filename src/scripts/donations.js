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
        registeredDonations.innerHTML = '';
        donations.forEach((donationData, index) => {
            const donation = registeredDonation.content.cloneNode(true);
            donation.querySelector('.donation').id = `donation-${index}`;
            donation.querySelector('.donation-amount').innerText = ethers.utils.formatEther(donationData.amount);
            donation.querySelector('.program-title').innerText = programs[donationData.programId].title;
            donation.querySelector('.doner').innerText = donationData.doner;
            registeredDonations.appendChild(donation);
        });
    } catch (error) {
        console.log(error);
    }
}
