let balance = 0;
let energy = 500;
const maxEnergy = 500;
let lastClickTime = 0;
const fiveHoursInMs = 5 * 60 * 60 * 1000; // 5 saat (milisaniye)
const fillPerSecond = maxEnergy / (5 * 60 * 60); // Saniyede dolacak enerji

const coinImg = document.getElementById('kgn-chip');

coinImg.addEventListener('click', () => {
    const currentTime = Date.now();
    
    // 3 saniye kuralı kontrolü
    if (currentTime - lastClickTime < 3000) {
        return; // 3 saniye dolmadıysa hiçbir şey yapma
    }

    if (energy >= 1) {
        balance += 1;
        energy -= 1;
        lastClickTime = currentTime;
        
        // Tıklandığında parayı geçici olarak soluklaştır (bekleme süresi görseli)
        coinImg.classList.add('wait');
        setTimeout(() => coinImg.classList.remove('wait'), 3000);
        
        updateDisplay();
    }
});

function updateDisplay() {
    document.getElementById('balance').innerText = Math.floor(balance);
    document.getElementById('energy-text').innerText = `${Math.floor(energy)}/${maxEnergy}`;
    document.getElementById('energy-fill').style.width = `${(energy / maxEnergy) * 100}%`;
    updateTimer();
}

function updateTimer() {
    if (energy >= maxEnergy) {
        document.getElementById('energy-timer').innerText = "Enerji Dolu";
        return;
    }
    
    const energyNeeded = maxEnergy - energy;
    const secondsLeft = Math.ceil(energyNeeded / fillPerSecond);
    
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    
    document.getElementById('energy-timer').innerText = 
        `Dolmasına: ${h}s ${m}d ${s}sn`;
}

// 5 Saate göre Enerji Dolum Sistemi
setInterval(() => {
    if (energy < maxEnergy) {
        energy += fillPerSecond;
        if (energy > maxEnergy) energy = maxEnergy;
        updateDisplay();
    }
}, 1000);
