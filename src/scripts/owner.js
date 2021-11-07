import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled, isValidAddress } from './utils.js';

const registerCharityForm = document.getElementById('register-charity');
const registerCharityButton = document.getElementById('register-charity-button');
const registeredCharities = document.getElementById('registered-charities');
const registeredCharity = document.getElementById('registered-charity').content;

const init = async () => {
    if (!isMetaMaskInstalled()) {
        return;
    }

    try {
        const account = await getConnectedAccount();
        updateRegisterCharityButton(account);
        addAccountsChangedListener(updateRegisterCharityButton);
        window.fundraisers.provider.on('block', renderCharities);
        Object.assign(window.fundraisers, { registerCharity, removeCharity });
        renderCharities();
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
        renderCharities();
    } catch (error) {
        console.log(error);
    }
}

const removeCharity = async (address) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.removeCharity(address);
        renderCharities();
    } catch (error) {
        console.log(error);
    }
}

const renderCharities = async () => {
    const charities = await window.fundraisers.getCharities();
    registeredCharities.innerHTML = '';
    charities.forEach(address => {
        const charity = registeredCharity.cloneNode(true);
        charity.querySelector('.charity-address').innerText = address;
        charity.querySelector('.remove-charity').addEventListener('click', () => removeCharity(address));
        registeredCharities.appendChild(charity);
    });
}

init();
