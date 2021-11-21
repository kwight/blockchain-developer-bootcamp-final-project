import { contract } from './fundraisers.js';
import { renderPrograms } from './programs.js';
import { addAccountsChangedListener, getConnectedAccount, getMetaMaskProvider, isMetaMaskInstalled } from './wallet.js';

const registerProgramForm = document.getElementById('register-program');
const registerProgramButton = document.getElementById('register-program-button');

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

const renderCharityPrograms = async () => {
    await renderPrograms();
    const account = await getConnectedAccount();
    const programs = document.querySelectorAll('.program');
    if (account) {
        programs.forEach(program => {
            const index = program.id.match(/(?<=program-).+/)[0];
            const status = program.querySelector('.program-status').innerText;
            const button = document.createElement('button');
            button.classList.add('cancel-program');
            button.innerText = 'Cancel';
            button.disabled = true;
            if ('active' == status) {
                button.disabled = false;
                button.addEventListener('click', () => cancelProgram(index));
            }
            program.appendChild(button);
        });
    }
}

init();
