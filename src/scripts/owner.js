import { ethers } from './ethers-5.1.esm.min.js';
import { renderCharities } from './charities.js';
import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled } from './wallet.js';

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
        window.fundraisers.provider.on('block', () => renderCharitiesWithButtons());
        Object.assign(window.fundraisers, { registerCharity, removeCharity });
    } catch (error) {
        console.log(error);
    }
}

const updateRegisterCharityButton = (account) => {
    if (!account || account.length == 0) {
        registerCharityForm.removeEventListener('submit', registerCharityListener);
        registerCharityButton.disabled = true;
        renderCharities();
    } else {
        registerCharityForm.addEventListener('submit', registerCharityListener);
        registerCharityButton.disabled = false;
        renderCharitiesWithButtons();
    }
}

const registerCharityListener = async (event) => {
    event.preventDefault();
    const address = new FormData(registerCharityForm).get('address');
    if (!ethers.utils.isAddress(address)) {
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
        renderCharitiesWithButtons();
    } catch (error) {
        console.log(error);
    }
}

const removeCharity = async (address) => {
    try {
        const { contract, signer } = window.fundraisers;
        const writableContract = contract.connect(signer);
        await writableContract.removeCharity(address);
        renderCharitiesWithButtons();
    } catch (error) {
        console.log(error);
    }
}

const renderCharitiesWithButtons = async () => {
    await renderCharities();
    const charities = document.querySelectorAll('.charity');
    charities.forEach(charity => {
        const address = charity.querySelector('.charity-address').innerText;
        const button = document.createElement('button');
        button.classList.add('remove-charity');
        button.innerText = 'X';
        button.addEventListener('click', () => removeCharity(address));
        charity.appendChild(button);
    });
}

init();
