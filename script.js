let balance = 0;
let energy = 500;
const maxEnergy = 500;

document.getElementById('kgn-chip').addEventListener('click', (e) => {
    if (energy > 0) {
        balance++;
        energy--;
        updateDisplay();
    }
});

function updateDisplay() {
    document.getElementById('balance').innerText = balance;
    document.getElementById('energy-text').innerText = `${energy}/${maxEnergy}`;
    document.getElementById('energy-fill').style.width = `${(energy / maxEnergy) * 100}%`;
}

