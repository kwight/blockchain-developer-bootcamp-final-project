import { connectAccount, getConnectedAccount, isMetaMaskInstalled } from './wallet.js';

window.fundraisers = {
    connectAccount,
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
    } catch (error) {
        console.log(error);
    }

    connectButton.addEventListener('click', connectToMetaMask);
}

const connectToMetaMask = async () => {
    try {
        renderConnectionPending();
        await connectAccount();

    } catch (error) {
        console.log(error);
    }
}

const renderAccountData = (account) => {
    if (!account || account.length == 0) {
        const accountData = document.getElementById('current-account');
        if (accountData) {
            accountData.remove();
        }
        connectButton.disabled = false;
    } else {
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

const renderConnectionPending = () => {
    const connectionPending = document.getElementById('connection-pending').content;
    connectSection.appendChild(connectionPending.cloneNode(true));
}

init();
