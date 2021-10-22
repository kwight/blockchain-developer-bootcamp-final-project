export const isMetaMaskInstalled = () => typeof ethereum !== 'undefined';

export const isMetaMaskConnected = () => !!ethereum.selectedAddress;

export const connectToMetaMask = async () => {
    await ethereum.request({ method: 'eth_requestAccounts' });
    return ethereum.selectedAddress;
}
