import { isMetaMaskInstalled } from './wallet.js';

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

    connectButton.disabled = false;
}

init();