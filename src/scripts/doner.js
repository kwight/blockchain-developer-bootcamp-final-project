import { ethers } from './ethers-5.1.esm.min.js';
import { contract, getAddressMarkup } from './fundraisers.js';
import { getPrograms } from './programs.js';
import { getDonations } from './donations.js';
import { addAccountsChangedListener, getConnectedAccount, getMetaMaskProvider, isMetaMaskInstalled } from './wallet.js';

const spinner = document.getElementById('spinner');
const registeredDonations = document.getElementById('registered-donations');
const registeredDonation = document.getElementById('registered-donation');
const programRadioButton = document.getElementById('program-radio-button');
const registeredPrograms = document.getElementById('registered-programs');
const donationForm = document.getElementById('donation-form');
const donateButton = document.getElementById('donate-button');

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        const account = await getConnectedAccount();
        updateDonateButton(account);
        addAccountsChangedListener(updateDonateButton);
        addAccountsChangedListener(renderDonerDonations);
        addAccountsChangedListener(renderDonerPrograms);
        contract.on('ProgramRegistered', renderDonerPrograms);
        contract.on('ProgramCancelled', renderDonerPrograms);
        contract.on('ProgramCompleted', renderDonerPrograms);
        renderDonerDonations();
        renderDonerPrograms();
    } catch (error) {
        console.log(error);
    }
}

const updateDonateButton = (account) => {
    if (!account || account.length == 0) {
        donationForm.removeEventListener('submit', donateListener);
        donateButton.disabled = true;
    } else {
        donationForm.addEventListener('submit', donateListener);
        donateButton.disabled = false;
    }
}

const donateListener = async (event) => {
    event.preventDefault();
    const program = new FormData(donationForm).get('program');
    const amount = new FormData(donationForm).get('amount');
    if (!program || !amount) {
        alert('Both an amount and a selected program are required.');
        return;
    }
    try {
        await donateToProgram(program, amount);
    } catch (error) {
        console.log(error);
    }
}

const donateToProgram = async (programId, amount) => {
    try {
        const donerAccount = await getConnectedAccount();
        const amountInWei = ethers.utils.parseEther(amount);
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        const tx = await writableContract.donate(programId, { from: donerAccount, value: amountInWei });
        const programs = await getPrograms();
        const donation = registeredDonation.content.cloneNode(true);
        donation.querySelector('.donation-amount').innerText = amount;
        donation.querySelector('.program-title').innerText = programs[programId].title;
        donation.querySelector('.doner').innerText = donerAccount;
        donation.querySelector('.confirmed').innerText = 'pending';
        registeredDonations.appendChild(donation);
        await tx.wait(2);
        renderDonerDonations();
    } catch (error) {
        console.log(error);
    }
}

export const renderDonerDonations = async () => {
    try {
        const donerAccount = await getConnectedAccount();
        if (!donerAccount) {
            registeredDonations.innerText = 'Connect your wallet to see your donations.';
            return;
        }
        const loading = spinner.content.cloneNode(true);
        registeredDonations.replaceChildren(loading);
        let donations = await getDonations();
        donations = donations.filter(donation => donation.doner.toLowerCase() === donerAccount.toLowerCase());
        if (!donations.length) {
            registeredDonations.innerText = 'No donations found for this account.';
            return;
        }
        const programs = await getPrograms();
        registeredDonations.innerHTML = '<thead><tr><th>Amount</th><th>Program</th><th class="address-column">Doner</th></tr></thead><tbody></tbody>';
        donations.forEach(async (donationData, index) => {
            const donation = registeredDonation.content.cloneNode(true);
            const addressMarkup = await getAddressMarkup(donationData.doner);
            const amountInEther = ethers.utils.formatEther(donationData.amount);
            donation.querySelector('.donation').id = `donation-${index}`;
            donation.querySelector('.donation-amount').innerText = parseFloat(amountInEther).toFixed(4);
            donation.querySelector('.program-title').innerText = programs[donationData.programId].title;
            donation.querySelector('.doner').replaceChildren(addressMarkup);
            registeredDonations.appendChild(donation);
        });
    } catch (error) {
        console.log(error);
    }
}

const renderDonerPrograms = async () => {
    const loading = spinner.content.cloneNode(true);
    registeredPrograms.replaceChildren(loading);
    const programs = await getPrograms();
    registeredPrograms.innerHTML = '';
    programs.forEach((programData, index) => {
        if (programData.status == 0) {
            const program = programRadioButton.content.cloneNode(true);
            const label = program.querySelector('label');
            program.querySelector('input').id = `program-${index}`;
            program.querySelector('input').value = index;
            label.setAttribute('for', `program-${index}`);
            label.insertAdjacentText('beforeend', programData.title);
            registeredPrograms.prepend(program);
        }
    });
}

init();
