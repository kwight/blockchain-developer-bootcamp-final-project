import { contract } from './fundraisers.js';
import { renderPrograms } from './programs.js';
import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled } from './wallet.js';

const init = () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        addAccountsChangedListener(renderDonerPrograms);
        contract.on('ProgramRegistered', renderDonerPrograms);
        contract.on('ProgramCancelled', renderDonerPrograms);
        contract.on('ProgramCompleted', renderDonerPrograms);
        renderDonerPrograms();
    } catch (error) {
        console.log(error);
    }
}

const renderDonerPrograms = async () => {
    await renderPrograms();
    const account = await getConnectedAccount();
    const programs = document.querySelectorAll('.program');
    if (account) {
        programs.forEach(program => {
            const index = program.id.match(/(?<=program-).+/)[0];
            const status = program.querySelector('.program-status').innerText;
            const button = document.createElement('button');
            button.classList.add('donate');
            button.innerText = 'Donate';
            button.disabled = true;
            if ('active' == status) {
                button.disabled = false;
                button.addEventListener('click', () => donateToProgram(index));
            }
            program.appendChild(button);
        });
    }
}

init();
