import { addAccountsChangedListener, getConnectedAccount, isMetaMaskInstalled, isValidAddress } from './utils.js';
import { ethers } from './ethers-5.1.esm.min.js';

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
        Object.assign(window.fundraisers, { registerCharity });
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
        const result = await registerCharity(address);
        console.log(result);
    } catch (error) {
        console.log(error);
    }

}

const registerCharity = async (address) => {
    const { abi, contractAddress, signer } = window.fundraisers;
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract.registerCharity(address);
}

init();
