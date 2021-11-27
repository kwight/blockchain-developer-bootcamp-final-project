import { contract } from "./fundraisers.js";

const spinner = document.getElementById('spinner');
const registeredPrograms = document.getElementById('registered-programs');
const registeredProgram = document.getElementById('registered-program');
const status = [
    'active',
    'cancelled',
    'complete',
]

export const getPrograms = async () => {
    return await contract.getPrograms();
}

export const renderPrograms = async () => {
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
        program.querySelector('.program-status').innerText = status[programData.status];
        tableBody.appendChild(program);
    }
}
