import { renderEvents } from './events.js';
import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled } from './wallet.js';

const registerEventForm = document.getElementById('register-event');
const registerEventButton = document.getElementById('register-event-button');

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        const account = await getConnectedAccount();
        updateRegisterEventButton(account);
        addAccountsChangedListener(updateRegisterEventButton);
        addAccountsChangedListener(renderCharityEvents);
        window.fundraisers.provider.on('block', renderCharityEvents);
        Object.assign(window.fundraisers, { registerEvent, cancelEvent });
    } catch (error) {
        console.log(error);
    }
}

const updateRegisterEventButton = (account) => {
    if (!account || account.length == 0) {
        registerEventForm.removeEventListener('submit', registerEventListener);
        registerEventButton.disabled = true;
    } else {
        registerEventForm.addEventListener('submit', registerEventListener);
        registerEventButton.disabled = false;
    }
}

const registerEventListener = async (event) => {
    event.preventDefault();
    const title = new FormData(registerEventForm).get('title');
    const date = new FormData(registerEventForm).get('date');
    if (!title || !date) {
        alert('Both fields are required.');
        return;
    }
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    try {
        await registerEvent(title, timestamp);
    } catch (error) {
        console.log(error);
    }
}

const registerEvent = async (title, date) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.registerEvent(title, date);
        renderCharityEvents();
    } catch (error) {
        console.log(error);
    }
}

const cancelEvent = async (index) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.cancelEvent(index);
        renderCharityEvents();
    } catch (error) {
        console.log(error);
    }
}

const renderCharityEvents = async () => {
    await renderEvents();
    const account = await getConnectedAccount();
    const events = document.querySelectorAll('.event');
    if (account) {
        events.forEach(event => {
            const index = event.id.match(/(?<=event-).+/)[0];
            const status = event.querySelector('.event-status').innerText;
            const button = document.createElement('button');
            button.classList.add('cancel-event');
            button.innerText = 'Cancel';
            button.disabled = true;
            if ('active' == status) {
                button.disabled = false;
                button.addEventListener('click', () => cancelEvent(index));
            }
            event.appendChild(button);
        });
    }
}

init();
