import { provider } from './fundraisers.js';
import { renderCharities } from './charities.js';
import { renderEvents } from './events.js';

provider.on('block', () => {
    renderCharities();
    renderEvents();
});
renderCharities();
renderEvents();
