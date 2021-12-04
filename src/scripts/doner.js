import { ethers } from './ethers-5.1.esm.min.js';
import { contract, getAddressMarkup, renderNotice } from './fundraisers.js';
import { getPrograms } from './programs.js';
import { getDonations } from './donations.js';
import { addAccountsChangedListener, getConnectedAccount, getMetaMaskProvider, isMetaMaskInstalled, renderAccountData } from './wallet.js';

const spinner = document.getElementById('spinner');
const registeredDonations = document.getElementById('registered-donations');
const registeredDonation = document.getElementById('registered-donation');
const programRadioButton = document.getElementById('program-radio-button');
const registeredPrograms = document.getElementById('registered-programs');
const donationForm = document.getElementById('donation-form');
const donateButton = document.getElementById('donate-button');
const noPrograms = document.getElementById('no-programs').content;

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        addAccountsChangedListener(updateDonateButton);
        addAccountsChangedListener(renderDonerDonations);
        addAccountsChangedListener(renderDonerPrograms);
        contract.on('ProgramRegistered', renderDonerPrograms);
        contract.on('ProgramCancelled', renderDonerPrograms);
        contract.on('ProgramCompleted', renderDonerPrograms);
        renderDonerDonations();
        renderDonerPrograms();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

const updateDonateButton = async (account) => {
    if (!account || account.length == 0) {
        donationForm.removeEventListener('submit', donateListener);
        donationForm.reset();
        donateButton.disabled = true;
        return;
    }
    let programs = await getPrograms();
    programs = programs.filter(program => program.status === 0);
    if (!programs.length) {
        donationForm.removeEventListener('submit', donateListener);
        donationForm.reset();
        donateButton.disabled = true;
    } else {
        donationForm.addEventListener('submit', donateListener);
        donationForm.reset();
        donateButton.disabled = false;
    }
}

const donateListener = async (event) => {
    try {
        event.preventDefault();
        const program = new FormData(donationForm).get('program');
        const amount = new FormData(donationForm).get('amount');
        if (!program || !amount) {
            alert('Both an amount and a selected program are required.');
            return;
        }
        await donateToProgram(program, amount);
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

const donateToProgram = async (programId, amount) => {
    try {
        const donerAccount = await getConnectedAccount();
        const amountInWei = ethers.utils.parseEther(amount);
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        const tx = await writableContract.donate(programId, { from: donerAccount, value: amountInWei });
        renderNotice('info', 'Transaction submitted – waiting for two confirmations.');
        await tx.wait(2);
        renderNotice('success', 'Transaction confirmed. Thank you!');
        renderAccountData();
        renderDonerDonations();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
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
        registeredDonations.innerHTML = '<thead><tr><th>Amount</th><th>Program</th><th class="address-column">Donor</th></tr></thead><tbody></tbody>';
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
        donationForm.reset();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

const renderDonerPrograms = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        registeredPrograms.replaceChildren(loading);
        const account = await getConnectedAccount();
        const programs = await getPrograms();
        if (!programs.length) {
            const registerPrompt = noPrograms.cloneNode(true);
            registeredPrograms.replaceChildren(registerPrompt);
            updateDonateButton(account);
            return;
        }
        const filteredPrograms = programs.filter(program => program.status === 0);
        if (!filteredPrograms.length) {
            const registerPrompt = noPrograms.cloneNode(true);
            registeredPrograms.replaceChildren(registerPrompt);
            updateDonateButton(account);
            return;
        }
        registeredPrograms.innerHTML = '';
        for (const [index, programData] of programs.entries()) {
            if (programData.status !== 0) {
                continue;
            }
            const program = programRadioButton.content.cloneNode(true);
            const label = program.querySelector('label');
            const charity = await contract.getCharity(programData.charity);
            program.querySelector('input').id = `program-${index}`;
            program.querySelector('input').value = index;
            label.setAttribute('for', `program-${index}`);
            label.insertAdjacentHTML('beforeend', `${programData.title} (${charity.name})`);
            registeredPrograms.prepend(program);
        };
        donationForm.reset();
        updateDonateButton(account);
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

init();
