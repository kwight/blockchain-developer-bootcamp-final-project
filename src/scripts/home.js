import { contract } from './fundraisers.js';
import { renderCharities } from './charities.js';
import { renderPrograms } from './programs.js';

contract.on('CharityRegistered', renderCharities);
contract.on('CharityRemoved', renderCharities);
contract.on('ProgramRegistered', renderPrograms);
contract.on('ProgramCancelled', renderPrograms);
renderCharities();
renderPrograms();
