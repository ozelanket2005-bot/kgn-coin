let state = JSON.parse(localStorage.getItem('kgn_v7_final')) || {
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    inventory: [],
    tapPower: 5,
    lastUpdate: Date.now(),
    ads: { gold: 0, click: 0, energy: 0 }
};

const AdController = window.Adsgram ? window.Adsgram.init({ blockId: "23508" }) : null;

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
    let gap = (Date.now() - state.lastUpdate) / 1000;
    state.balance += (state.hourlyIncome / 3600) * gap;
    setInterval(tick, 1000);
}

function tick() {
    state.balance += (state.hourlyIncome / 3600);
    // 3 saatte dolum (500 / 10800 saniye = saniyede 0.046 enerji)
    if (state.energy < 500) state.energy += (500 / 10800);
    updateUI();
    save();
}

function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome + " KGn";
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";

    const timerElement = document.getElementById('cooldown-timer');
    if (state.energy >= 500) {
        timerElement.innerText = "Enerji Dolu";
        timerElement.style.color = "#ffd700";
    } else {
        let kalanEnerji = 500 - state.energy;
        let saniyeBaşınaEnerji = 500 / 10800;
        let kalanSaniye = Math.floor(kalanEnerji / saniyeBaşınaEnerji);
        let saat = Math.floor(kalanSaniye / 3600);
        let dakika = Math.floor((kalanSaniye % 3600) / 60);
        let saniye = kalanSaniye % 60;
        timerElement.innerText = (saat > 0 ? saat + "s " : "") + String(dakika).padStart(2, '0') + ":" + String(saniye).padStart(2, '0');
        timerElement.style.color = "#ffffff";
    }
}

async function runRewardAd(type) {
    if (!AdController) return alert("Reklam sistemi hazır değil!");
    AdController.show().then(() => {
        if (type === 'gold') {
            if (state.ads.gold < 10) { state.balance += 100; state.ads.gold++; alert("+100 KGn eklendi!"); }
            else { alert("Günlük limit doldu!"); }
        } 
        else if (type === 'click') {
            state.ads.click++;
            if (state.ads.click >= 2) {
                state.tapPower = 10; state.ads.click = 0;
                document.getElementById('c-status').innerText = "AKTİF";
                setTimeout(() => { state.tapPower = 5; document.getElementById('c-status').innerText = "Pasif"; }, 3600000);
                alert("2x Güç Aktif!");
            } else { alert("Son 1 reklam!"); }
        }
        else if (type === 'energy') {
            state.ads.energy++;
            if (state.ads.energy >= 2) { state.energy = 500; state.ads.energy = 0; alert("Enerji Full!"); }
            else { alert("Son 1 reklam!"); }
        }
        save();
    }).catch(() => alert("Reklam yüklenemedi."));
}

function renderMarket() {
    const list = document.getElementById('market-list');
    if(!list) return;
    list.innerHTML = '';
    borsaKartlari.forEach(k => {
        let isOwned = state.inventory.includes(k.id);
        list.innerHTML += `<div class="market-card"><div><strong>${k.name}</strong><br><small>Gelir: +${k.income} KGn/saat</small></div><button class="task-go-btn" ${isOwned ? 'disabled' : ''} onclick="buyCard('${k.id}', ${k.price}, ${k.income})">${isOwned ? 'SAHİPSİN' : k.price + ' KGn'}</button></div>`;
    });
}

function buyCard(id, price, income) {
    if (state.balance >= price) {
        state.balance -= price; state.hourlyIncome += income; state.inventory.push(id);
        renderMarket(); save();
    } else { alert("Yetersiz KGn!"); }
}

function handleTap(e) {
    if (state.energy >= 5) {
        state.balance += state.tapPower; state.energy -= 5;
        let p = document.createElement('div');
        p.className = 'plus-anim'; p.innerText = "+" + state.tapPower;
        p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
        updateUI();
    }
}

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    el.classList.add('active');
}

function createParticles() {
    const cont = document.getElementById('particle-container');
    for(let i=0; i<15; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random()*100+'vw'; p.style.top = Math.random()*100+'vh';
        p.style.width = '2px'; p.style.height = '2px';
        p.style.animationDelay = Math.random()*5+'s';
        cont.appendChild(p);
    }
}

function save() { state.lastUpdate = Date.now(); localStorage.setItem('kgn_v7_final', JSON.stringify(state)); }
window.onload = init;
        
