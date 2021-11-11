import { contract } from "./fundraisers.js";

const registeredEvents = document.getElementById('registered-events');
const registeredEvent = document.getElementById('registered-event');
const status = [
    'active',
    'complete',
    'cancelled',
]

export const getEvents = async () => {
    return await contract.getEvents();
}

export const renderEvents = async () => {
    const events = await getEvents();
    registeredEvents.innerHTML = '';
    events.forEach((eventData, index) => {
        const event = registeredEvent.content.cloneNode(true);
        event.querySelector('.event').id = `event-${index}`;
        event.querySelector('.event-title').innerText = eventData.title;
        event.querySelector('.event-status').innerText = status[eventData.status];
        registeredEvents.appendChild(event);
    });
}

Object.assign(window.fundraisers, { getEvents });
