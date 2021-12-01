import { contract, renderNotice } from "./fundraisers.js";
import { getCharities } from './charities.js';

const spinner = document.getElementById('spinner');
const registeredPrograms = document.getElementById('registered-programs');
const registeredProgram = document.getElementById('registered-program');
export const status = [
    'active',
    'cancelled',
    'complete',
]

export const getPrograms = async () => {
    try {
        return await contract.getPrograms();
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}

export const renderPrograms = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        registeredPrograms.replaceChildren(loading);
        const programs = await getPrograms();
        let charityName;
        if (programs.length === 0) {
            registeredPrograms.innerText = 'No programs have been registered.';
            return;
        }
        const charities = await getCharities();
        registeredPrograms.innerHTML = '<thead><tr><th>Title</th><th>Charity</th><th>Status</th></tr></thead><tbody></tbody>';
        const tableBody = registeredPrograms.querySelector('tbody');
        for (let [index, programData] of programs.entries()) {
            const charityExists = charities.includes(programData.charity.toLowerCase());
            if (charityExists) {
                const charityData = await contract.getCharity(programData.charity);
                charityName = charityData.name;
            } else {
                charityName = '[charity was removed]';
                programData = {
                    ...programData, ...{ status: 1 }
                };
            }
            const program = registeredProgram.content.cloneNode(true);
            program.querySelector('.program').id = `program-${index}`;
            program.querySelector('.program-title').innerText = programData.title;
            program.querySelector('.program-charity').innerText = charityName;
            const programStatus = program.querySelector('.program-status');
            switch (programData.status) {
                case 2:
                    programStatus.classList.add('status-complete');
                    break;
                case 1:
                    programStatus.classList.add('status-cancelled');
                    break;
                default:
                    programStatus.classList.add('status-active');
                    break;
            }
            programStatus.innerText = status[programData.status];
            tableBody.appendChild(program);
        }
    } catch (error) {
        renderNotice('error', error?.data?.message || 'Oops - something\'s wrong.');
    }
}
