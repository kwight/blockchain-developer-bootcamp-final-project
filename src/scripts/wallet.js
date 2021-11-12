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
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        renderAccountData(account);
        window.ethereum.on('accountsChanged', renderAccountData);
        Object.assign(window.fundraisers, {
            connectToMetaMask,
            getConnectedAccount,
            isMetaMaskInstalled,
            provider,
            signer,
        });
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

export const isMetaMaskInstalled = () => typeof ethereum !== 'undefined';

export const connectToMetaMask = async () => {
    await ethereum.request({ method: 'eth_requestAccounts' });
    return ethereum.selectedAddress;
}

export const getConnectedAccount = async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return (accounts.length > 0) ? ethereum.selectedAddress : false;
}

export const addAccountsChangedListener = (listener) => ethereum.on('accountsChanged', listener);

const renderInstallMetaMask = () => {
    connectSection.appendChild(installMetaMask.cloneNode(true));
}

init();
