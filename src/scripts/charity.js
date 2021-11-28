import { contract } from './fundraisers.js';
import { getPrograms, status } from './programs.js';
import { addAccountsChangedListener, getConnectedAccount, getMetaMaskProvider, isMetaMaskInstalled } from './wallet.js';

const registeredPrograms = document.getElementById('registered-programs');
const registeredProgram = document.getElementById('registered-program');
const registerProgramForm = document.getElementById('register-program');
const registerProgramButton = document.getElementById('register-program-button');
const noConnection = document.getElementById('no-connection').content;
const noPrograms = document.getElementById('no-programs').content;

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        const account = await getConnectedAccount();
        updateRegisterProgramButton(account);
        addAccountsChangedListener(updateRegisterProgramButton);
        addAccountsChangedListener(renderCharityPrograms);
        contract.on('ProgramRegistered', renderCharityPrograms);
        contract.on('ProgramCancelled', renderCharityPrograms);
        renderCharityPrograms();
    } catch (error) {
        console.log(error);
    }
}

const updateRegisterProgramButton = (account) => {
    if (!account || account.length == 0) {
        registerProgramForm.removeEventListener('submit', registerProgramListener);
        registerProgramButton.disabled = true;
    } else {
        registerProgramForm.addEventListener('submit', registerProgramListener);
        registerProgramButton.disabled = false;
    }
}

const registerProgramListener = async (program) => {
    program.preventDefault();
    const title = new FormData(registerProgramForm).get('title');
    if (!title) {
        alert('The program title is required.');
        return;
    }
    try {
        await registerProgram(title);
    } catch (error) {
        console.log(error);
    }
}

const registerProgram = async (title) => {
    try {
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        await writableContract.registerProgram(title);
        renderCharityPrograms();
    } catch (error) {
        console.log(error);
    }
}

const cancelProgram = async (index) => {
    try {
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        await writableContract.cancelProgram(index);
        renderCharityPrograms();
    } catch (error) {
        console.log(error);
    }
}

const completeProgram = async (index) => {
    try {
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        await writableContract.completeProgram(index);
        renderCharityPrograms();
    } catch (error) {
        console.log(error);
    }
}

const renderCharityPrograms = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        registeredPrograms.replaceChildren(loading);
        const account = await getConnectedAccount();
        if (!account) {
            const connectWallet = noConnection.cloneNode(true);
            registeredPrograms.replaceChildren(connectWallet);
            return;
        }
        const programs = await getPrograms();
        if (!programs.length) {
            const registerPrompt = noPrograms.cloneNode(true);
            registeredPrograms.replaceChildren(registerPrompt);
            return;
        }
        registeredPrograms.innerHTML = '<thead><tr><th>Title</th><th>Status</th></tr></thead><tbody></tbody>';
        const tableBody = registeredPrograms.querySelector('tbody');
        for (const [index, programData] of programs.entries()) {
            if (programData.charity.toLowerCase() !== account.toLowerCase()) {
                continue;
            }
            const program = registeredProgram.content.cloneNode(true);
            program.querySelector('.program').id = `program-${index}`;
            program.querySelector('.program-title').innerText = programData.title;
            const programStatus = program.querySelector('.program-status');
            const actionsCell = program.querySelector('.program-actions');
            switch (programData.status) {
                case 2:
                    programStatus.classList.add('status-complete');
                    break;
                case 1:
                    programStatus.classList.add('status-cancelled');
                    break;
                default:
                    programStatus.classList.add('status-active');
                    break;
            }
            programStatus.innerText = status[programData.status];
            const cancelButton = document.createElement('button');
            const completeButton = document.createElement('button');
            cancelButton.classList.add('cancel-program', 'compact');
            cancelButton.innerText = 'X';
            cancelButton.disabled = true;
            completeButton.classList.add('complete-program', 'compact');
            completeButton.innerText = '✓';
            completeButton.disabled = true;
            if ('active' == status[programData.status]) {
                cancelButton.disabled = false;
                completeButton.disabled = false;
                cancelButton.addEventListener('click', () => cancelProgram(index));
                completeButton.addEventListener('click', () => completeProgram(index));
            }
            actionsCell.replaceChildren(cancelButton, completeButton);
            tableBody.appendChild(program);
        }
    } catch (error) {
        console.log(error);
    }
}

init();
