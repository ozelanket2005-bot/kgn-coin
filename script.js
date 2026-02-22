let balance = 520; 
let energy = 3;    
const maxEnergy = 500;
const kgnPerClick = 5;
const energyCost = 5;

// 5 SAAT HESABI: 5 saat = 18.000 saniye. 
// Her 1 saniyede dolacak enerji miktarı = 500 / 18000 = 0.0277...
const energyPerSecond = maxEnergy / (5 * 3600); 

const balanceEl = document.getElementById('balance');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinBtn = document.getElementById('kgn-chip');
const energyTimer = document.getElementById('energy-timer');

function updateUI() {
    // Bakiyeyi güncelle
    balanceEl.textContent = Math.floor(balance).toLocaleString();
    
    // Enerjiyi tam sayı olarak göster ama arkada küsuratlı kalsın
    const displayEnergy = Math.floor(energy);
    energyText.textContent = `${displayEnergy}/${maxEnergy}`;
    
    // Barın doluluk oranını hassas ayarla
    const percentage = (energy / maxEnergy) * 100;
    energyFill.style.width = `${percentage}%`;

    // SÜRE SAYACI
    if (energy < maxEnergy) {
        const remainingEnergy = maxEnergy - energy;
        const totalSecondsLeft = Math.ceil(remainingEnergy / energyPerSecond);
        
        const hours = Math.floor(totalSecondsLeft / 3600);
        const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
        const seconds = totalSecondsLeft % 60;
        
        energyTimer.textContent = `Dolmasına: ${hours}sa ${minutes}dk ${seconds}sn`;
    } else {
        energyTimer.textContent = `Enerji Full!`;
    }
}

// TIKLAMA OLAYI
coinBtn.addEventListener('click', () => {
    if (energy >= energyCost) {
        balance += kgnPerClick;
        energy -= energyCost;
        updateUI();
    }
});

// GERÇEK ZAMANLI DOLUM (Her 1 saniyede bar hareket eder)
setInterval(() => {
    if (energy < maxEnergy) {
        energy += energyPerSecond; // Saniyede 0.027 enerji ekler
        if (energy > maxEnergy) energy = maxEnergy; // Taşmayı önle
        updateUI();
    }
}, 1000);

updateUI();

// Yıldızlar (Arka plan süsü)
function createParticles() {
    const container = document.getElementById('particles-container');
    if(!container) return;
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.width = p.style.height = (Math.random() * 5 + 2) + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 90 + '%';
        p.style.animationDelay = (Math.random() * 4) + 's';
        container.appendChild(p);
    }
}
createParticles();
    
