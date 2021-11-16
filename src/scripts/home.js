import { contract } from './fundraisers.js';
import { renderCharities } from './charities.js';
import { renderEvents } from './events.js';
import { renderParticipants } from './participants.js';

contract.on('CharityRegistered', renderCharities);
contract.on('CharityRemoved', renderCharities);
contract.on('EventRegistered', renderEvents);
contract.on('EventCancelled', renderEvents);
renderCharities();
renderEvents();
renderParticipants();
