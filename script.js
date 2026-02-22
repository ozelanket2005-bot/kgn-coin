// OYUNCU VERİLERİ (KAYITLI)
let state = JSON.parse(localStorage.getItem('kgn_pro_v1')) || {
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    inventory: [],
    tapPower: 5,
    lastUpdate: Date.now(),
    adStats: { goldAds: 0, clickAds: 0, energyAds: 0 }
};

// ADSGRAM BAĞLANTISI (Senin Yeni Oluşturduğun Block ID)
const AdController = window.Adsgram.init({ blockId: "23508" }); // Buraya paneldeki ID'ni yazabilirsin

const borsaKartlari = [
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
    
    // Çevrimdışı Kazanç Hesapla
    let gap = (Date.now() - state.lastUpdate) / 1000;
    state.balance += (state.hourlyIncome / 3600) * gap;

    setInterval(tick, 1000);
}

function tick() {
    state.balance += (state.hourlyIncome / 3600);
    if (state.energy < 500) state.energy += (500 / 10800); // 3 saat dolum
    
    updateUI();
    save();
}

function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome + " KGn";
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";

    let rem = Math.max(0, (500 - state.energy) * (10800 / 500));
    let m = Math.floor(rem / 60);
    let s = Math.floor(rem % 60);
    document.getElementById('cooldown-timer').innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// REKLAM İZLEME VE ÖDÜL SİSTEMİ
function runRewardAd(type) {
    AdController.show().then(() => {
        // Reklam başarıyla izlendiğinde burası çalışır (Para kazanırsın)
        if (type === 'gold') {
            if (state.adStats.goldAds < 10) {
                state.balance += 100;
                state.adStats.goldAds++;
                alert("Tebrikler Efendim Kaan! +100 KGn hesaba geçti.");
            } else {
                alert("Bugünlük KGn paketi limitin doldu!");
            }
        } 
        else if (type === 'click') {
            state.adStats.clickAds++;
            if (state.adStats.clickAds >= 2) {
                state.tapPower = 10;
                state.adStats.clickAds = 0;
                document.getElementById('c-status').innerText = "AKTİF (1 Saat)";
                setTimeout(() => { state.tapPower = 5; document.getElementById('c-status').innerText = "Pasif"; }, 3600000);
            } else {
                alert("Bir reklam daha izle, gücün katlansın!");
            }
        }
        else if (type === 'energy') {
            state.adStats.energyAds++;
            if (state.adStats.energyAds >= 2) {
                state.energy = 500;
                state.adStats.energyAds = 0;
                alert("Enerji Fullendi!");
            }
        }
        save();
        updateUI();
    }).catch(() => {
        alert("Reklam yüklenemedi, lütfen tekrar deneyin.");
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
        alert("Yetersiz KGn!");
    }
}

function handleTap(e) {
    if (state.energy >= 5) {
        state.balance += state.tapPower;
        state.energy -= 5;
        createTapAnim(e);
        updateUI();
    }
}

function createTapAnim(e) {
    let p = document.createElement('div');
    p.className = 'plus-anim';
    p.innerText = "+" + state.tapPower;
    p.style.left = e.clientX + 'px';
    p.style.top = e.clientY + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
}

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = '';
    borsaKartlari.forEach(card => {
        let isOwned = state.inventory.includes(card.id);
        list.innerHTML += `
            <div class="kgn-card">
                <div><strong>${card.name}</strong><br><small>+${card.income} KGn/saat</small></div>
                <button class="card-btn" ${isOwned ? 'disabled' : ''} onclick="buyCard('${card.id}', ${card.price}, ${card.income})">
                    ${isOwned ? 'SAHİPSİN' : card.price + ' KGn'}
                </button>
            </div>`;
    });
}

function createParticles() {
    const container = document.getElementById('particle-container');
    for(let i=0; i<20; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.width = '3px'; p.style.height = '3px';
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
    localStorage.setItem('kgn_pro_v1', JSON.stringify(state));
}

window.onload = init;
                 
