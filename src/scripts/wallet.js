import { connectToMetaMask, getConnectedAccount, isMetaMaskInstalled } from './utils.js';
import { ethers } from './ethers-5.1.esm.min.js';

const walletEntities = {
    connectToMetaMask,
    getConnectedAccount,
    isMetaMaskInstalled,
};

const connectButton = document.getElementById('connect-button');
const connectSection = document.getElementById('connect-section');

const init = async () => {
    if (!isMetaMaskInstalled()) {
        renderInstallMetaMask();
        return;
    }

    try {
        const account = await getConnectedAccount();
        renderAccountData(account);
        ethereum.on('accountsChanged', renderAccountData);
        walletEntities.provider = new ethers.providers.Web3Provider(ethereum);
        walletEntities.signer = walletEntities.provider.getSigner();
        Object.assign(window.fundraisers, walletEntities);
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
        const selectedAccount = document.getElementById('selected-account').content;
        connectSection.appendChild(selectedAccount.cloneNode(true));
        const accountAddress = document.getElementById('account-address');
        accountAddress.innerHTML = account;
        connectButton.disabled = true;
    }
}

const renderInstallMetaMask = () => {
    const installMetaMask = document.getElementById('install-metamask').content;
    connectSection.appendChild(installMetaMask.cloneNode(true));
}

init();