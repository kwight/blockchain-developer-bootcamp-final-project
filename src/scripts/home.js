import { provider } from './fundraisers.js';
import { renderCharities } from './charities.js';

provider.on('block', renderCharities);
renderCharities();