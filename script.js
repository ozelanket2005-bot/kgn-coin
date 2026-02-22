let balance = 520; // Mevcut bakiyen
let energy = 3;    // Mevcut enerjin
const maxEnergy = 500;
const kgnPerClick = 5;
const energyCost = 5;

// Enerji dolum hızı: 5 saatte 500 enerji dolması için -> 500 / (5 * 3600 sn) 
// Yani yaklaşık her 36 saniyede 1 enerji dolacak.
const recoveryIntervalSeconds = 36; 

const balanceEl = document.getElementById('balance');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinBtn = document.getElementById('kgn-chip');
const energyTimer = document.getElementById('energy-timer');

function updateUI() {
    balanceEl.textContent = balance.toLocaleString();
    energyText.textContent = `${energy}/${maxEnergy}`;
    
    // Enerji barı doluluk oranı
    const percentage = (energy / maxEnergy) * 100;
    energyFill.style.width = `${percentage}%`;

    // SÜRE HESAPLAMA
    if (energy < maxEnergy) {
        const neededEnergy = maxEnergy - energy;
        const totalSecondsLeft = neededEnergy * recoveryIntervalSeconds;
        
        const hours = Math.floor(totalSecondsLeft / 3600);
        const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
        const seconds = totalSecondsLeft % 60;
        
        energyTimer.textContent = `Dolmasına: ${hours}sa ${minutes}dk ${seconds}sn`;
    } else {
        energyTimer.textContent = `Tamamen Dolu`;
    }
}

// Tıklama Fonksiyonu
coinBtn.addEventListener('click', () => {
    if (energy >= energyCost) {
        balance += kgnPerClick;
        energy -= energyCost;
        updateUI();
    }
});

// ENERJİ DOLUM SİSTEMİ (36 Saniyede +1)
let recoveryCounter = 0;
setInterval(() => {
    if (energy < maxEnergy) {
        recoveryCounter++;
        
        // 36 saniye dolduğunda 1 enerji ekle
        if (recoveryCounter >= recoveryIntervalSeconds) {
            energy++;
            recoveryCounter = 0;
        }
        
        // Süreyi her saniye güncellemek için UI'ı tazele
        updateUI();
    }
}, 1000);

// İlk açılış
updateUI();

// Yıldız Parçacıklarını Oluşturma (Önceki kodun devamı)
function createParticles() {
    const particlesContainer = document.getElementById('particles-container');
    if(!particlesContainer) return;
    const numParticles = 40;
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 90}%`;
        particle.style.animationDelay = `${Math.random() * 4}s`;
        particlesContainer.appendChild(particle);
    }
}
createParticles();
                                           
