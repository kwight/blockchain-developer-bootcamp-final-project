import { renderEvents } from './events.js';
import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled } from './wallet.js';

const registeredEvents = document.getElementById('registered-events');

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        addAccountsChangedListener(renderParticipantEvents);
        Object.assign(window.fundraisers, { isParticipatingInEvent, registerForEvent, deregisterForEvent });
        renderParticipantEvents();
    } catch (error) {
        console.log(error);
    }
}

const isParticipatingInEvent = async (account, id) => {
    try {
        return await window.fundraisers.contract.eventParticipants(id, account);
    } catch (error) {
        console.log(error);
    }
}

const registerForEvent = async (id) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.registerForEvent(id);
        renderParticipantEvents();
    } catch (error) {
        console.log(error);
    }
}

const deregisterForEvent = async (id) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
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
        events.forEach(event => {
            const index = event.id.match(/(?<=event-).+/)[0];
            const status = event.querySelector('.event-status').innerText;
            const button = document.createElement('button');
            button.classList.add('register-for-event');
            button.innerText = 'Register';
            button.disabled = true;
            if ('active' == status) {
                button.disabled = false;
                button.addEventListener('click', () => registerForEvent(index));
            }
            event.appendChild(button);
        });
    }
}

init();
