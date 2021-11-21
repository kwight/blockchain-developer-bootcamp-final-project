import { contract } from './fundraisers.js';
import { getPrograms } from './programs.js';
import { addAccountsChangedListener, getConnectedAccount, getMetaMaskProvider, isMetaMaskInstalled } from './wallet.js';

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
        addAccountsChangedListener(renderDonerPrograms);
        contract.on('ProgramRegistered', renderDonerPrograms);
        contract.on('ProgramCancelled', renderDonerPrograms);
        contract.on('ProgramCompleted', renderDonerPrograms);
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
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        await writableContract.donate(programId, { value: amount });
        renderDonerPrograms();
    } catch (error) {
        console.log(error);
    }
}

const renderDonerPrograms = async () => {
    const programs = await getPrograms();
    registeredPrograms.innerHTML = '';
    programs.forEach((programData, index) => {
        const program = programRadioButton.content.cloneNode(true);
        const label = program.querySelector('label');
        program.querySelector('input').id = `program-${index}`;
        program.querySelector('input').value = index;
        label.setAttribute('for', `program-${index}`);
        label.insertAdjacentText('beforeend', programData.title);
        registeredPrograms.prepend(program);
    });
}

init();
