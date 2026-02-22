// --- FIREBASE BAĞLANTISI ---
const firebaseConfig = {
    databaseURL: "https://kgn-coin-default-rtdb.europe-west1.firebasedatabase.app" 
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let userId = localStorage.getItem('kgn_user_id') || "user_" + Math.floor(Math.random() * 1000000);
localStorage.setItem('kgn_user_id', userId);

// OYUN VERİLERİ
let balance = 0;
let energy = 500;
let hourlyIncome = 0;
let ownedCards = []; // Satın alınan kartların ID listesi

const maxEnergy = 500;
const energyPerSecond = maxEnergy / (5 * 3600); // 5 saatte dolum

// BORSA KARTLARI VERİSİ
const marketCards = [
    { id: 'dev', name: 'Yazılım Mühendisi', cost: 5000, profit: 2000, desc: 'Sanal Kart' },
    { id: 'boss1', name: 'Patron 1', cost: 1000, profit: 250, desc: 'Sanal Kart' },
    { id: 'boss2', name: 'Patron 2', cost: 4000, profit: 500, desc: 'Sanal Kart' },
    { id: 'boss3', name: 'Patron 3', cost: 6000, profit: 1000, desc: 'Sanal Kart' }
];

// ELEMENTLER
const balanceEl = document.getElementById('balance');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const hourlyRateEl = document.getElementById('hourly-rate');
const cardsContainer = document.getElementById('cards-container');

// SAYFA GEÇİŞ FONKSİYONU
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// KARTLARI LİSTELE
function renderCards() {
    cardsContainer.innerHTML = '';
    marketCards.forEach(card => {
        const isOwned = ownedCards.includes(card.id);
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${isOwned ? 'owned' : ''}`;
        cardDiv.innerHTML = `
            <h3>${card.name}</h3>
            <p>${card.desc}</p>
            <p class="card-profit">+${card.profit} KGn/saat</p>
            <p>Maliyet: ${card.cost} KGn</p>
            <button class="buy-btn" ${isOwned || balance < card.cost ? 'disabled' : ''} 
                onclick="buyCard('${card.id}', ${card.cost}, ${card.profit})">
                ${isOwned ? 'ALINDI' : 'SATIN AL'}
            </button>
        `;
        cardsContainer.appendChild(cardDiv);
    });
}

// KART SATIN ALMA
window.buyCard = function(id, cost, profit) {
    if (balance >= cost && !ownedCards.includes(id)) {
        balance -= cost;
        hourlyIncome += profit;
        ownedCards.push(id);
        renderCards();
        updateUI();
        saveToCloud();
        alert(`${id} başarıyla satın alındı Efendim Kaan!`);
    }
};

// UI GÜNCELLEME
function updateUI() {
    balanceEl.textContent = Math.floor(balance).toLocaleString();
    hourlyRateEl.textContent = `+${hourlyIncome.toLocaleString()}`;
    energyText.textContent = `${Math.floor(energy)}/${maxEnergy}`;
    energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
}

// TIKLAMA OLAYI (+5 Efekti)
document.getElementById('kgn-chip').addEventListener('click', (e) => {
    if (energy >= 5) {
        balance += 5;
        energy -= 5;
        createPlusAnimation(e);
        updateUI();
        saveToCloud();
    }
});

function createPlusAnimation(e) {
    const plus = document.createElement('div');
    plus.innerText = '+5';
    plus.className = 'plus-animation';
    plus.style.left = `${(e.clientX || e.touches[0].clientX)}px`;
    plus.style.top = `${(e.clientY || e.touches[0].clientY)}px`;
    document.body.appendChild(plus);
    setTimeout(() => plus.remove(), 800);
}

// BULUTTAN VERİ ÇEK
database.ref('users/' + userId).once('value').then((snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        balance = data.balance || 0;
        energy = data.energy || 500;
        hourlyIncome = data.hourlyIncome || 0;
        ownedCards = data.ownedCards || [];
    }
    renderCards();
    updateUI();
});

// SAATLİK KAZANÇ VE ENERJİ DOLUMU (Her Saniye)
setInterval(() => {
    // Enerji dolumu
    if (energy < maxEnergy) {
        energy += energyPerSecond;
        if (energy > maxEnergy) energy = maxEnergy;
    }
    // Pasif kazanç (Saniyede bir miktar ekle)
    if (hourlyIncome > 0) {
        balance += (hourlyIncome / 3600);
    }
    updateUI();
}, 1000);

// BULUTA YEDEKLE (Her 10 saniyede bir)
function saveToCloud() {
    database.ref('users/' + userId).set({
        balance: balance,
        energy: energy,
        hourlyIncome: hourlyIncome,
        ownedCards: ownedCards,
        lastActive: Date.now()
    });
}
setInterval(saveToCloud, 10000);

// CÜZDAN MESAJI
document.getElementById('wallet-btn').addEventListener('click', () => {
    alert("Yakında KGn coinlerinizi çekebileceksiniz, lütfen sabırlı olun Efendim Kaan! 🚀");
});

// Süsleme Noktaları
function createParticles() {
    const container = document.getElementById('particles-container');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(p);
    }
}
createParticles();
        
