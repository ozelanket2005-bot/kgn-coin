let balance = 0;
let energy = 500;
const maxEnergy = 500;
let hourlyRate = 0;

document.getElementById('kgn-chip').addEventListener('click', () => {
    if (energy > 0) {
        balance += 1;
        energy -= 1; // Her tıklamada 1 enerji gider
        updateDisplay();
    }
});

function updateDisplay() {
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('energy-text').innerText = `${energy}/${maxEnergy}`;
    document.getElementById('energy-fill').style.width = `${(energy / maxEnergy) * 100}%`;
    document.getElementById('hourly-rate').innerText = `+${hourlyRate}`;
}

// Enerji dolum hızını yavaşlattım (Her 3 saniyede 1 enerji dolar)
setInterval(() => {
    if (energy < maxEnergy) {
        energy++;
        updateDisplay();
    }
}, 3000);

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}
