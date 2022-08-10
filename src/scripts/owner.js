import { ethers } from './ethers-5.1.esm.min.js';
import { contract, renderNotice } from './fundraisers.js';
import { renderCharities } from './charities.js';
import { addAccountsChangedListener, getConnectedAccount, getMetaMaskProvider, isMetaMaskInstalled } from './wallet.js';

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
        addAccountsChangedListener(renderOwnerCharities);
        contract.on('CharityRegistered', renderOwnerCharities);
        contract.on('CharityRemoved', renderOwnerCharities);
        renderOwnerCharities();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

const updateRegisterCharityButton = async (account) => {
    account = (typeof account == 'object') ? account[0] : account;
    const owner = await contract.owner();
    if (!ethers.utils.isAddress(account) || account.toLowerCase() !== owner.toLowerCase()) {
        registerCharityForm.removeEventListener('submit', registerCharityListener);
        registerCharityButton.disabled = true;
        registerCharityForm.reset();
    } else {
        registerCharityForm.addEventListener('submit', registerCharityListener);
        registerCharityButton.disabled = false;
        registerCharityForm.reset();
    }
}

const registerCharityListener = async (event) => {
    event.preventDefault();
    const address = new FormData(registerCharityForm).get('address');
    const name = new FormData(registerCharityForm).get('name');
    if (!ethers.utils.isAddress(address)) {
        alert('Address is invalid.');
        return;
    }
    try {
        await registerCharity(address, name);
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }

}

const registerCharity = async (address, name) => {
    try {
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        const tx = await writableContract.registerCharity(address, name);
        renderNotice('info', 'Charity submitted – waiting for confirmation.');
        await tx.wait();
        renderNotice('success', 'Charity successfully submitted.');
        renderOwnerCharities();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

const removeCharity = async (address) => {
    try {
        const writableContract = contract.connect(getMetaMaskProvider().getSigner());
        const tx = await writableContract.removeCharity(address);
        renderNotice('info', 'Removal submitted – waiting for confirmation.');
        await tx.wait();
        renderNotice('success', 'Charity successfully removed.');
        renderOwnerCharities();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

const renderOwnerCharities = async () => {
    try {
        await renderCharities();
        const owner = await contract.owner();
        const account = await getConnectedAccount();
        if (!account) {
            renderNotice('info', 'Connect as the owner to manage charities.');
            return;
        }
        const charities = document.querySelectorAll('.charity');
        if (owner.toLowerCase() === account.toLowerCase()) {
            charities.forEach(charity => {
                const address = charity.id.replace('charity-', '');
                const removeCell = charity.querySelector('.charity-remove');
                const button = document.createElement('button');
                button.classList.add('compact', 'remove-charity');
                button.innerText = 'X';
                button.addEventListener('click', () => removeCharity(address));
                removeCell.innerHTML = '';
                removeCell.appendChild(button);
            });
        }
        registerCharityForm.reset();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

init();
