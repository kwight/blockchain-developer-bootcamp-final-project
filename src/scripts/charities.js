const registeredCharities = document.getElementById('registered-charities');
const registeredCharity = document.getElementById('registered-charity');

const init = () => {
    window.fundraisers.provider.on('block', renderCharities);
    Object.assign(window.fundraisers, { getCharities });
    renderCharities();
}

export const getCharities = async () => {
    const { contract } = window.fundraisers;
    return await contract.getCharities();
}

export const renderCharities = async () => {
    const charities = await window.fundraisers.getCharities();
    registeredCharities.innerHTML = '';
    charities.forEach(address => {
        const charity = registeredCharity.content.cloneNode(true);
        charity.querySelector('.charity').id = `charity-${address}`;
        charity.querySelector('.charity-address').innerText = address;
        registeredCharities.appendChild(charity);
    });
}

init();
