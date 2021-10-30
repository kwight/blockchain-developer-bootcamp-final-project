export const isMetaMaskInstalled = () => typeof ethereum !== 'undefined';

export const connectToMetaMask = async () => {
    await ethereum.request({ method: 'eth_requestAccounts' });
    return ethereum.selectedAddress;
}

export const getConnectedAccount = async () => {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return (accounts.length > 0) ? ethereum.selectedAddress : false;
}
