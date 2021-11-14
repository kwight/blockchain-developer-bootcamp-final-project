import { ethers } from './ethers-5.1.esm.min.js';

const connectButton = document.getElementById('connect-button');
const connectSection = document.getElementById('connect-section');
const selectedAccount = document.getElementById('selected-account').content;
const installMetaMask = document.getElementById('install-metamask').content;

const init = async () => {
    if (!isMetaMaskInstalled()) {
        renderInstallMetaMask();
        return;
    }

    try {
        const account = await getConnectedAccount();
        renderAccountData(account);
        window.ethereum.on('accountsChanged', renderAccountData);
    } catch (error) {
        console.log(error);
    }
}

const renderAccountData = (account) => {
    if (!account || account.length == 0) {
        connectButton.addEventListener('click', connectToMetaMask);
        const accountData = document.getElementById('current-account');
        if (accountData) {
            accountData.remove();
        }
        connectButton.disabled = false;
    } else {
        const existingAccount = document.querySelector('#connect-section #current-account');
        if (existingAccount) {
            existingAccount.remove();
        }
        connectSection.appendChild(selectedAccount.cloneNode(true));
        const accountAddress = document.getElementById('account-address');
        accountAddress.innerHTML = account;
        connectButton.disabled = true;
    }
}

export const isMetaMaskInstalled = () => typeof window.ethereum !== 'undefined';

export const connectToMetaMask = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return window.ethereum.selectedAddress;
}

export const getConnectedAccount = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return (accounts.length > 0) ? window.ethereum.selectedAddress : false;
}

export const addAccountsChangedListener = (listener) => window.ethereum.on('accountsChanged', listener);

const renderInstallMetaMask = () => {
    connectSection.appendChild(installMetaMask.cloneNode(true));
}

init();
