import { contract, renderNotice } from "./fundraisers.js";

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
        renderNotice('error', error.data.message);
    }
}

export const renderPrograms = async () => {
    try {
        const loading = spinner.content.cloneNode(true);
        registeredPrograms.replaceChildren(loading);
        const programs = await getPrograms();
        registeredPrograms.innerHTML = '<thead><tr><th>Title</th><th>Charity</th><th>Status</th></tr></thead><tbody></tbody>';
        const tableBody = registeredPrograms.querySelector('tbody');
        for (const [index, programData] of programs.entries()) {
            const charityData = await contract.getCharity(programData.charity);
            const program = registeredProgram.content.cloneNode(true);
            program.querySelector('.program').id = `program-${index}`;
            program.querySelector('.program-title').innerText = programData.title;
            program.querySelector('.program-charity').innerText = charityData.name;
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
        renderNotice('error', error.data.message);
    }
}
