import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled } from './utils.js';

const registerEventForm = document.getElementById('register-event');
const registerEventButton = document.getElementById('register-event-button');
const registeredEvents = document.getElementById('registered-events');
const registeredEvent = document.getElementById('registered-event').content;
const status = [
    'active',
    'complete',
    'cancelled',
]

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        const account = await getConnectedAccount();
        updateRegisterEventButton(account);
        addAccountsChangedListener(updateRegisterEventButton);
        window.fundraisers.provider.on('block', renderEvents);
        Object.assign(window.fundraisers, { registerEvent, cancelEvent });
        renderEvents();
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
        renderEvents();
    } catch (error) {
        console.log(error);
    }
}

const cancelEvent = async (index) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.cancelEvent(index);
        renderEvents();
    } catch (error) {
        console.log(error);
    }
}

const renderEvents = async () => {
    const events = await window.fundraisers.getEvents();
    registeredEvents.innerHTML = '';
    events.forEach((eventData, index) => {
        const event = registeredEvent.cloneNode(true);
        event.querySelector('.event').id = `event-${index}`;
        event.querySelector('.event-title').innerText = eventData.title;
        event.querySelector('.event-status').innerText = status[eventData.status];
        event.querySelector('.cancel-event').addEventListener('click', () => cancelEvent(index));
        registeredEvents.appendChild(event);
    });
}

init();
