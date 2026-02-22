const firebaseConfig = {
    databaseURL: "https://kgn-coin-default-rtdb.europe-west1.firebasedatabase.app" 
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let userId = localStorage.getItem('kgn_user_id') || "user_" + Math.floor(Math.random() * 1000000);
localStorage.setItem('kgn_user_id', userId);

// OYUN DURUMU
let balance = 0;
let energy = 500;
let hourlyIncome = 0;
let ownedCards = [];
let clickMultiplier = 1;

// GÖREV SİSTEMİ VERİLERİ
let taskData = {
    kazan: { count: 0, lastReset: 0 },
    energy: { count: 0, subCount: 0, lastReset: 0, nextAvailable: 0 },
    x2: { count: 0, subCount: 0, lastReset: 0, nextAvailable: 0, activeUntil: 0 }
};

const maxEnergy = 500;
const energyPerSecond = maxEnergy / 7200; // 2 saat

// ELEMENTLER
const balanceEl = document.getElementById('balance');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const energyTimer = document.getElementById('energy-timer');
const hourlyRateEl = document.getElementById('hourly-rate');
const x2Badge = document.getElementById('multiplier-badge');

// SAYFA YÖNETİMİ
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');
    if(pageId === 'exchange-page') renderCards();
    if(pageId === 'tasks-page') updateTaskUI();
}

// BORSA SİSTEMİ
const marketCards = [
    { id: 'dev', name: 'Yazılım Mühendisi', cost: 5000, profit: 2000 },
    { id: 'boss1', name: 'Patron 1', cost: 1000, profit: 250 },
    { id: 'boss2', name: 'Patron 2', cost: 4000, profit: 500 },
    { id: 'boss3', name: 'Patron 3', cost: 6000, profit: 1000 }
];

