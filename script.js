// OYUN VERİLERİ VE KAYIT
let state = JSON.parse(localStorage.getItem('kgn_v5')) || {
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    inventory: [],
    lastUpdate: Date.now()
};

const marketData = [
    { id: 'ym', name: 'Yazılım Mühendisi', price: 5000, income: 1000 },
    { id: 'gm', name: 'Görsel Mühendisi', price: 5000, income: 1000 },
    { id: 'uc', name: 'Uzman Çalışan', price: 5000, income: 1000 },
    { id: 'p1', name: 'Patron 1', price: 1000, income: 250 },
    { id: 'p2', name: 'Patron 2', price: 2000, income: 500 },
    { id: 'p3', name: 'Patron 3', price: 3000, income: 1000 }
];

function init() {
    renderMarket();
    createParticles();
    
    // Çevrimdışı kazanç
    let gap = (Date.now() - state.lastUpdate) / 1000;
    state.balance += (state.hourlyIncome / 3600) * gap;

    setInterval(tick, 1000);
}

function tick() {
    state.balance += (state.hourlyIncome / 3600);
    
    // Enerji dolumu (3 saat = 10800 saniye)
    if (state.energy < 500) {
        state.energy += (500 / 10800);
    }
    
    updateUI();
    save();
}

function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome + " KGn";
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";

    // Geri Sayım Sayacı
    let rem = Math.max(0, (500 - state.energy) * (10800 / 500));
    let m = Math.floor(rem / 60);
    let s = Math.floor(rem % 60);
    document.getElementById('cooldown-timer').innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function handleTap(e) {
    if (state.energy >= 5) {
        state.balance += 5;
        state.energy -= 5;
        
        // +5 Yazısı
        let p = document.createElement('div');
        p.className = 'plus-anim';
        p.innerText = "+5";
        p.style.left = e.clientX + 'px';
        p.style.top = e.clientY + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 700);
        
        updateUI();
    }
}

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = '';
    marketData.forEach(card => {
        let isOwned = state.inventory.includes(card.id);
        list.innerHTML += `
            <div class="kgn-card">
                <div>
                    <strong>${card.name}</strong><br>
                    <small>+${card.income} KGn/saat</small>
                </div>
                <button class="card-btn" ${isOwned ? 'disabled' : ''} onclick="buyCard('${card.id}', ${card.price}, ${card.income})">
                    ${isOwned ? 'ALINDI' : card.price + ' KGn'}
                </button>
            </div>`;
    });
}

function buyCard(id, price, income) {
    if (state.balance >= price) {
        state.balance -= price;
        state.hourlyIncome += income;
        state.inventory.push(id);
        renderMarket();
        save();
    } else {
        alert("Efendim Kaan, KGn bakiyeniz yetersiz!");
    }
}

function createParticles() {
    const container = document.getElementById('particle-container');
    for(let i=0; i<30; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.width = Math.random() * 3 + 2 + 'px';
        p.style.height = p.style.width;
        p.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(p);
    }
}

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    el.classList.add('active');
}

function save() {
    state.lastUpdate = Date.now();
    localStorage.setItem('kgn_v5', JSON.stringify(state));
}

window.onload = init;
    
