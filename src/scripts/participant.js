import { contract } from './fundraisers.js';
import { renderEvents } from './events.js';
import { addAccountsChangedListener, getConnectedAccount, getMetaMaskProvider, isMetaMaskInstalled } from './wallet.js';

const registeredEvents = document.getElementById('registered-events');

const init = async () => {
    renderEvents();
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        addAccountsChangedListener(renderParticipantEvents);
        renderParticipantEvents();
    } catch (error) {
        console.log(error);
    }
}

const isParticipatingInEvent = async (account, id) => {
    try {
        return await contract.eventParticipants(id, account);
    } catch (error) {
        console.log(error);
    }
}

const registerForEvent = async (id) => {
    try {
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        await writableContract.registerForEvent(id);
        renderParticipantEvents();
    } catch (error) {
        console.log(error);
    }
}

const deregisterForEvent = async (id) => {
    try {
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        await writableContract.deregisterForEvent(id);
        renderParticipantEvents();
    } catch (error) {
        console.log(error);
    }
}

const renderParticipantEvents = async () => {
    await renderEvents();
    const account = await getConnectedAccount();
    const events = registeredEvents.querySelectorAll('.event');
    if (account) {
        events.forEach(async (event) => {
            const status = event.querySelector('.event-status').innerText;
            if ('active' !== status) {
                return;
            }
            const id = event.id.match(/(?<=event-).+/)[0];
            const button = document.createElement('button');
            const isParticipating = await isParticipatingInEvent(account, id);
            if (isParticipating) {
                button.classList.add('deregister-for-event');
                button.innerText = 'Deregister';
                button.addEventListener('click', () => deregisterForEvent(id));
            } else {
                button.classList.add('register-for-event');
                button.innerText = 'Register';
                button.addEventListener('click', () => registerForEvent(id));
            }
            event.appendChild(button);
        });
    }
}

init();
