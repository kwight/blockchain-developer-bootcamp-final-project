import { getParticipants } from './participants.js';
import { isMetaMaskInstalled } from './wallet.js';

const participantRadioButton = document.getElementById('participant-radio-button');
const donationForm = document.getElementById('donation-form');

const init = () => {
    renderParticipantRadioButtons();
    if (!isMetaMaskInstalled()) {
        return;
    }
    try {

    } catch (error) {

    }
}

const renderParticipantRadioButtons = async () => {
    const participants = await getParticipants();
    participants.forEach((address, index) => {
        const participant = participantRadioButton.content.cloneNode(true);
        const label = participant.querySelector('label');
        participant.querySelector('input').id = `participant-${index}`;
        label.setAttribute('for', `participant-${index}`);
        label.innerText = address;
        donationForm.prepend(participant);
    });
}

init();
