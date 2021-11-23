import { contract } from "./fundraisers.js";

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
    const programs = await getPrograms();
    registeredPrograms.innerHTML = '';
    programs.forEach((programData, index) => {
        const program = registeredProgram.content.cloneNode(true);
        program.querySelector('.program').id = `program-${index}`;
        program.querySelector('.program-title').innerText = programData.title;
        program.querySelector('.program-status').innerText = status[programData.status];
        registeredPrograms.appendChild(program);
    });
}
