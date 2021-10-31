import { addAccountsChangedListener, getConnectedAccount, isValidAddress } from './utils.js';

const registerCharityForm = document.getElementById('register-charity');
const registerCharityButton = document.getElementById('register-charity-button');

const init = async () => {
    try {
        const account = await getConnectedAccount();
        updateRegisterCharityButton(account);
        addAccountsChangedListener(updateRegisterCharityButton);
    } catch (error) {
        console.log(error);
    }
}

const updateRegisterCharityButton = (account) => {
    if (!account || account.length == 0) {
        registerCharityForm.removeEventListener('submit', registerCharity);
        registerCharityButton.disabled = true;
    } else {
        registerCharityForm.addEventListener('submit', registerCharity);
        registerCharityButton.disabled = false;
    }
}

const registerCharity = async (event) => {
    event.preventDefault();
    const address = new FormData(registerCharityForm).get('address');
    if (!isValidAddress(address)) {
        alert('Address is invalid.');
        return;
    }
    console.log(address);
}

init();
