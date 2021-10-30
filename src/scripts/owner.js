import { getConnectedAccount } from './wallet.js';

const registerCharityButton = document.getElementById('register-charity');

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
    registerCharityButton.disabled = (!account || account.length == 0) ? true : false;
}

init();
