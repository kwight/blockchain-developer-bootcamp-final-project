import { contract, renderNotice } from './fundraisers.js';
import { renderCharities } from './charities.js';
import { renderPrograms } from './programs.js';
import { renderDonations } from './donations.js';

try {
    contract.on('CharityRegistered', renderCharities);
    contract.on('CharityRemoved', renderCharities);
    contract.on('ProgramRegistered', renderPrograms);
    contract.on('ProgramCancelled', renderPrograms);
    contract.on('DonationReceived', renderDonations);
    renderCharities();
    renderPrograms();
    renderDonations();
} catch (error) {
    renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
}
