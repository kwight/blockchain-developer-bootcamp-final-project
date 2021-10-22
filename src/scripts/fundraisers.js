import { connectToMetaMask, isMetaMaskConnected, isMetaMaskInstalled } from './wallet.js';

window.fundraisers = {
    isMetaMaskInstalled,
    isMetaMaskConnected,
    connectToMetaMask,
};

const connectButton = document.getElementById('connect-button');
const connectSection = document.getElementById('connect-section');

const init = () => {
    renderConnectButton();
}

const renderConnectButton = () => {
    if (!isMetaMaskInstalled()) {
        const installMetaMask = document.getElementById('install-metamask');
        connectSection.appendChild(installMetaMask.content.cloneNode(true));
        return;
    }

    if (!isMetaMaskConnected()) {
        connectButton.disabled = false;
        connectButton.addEventListener('click', async () => {
            const selectedAddress = await connectToMetaMask();
            const selectedAccount = document.getElementById('selected-account').content;
            connectSection.appendChild(selectedAccount.cloneNode(true));
            const accountAddress = document.getElementById('account-address');
            accountAddress.innerHTML = selectedAddress;
            connectButton.disabled = true;
        });
        return;
    }
}

init();
