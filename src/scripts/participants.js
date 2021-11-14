import { contract } from "./fundraisers.js";

const participantsSection = document.getElementById('participants');
const participantTemplate = document.getElementById('participant-template');

export const getParticipants = async () => {
    return await contract.getParticipants();
}

export const renderParticipants = async () => {
    const participants = await getParticipants();
    participantsSection.innerHTML = '';
    participants.forEach((address, index) => {
        const participant = participantTemplate.content.cloneNode(true);
        participant.querySelector('.participant').id = `participant-${index}`;
        participant.querySelector('.participant-address').innerText = address;
        participantsSection.appendChild(participant);
    });
}