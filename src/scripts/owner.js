import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled, isValidAddress } from './utils.js';
import { renderCharities } from './fundraisers.js';

const registerCharityForm = document.getElementById('register-charity');
const registerCharityButton = document.getElementById('register-charity-button');

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        const account = await getConnectedAccount();
        updateRegisterCharityButton(account);
        addAccountsChangedListener(updateRegisterCharityButton);
        window.fundraisers.provider.on('block', () => renderCharities(true));
        Object.assign(window.fundraisers, { registerCharity, removeCharity });
        renderCharities(true);
    } catch (error) {
        console.log(error);
    }
}

const updateRegisterCharityButton = (account) => {
    if (!account || account.length == 0) {
        registerCharityForm.removeEventListener('submit', registerCharityListener);
        registerCharityButton.disabled = true;
    } else {
        registerCharityForm.addEventListener('submit', registerCharityListener);
        registerCharityButton.disabled = false;
    }
}

const registerCharityListener = async (event) => {
    event.preventDefault();
    const address = new FormData(registerCharityForm).get('address');
    if (!isValidAddress(address)) {
        alert('Address is invalid.');
        return;
    }
    try {
        await registerCharity(address);
    } catch (error) {
        console.log(error);
    }

}

const registerCharity = async (address) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.registerCharity(address);
        renderCharities(true);
    } catch (error) {
        console.log(error);
    }
}

const removeCharity = async (address) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.removeCharity(address);
        renderCharities(true);
    } catch (error) {
        console.log(error);
    }
}

init();
