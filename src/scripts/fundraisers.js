import { connectToMetaMask, isMetaMaskInstalled } from './wallet.js';

window.fundraisers = {
    isMetaMaskInstalled,
    connectToMetaMask,
};

const connectButton = document.getElementById('connect-button');
const connectSection = document.getElementById('connect-section');

const init = () => {
    renderConnectButton();
}

const renderConnectButton = () => {
    if (!isMetaMaskInstalled()) {
        const installMetaMask = document.getElementById('install-metamask').content;
        connectSection.appendChild(installMetaMask.cloneNode(true));
        return;
    }

    connectButton.addEventListener('click', async () => {
        const selectedAddress = await connectToMetaMask();
        const selectedAccount = document.getElementById('selected-account').content;
        connectSection.appendChild(selectedAccount.cloneNode(true));
        const accountAddress = document.getElementById('account-address');
        accountAddress.innerHTML = selectedAddress;
        connectButton.disabled = true;
        registerCharityButton.disabled = false;
    });
    return;
}

init();
