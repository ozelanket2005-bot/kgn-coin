let balance = 0;
let energy = 500;
const maxEnergy = 500;
const kgnPerClick = 5; 
const energyCost = 5; 

const balanceEl = document.getElementById('balance');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinBtn = document.getElementById('kgn-chip');
const energyTimer = document.getElementById('energy-timer'); // YENİ: Enerji timer elementini yakala

function updateUI() {
    balanceEl.textContent = balance.toLocaleString();
    energyText.textContent = `${energy}/${maxEnergy}`;
    energyFill.style.width = `${(energy / maxEnergy) * 100}%`;

    // Enerji dolum süresini güncelle (basit bir örnek)
    if (energy < maxEnergy) {
        const remainingEnergy = maxEnergy - energy;
        const timeToFill = remainingEnergy; // Saniyede 1 dolduğu için
        const minutes = Math.floor(timeToFill / 60);
        const seconds = timeToFill % 60;
        energyTimer.textContent = `Dolmasına: ${minutes}d ${seconds}sn`;
    } else {
        energyTimer.textContent = `Dolu`;
    }
}

// Tıklama Olayı
coinBtn.addEventListener('click', () => {
    if (energy >= energyCost) {
        balance += kgnPerClick;
        energy -= energyCost;
        updateUI();
    } else {
        // İstersen burada bir "enerjin bitti" uyarısı gösterebilirsin
        console.log("Enerjin bitti!");
    }
});

// Enerji Yenileme (Saniyede +1)
setInterval(() => {
    if (energy < maxEnergy) {
        energy++;
        updateUI();
    }
}, 1000);

// Yanıp Sönen Noktaları Oluşturma Fonksiyonu
function createParticles() {
    const particlesContainer = document.getElementById('particles-container');
    const numParticles = 50; // Oluşturulacak nokta sayısı
    const containerHeight = particlesContainer.offsetHeight;
    const containerWidth = particlesContainer.offsetWidth;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 8 + 4; // 4px ile 12px arası boyut
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        particle.style.left = `${Math.random() * containerWidth}px`;
        particle.style.top = `${Math.random() * containerHeight}px`;
        
        particle.style.animationDelay = `${Math.random() * 4}s`; // Farklı zamanlarda yanıp sönsünler
        
        particlesContainer.appendChild(particle);
    }
}

// İlk açılışta UI ve Noktaları güncelle
updateUI();
createParticles(); // Noktaları oluştur
