let balance = 0;
let energy = 500;
const maxEnergy = 500;
let lastClickTime = 0;
const fiveHoursInMs = 5 * 60 * 60 * 1000;
const fillPerSecond = maxEnergy / (5 * 60 * 60);

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

document.getElementById('kgn-chip').addEventListener('click', () => {
    const now = Date.now();
    // Senin isteğin üzerine bekleme süresini 1 saniye (1000ms) yaptık
    if (now - lastClickTime < 1000) return; 

    if (energy >= 1) {
        balance += 1;
        energy -= 1;
        lastClickTime = now;
        updateDisplay();
    }
});

function updateDisplay() {
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('energy-text').innerText = `${Math.floor(energy)}/${maxEnergy}`;
    document.getElementById('energy-fill').style.width = `${(energy / maxEnergy) * 100}%`;
    
    if (energy < maxEnergy) {
        const secondsLeft = Math.ceil((maxEnergy - energy) / fillPerSecond);
        const h = Math.floor(secondsLeft / 3600);
        const m = Math.floor((secondsLeft % 3600) / 60);
        const s = secondsLeft % 60;
        document.getElementById('energy-timer').innerText = `Dolmasına: ${h}s ${m}d ${s}sn`;
    } else {
        document.getElementById('energy-timer').innerText = "Enerji Dolu";
    }
}

setInterval(() => {
    if (energy < maxEnergy) {
        energy += fillPerSecond;
        if (energy > maxEnergy) energy = maxEnergy;
        updateDisplay();
    }
}, 1000);
        
