import { ethers } from './ethers-5.1.esm.min.js';
import { getAddressMarkup, renderNotice } from './fundraisers.js';

const connectSection = document.getElementById('connect-section');
const connectButton = document.getElementById('connect').content;
const installMetaMask = document.getElementById('install-metamask').content;

const init = async () => {
    if (!isMetaMaskInstalled()) {
        renderInstallMetaMask();
        return;
    }

    try {
        renderAccountData();
        window.ethereum.on('accountsChanged', renderAccountData);
        window.ethereum.on('chainChanged', renderAccountData);
    } catch (error) {
        renderNotice('error', error.data.message);
    }
}

const renderAccountData = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        connectSection.replaceChildren(loading);
        const account = await getConnectedAccount();
        if (!account) {
            const element = connectButton.cloneNode(true);
            connectSection.replaceChildren(element);
            const button = document.querySelector('#connect-section button');
            button.addEventListener('click', connectToMetaMask);
        } else {
            const accountPill = await getAddressMarkup(account);
            connectSection.replaceChildren(accountPill);
        }
    } catch (error) {
        renderNotice('error', error.data.message);
    }
}

export const isMetaMaskInstalled = () => typeof window.ethereum !== 'undefined';

export const connectToMetaMask = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return window.ethereum.selectedAddress;
}

export const getConnectedAccount = async () => {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return (accounts.length > 0) ? window.ethereum.selectedAddress : false;
    } catch (error) {
        renderNotice('error', error.data.message);
    }
}

export const getNetworkName = () => {
    switch (window.ethereum.chainId) {
        case '0x1':
            return 'Mainnet';
        case '0x3':
            return 'Ropsten';
        case '0x4':
            return 'Rinkeby';
        case '0x5':
            return 'Görli';
        case '0x2a':
            return 'Kovan';
        default:
            return 'Localhost or custom';
    }
}

export const addAccountsChangedListener = (listener) => window.ethereum.on('accountsChanged', listener);

export const getMetaMaskProvider = () => new ethers.providers.Web3Provider(window.ethereum);

const renderInstallMetaMask = () => {
    connectSection.appendChild(installMetaMask.cloneNode(true));
}

init();