function renderCards() {
    const container = document.getElementById('cards-container');
    container.innerHTML = '';
    marketCards.forEach(card => {
        const isOwned = ownedCards.includes(card.id);
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${isOwned ? 'owned' : ''}`;
        cardDiv.innerHTML = `
            <h3>${card.name}</h3>
            <p class="card-profit">+${card.profit} KGn/saat</p>
            <button class="buy-btn" ${isOwned || balance < card.cost ? 'disabled' : ''} 
                onclick="buyCard('${card.id}', ${card.cost}, ${card.profit})">
                ${isOwned ? 'SAHİPSİN' : card.cost + ' KGn'}
            </button>
        `;
        container.appendChild(cardDiv);
    });
}

window.buyCard = function(id, cost, profit) {
    if (balance >= cost && !ownedCards.includes(id)) {
        balance -= cost; hourlyIncome += profit;
        ownedCards.push(id); renderCards(); updateUI(); saveToCloud();
    }
};

// REKLAM VE GÖREV SİSTEMİ
function updateTaskUI() {
    const now = Date.now();
    
    // 1. Reklam İzle Kazan (10 Hak - 24 Saat)
    const btnKazan = document.getElementById('btn-ad-kazan');
    if (now - taskData.kazan.lastReset > 86400000) { taskData.kazan.count = 0; taskData.kazan.lastReset = now; }
    const kazanKalan = 10 - taskData.kazan.count;
    document.getElementById('ad-kazan-info').innerText = `Kalan Hak: ${kazanKalan}/10`;
    btnKazan.disabled = kazanKalan <= 0;
    if(kazanKalan <= 0) btnKazan.innerText = formatTime(86400000 - (now - taskData.kazan.lastReset));

    // 2. Enerji Doldur (3 Hak - 10dk Bekleme - 24 Saat)
    const btnEnergy = document.getElementById('btn-ad-energy');
    if (now - taskData.energy.lastReset > 86400000) { taskData.energy.count = 0; taskData.energy.lastReset = now; }
    document.getElementById('ad-energy-info').innerText = `Kalan Hak: ${3 - taskData.energy.count}/3`;
    
    if (taskData.energy.count >= 3) {
        btnEnergy.disabled = true; btnEnergy.innerText = formatTime(86400000 - (now - taskData.energy.lastReset));
    } else if (now < taskData.energy.nextAvailable) {
        btnEnergy.disabled = true; btnEnergy.innerText = formatTime(taskData.energy.nextAvailable - now);
    } else {
        btnEnergy.disabled = false; btnEnergy.innerText = `İzle (${taskData.energy.subCount}/2)`;
    }

    // 3. 2X Tıklama (3 Hak - 10dk Bekleme - 24 Saat)
    const btnX2 = document.getElementById('btn-ad-x2');
    if (now - taskData.x2.lastReset > 86400000) { taskData.x2.count = 0; taskData.x2.lastReset = now; }
    document.getElementById('ad-x2-info').innerText = `Kalan Hak: ${3 - taskData.x2.count}/3`;

    if (taskData.x2.count >= 3) {
        btnX2.disabled = true; btnX2.innerText = formatTime(86400000 - (now - taskData.x2.lastReset));
    } else if (now < taskData.x2.nextAvailable) {
        btnX2.disabled = true; btnX2.innerText = formatTime(taskData.x2.nextAvailable - now);
    } else {
        btnX2.disabled = false; btnX2.innerText = `İzle (${taskData.x2.subCount}/2)`;
    }
}

function startAd(type) {
    alert("Reklam izleniyor... (5 saniye)");
    setTimeout(() => {
        const now = Date.now();
        if (type === 'kazan') {
            balance += 100; taskData.kazan.count++;
        } else if (type === 'energy') {
            taskData.energy.subCount++;
            if (taskData.energy.subCount >= 2) {
                energy = maxEnergy; taskData.energy.count++; taskData.energy.subCount = 0;
                taskData.energy.nextAvailable = now + 600000; // 10dk
            }
        } else if (type === 'x2') {
            taskData.x2.subCount++;
            if (taskData.x2.subCount >= 2) {
                taskData.x2.activeUntil = now + 600000; // 10dk aktif
                taskData.x2.count++; taskData.x2.subCount = 0;
                taskData.x2.nextAvailable = now + 600000; // 10dk bekleme
                clickMultiplier = 2;
            }
        }
        updateUI(); updateTaskUI(); saveToCloud();
    }, 2000);
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}sa ${m}dk ${s % 60}sn`;
}

// OYUN DÖNGÜSÜ
function updateUI() {
    balanceEl.textContent = Math.floor(balance).toLocaleString();
    hourlyRateEl.textContent = `+${hourlyIncome.toLocaleString()}`;
    energyText.textContent = `${Math.floor(energy)}/${maxEnergy}`;
    energyFill.style.width = `${(energy / maxEnergy) * 100}%`;
    
    if (energy < maxEnergy) {
        const sec = Math.ceil((maxEnergy - energy) / energyPerSecond);
        energyTimer.textContent = `Dolmasına: ${Math.floor(sec/3600)}sa ${Math.floor((sec%3600)/60)}dk ${sec%60}sn`;
    } else { energyTimer.textContent = "Enerji Dolu"; }

    // 2X Durumu
    if (Date.now() < taskData.x2.activeUntil) {
        clickMultiplier = 2; x2Badge.style.display = 'block';
    } else {
        clickMultiplier = 1; x2Badge.style.display = 'none';
    }
}

document.getElementById('kgn-chip').addEventListener('click', (e) => {
    if (energy >= 5) {
        const gain = 5 * clickMultiplier;
        balance += gain; energy -= 5;
        createPlusAnimation(e, gain); updateUI(); saveToCloud();
    }
});

function createPlusAnimation(e, val) {
    const plus = document.createElement('div');
    plus.innerText = `+${val}`; plus.className = 'plus-animation';
    plus.style.left = `${e.clientX || e.touches[0].clientX}px`;
    plus.style.top = `${e.clientY || e.touches[0].clientY}px`;
    document.body.appendChild(plus);
    setTimeout(() => plus.remove(), 800);
}

// VERİ YÜKLEME/KAYDETME
database.ref('users/' + userId).once('value').then((snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.val();
        balance = data.balance || 0; energy = data.energy || 500;
        hourlyIncome = data.hourlyIncome || 0; ownedCards = data.ownedCards || [];
        if(data.taskData) taskData = data.taskData;
    }
    updateUI();
});

setInterval(() => {
    if (energy < maxEnergy) energy += energyPerSecond;
    if (hourlyIncome > 0) balance += (hourlyIncome / 3600);
    updateUI();
    if(document.getElementById('tasks-page').classList.contains('active')) updateTaskUI();
}, 1000);

function saveToCloud() {
    database.ref('users/' + userId).set({
        balance, energy, hourlyIncome, ownedCards, taskData, lastActive: Date.now()
    });
}
setInterval(saveToCloud, 15000);

document.getElementById('wallet-btn').addEventListener('click', () => alert("Yakında KGn çekimi aktif! Efendim Kaan."));

function createParticles() {
    const container = document.getElementById('particles-container');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div'); p.className = 'particle';
        p.style.width = p.style.height = (Math.random()*4+2)+'px';
        p.style.left = Math.random()*100+'%'; p.style.top = Math.random()*100+'%';
        p.style.animationDelay = Math.random()*5+'s'; container.appendChild(p);
    }
}
createParticles();
