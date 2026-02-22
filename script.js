// --- FIREBASE BAĞLANTISI ---
const firebaseConfig = {
    databaseURL: "https://kgn-coin-default-rtdb.europe-west1.firebasedatabase.app" 
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let userId = localStorage.getItem('kgn_user_id') || "user_" + Math.floor(Math.random() * 1000000);
localStorage.setItem('kgn_user_id', userId);

let balance = 0;
let energy = 500;
const maxEnergy = 500;
const kgnPerClick = 5;
const energyCost = 5;
const energyPerSecond = maxEnergy / (5 * 3600); // 5 saatte tam dolum

const balanceEl = document.getElementById('balance');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinBtn = document.getElementById('kgn-chip');
const energyTimer = document.getElementById('energy-timer');
const walletBtn = document.getElementById('wallet-btn');

// VERİLERİ BULUTTAN ÇEK
database.ref('users/' + userId).once('value').then((snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        balance = data.balance || 0;
        energy = data.energy || 500;
        updateUI();
    }
});

function updateUI() {
    balanceEl.textContent = Math.floor(balance).toLocaleString();
    energyText.textContent = `${Math.floor(energy)}/${maxEnergy}`;
    energyFill.style.width = `${(energy / maxEnergy) * 100}%`;

    if (energy < maxEnergy) {
        const secondsLeft = Math.ceil((maxEnergy - energy) / energyPerSecond);
        const h = Math.floor(secondsLeft / 3600);
        const m = Math.floor((secondsLeft % 3600) / 60);
        const s = secondsLeft % 60;
        energyTimer.textContent = `Dolmasına: ${h}sa ${m}dk ${s}sn`;
    } else {
        energyTimer.textContent = `Enerji Dolu`;
    }
}

// Tıklama Olayı (+5 Efekti Dahil)
coinBtn.addEventListener('click', (e) => {
    if (energy >= energyCost) {
        balance += kgnPerClick;
        energy -= energyCost;
        
        createPlusAnimation(e);
        updateUI();
        saveToCloud();
    }
});

function createPlusAnimation(e) {
    const plus = document.createElement('div');
    plus.innerText = `+${kgnPerClick}`;
    plus.className = 'plus-animation';
    
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    plus.style.left = `${x}px`;
    plus.style.top = `${y}px`;
    
    document.body.appendChild(plus);
    setTimeout(() => plus.remove(), 800);
}

// Cüzdan Uyarısı
walletBtn.addEventListener('click', () => {
    alert("Yakında KGn coinlerinizi çekebileceksiniz, lütfen sabırlı olun Efendim Kaan! Çalışmalarımız devam ediyor. 🚀");
});

// Otomatik Enerji Dolumu
setInterval(() => {
    if (energy < maxEnergy) {
        energy += energyPerSecond;
        if (energy > maxEnergy) energy = maxEnergy;
        updateUI();
    }
}, 1000);

function saveToCloud() {
    database.ref('users/' + userId).set({
        balance: balance,
        energy: energy,
        lastActive: Date.now()
    });
}

function createParticles() {
    const container = document.getElementById('particles-container');
    if(!container) return;
    for (let i = 0; i < 35; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 5 + 2;
        p.style.width = p.style.height = size + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 4 + 's';
        container.appendChild(p);
    }
}
createParticles();
updateUI();
        
