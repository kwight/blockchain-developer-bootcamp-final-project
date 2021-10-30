import { getConnectedAccount } from './wallet.js';

const registerCharityForm = document.getElementById('register-charity');
const registerCharityButton = document.getElementById('register-charity-button');

const init = async () => {
    try {
        const account = await getConnectedAccount();
        updateRegisterCharityButton(account);
        ethereum.on('accountsChanged', updateRegisterCharityButton);
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

const registerCharity = (event) => {
    event.preventDefault();
    const data = new FormData(registerCharityForm);
    console.log(data.get('address'));
}

init();
