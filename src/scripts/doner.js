import { contract } from './fundraisers.js';
import { getPrograms } from './programs.js';
import { addAccountsChangedListener, isMetaMaskInstalled } from './wallet.js';

const programRadioButton = document.getElementById('program-radio-button');
const registeredPrograms = document.getElementById('registered-programs');

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

const renderDonerPrograms = async () => {
    const programs = await getPrograms();
    registeredPrograms.innerHTML = '';
    programs.forEach((programData, index) => {
        const program = programRadioButton.content.cloneNode(true);
        const label = program.querySelector('label');
        program.querySelector('input').id = `program-${index}`;
        label.setAttribute('for', `program-${index}`);
        label.insertAdjacentText('beforeend', programData.title);
        registeredPrograms.prepend(program);
    });
}

init();
