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
        renderAccountData();
        window.ethereum.on('accountsChanged', renderAccountData);
        window.ethereum.on('chainChanged', renderAccountData);
    } catch (error) {
        console.log(error);
    }
}

const renderAccountData = async () => {
    try {
        const account = await getConnectedAccount();
        const accountData = document.getElementById('current-account');
        const networkData = document.getElementById('current-network');
        if (accountData) {
            accountData.remove();
            networkData.remove();
        }
        if (!account || account.length == 0) {
            connectButton.addEventListener('click', connectToMetaMask);
            connectButton.disabled = false;
        } else {
            connectSection.appendChild(selectedAccount.cloneNode(true));
            const accountAddress = document.getElementById('account-address');
            const network = document.getElementById('network');
            accountAddress.innerHTML = account;
            network.innerText = getNetworkName();
            connectButton.disabled = true;
        }
    } catch (error) {
        console.log(error);
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
