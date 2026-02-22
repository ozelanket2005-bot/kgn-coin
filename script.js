// OYUNCU VERİLERİ (LOCALSTORAGE İLE KAYDEDİLİR)
let user = JSON.parse(localStorage.getItem('kgn_v4')) || {
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    inventory: [],
    tapPower: 5,
    tasks: {
        click: { ads: 0, rights: 3, resetAt: 0 },
        energy: { ads: 0, rights: 3, resetAt: 0, cooldown: 0 },
        gold: { ads: 0, resetAt: 0 }
    },
    lastLogin: Date.now()
};

const AdController = window.Adsgram.init({ blockId: "23508" });

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
    // Çevrimdışı kazanç hesapla
    let gap = (Date.now() - user.lastLogin) / 1000;
    user.balance += (user.hourlyIncome / 3600) * gap;
    
    tick();
    setInterval(tick, 1000);
}

function tick() {
    const now = Date.now();
    
    // Pasif Kazanç
    user.balance += (user.hourlyIncome / 3600);
    
    // Enerji Dolumu (3 saat = 10800 sn)
    if (user.energy < 500) {
        user.energy += (500 / 10800);
    }

    // Görev Sıfırlama (24 Saat)
    ['click', 'energy', 'gold'].forEach(type => {
        if (user.tasks[type].resetAt && now > user.tasks[type].resetAt) {
            user.tasks[type].rights = 3;
            user.tasks[type].ads = 0;
            user.tasks[type].resetAt = 0;
        }
    });

    updateUI();
    save();
}

function updateUI() {
    document.getElementById('total-score').innerText = Math.floor(user.balance).toLocaleString() + " KGn";
    document.getElementById('h-inc').innerText = user.hourlyIncome;
    document.getElementById('e-now').innerText = Math.floor(user.energy);
    document.getElementById('bar-fill').style.width = (user.energy / 500 * 100) + "%";
    
    // Enerji Sayacı
    let rem = Math.max(0, (500 - user.energy) * (10800 / 500));
    let m = Math.floor(rem / 60);
    let s = Math.floor(rem % 60);
    document.getElementById('e-timer').innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function handleTap(e) {
    if (user.energy >= 5) {
        user.balance += user.tapPower;
        user.energy -= 5;
        
        // +5 Animasyonu
        let p = document.createElement('div');
        p.className = 'plus-five';
        p.innerText = "+" + user.tapPower;
        p.style.left = e.clientX + 'px';
        p.style.top = e.clientY + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
        
        updateUI();
    }
}

function renderMarket() {
    const cont = document.getElementById('market-container');
    cont.innerHTML = '';
    borsaKartlari.forEach(k => {
        let isOwned = user.inventory.includes(k.id);
        cont.innerHTML += `
            <div class="kgn-card">
                <div><h4>${k.name}</h4><small>+${k.income} KGn/saat</small></div>
                <button class="action-btn" ${isOwned ? 'disabled' : ''} onclick="buyCard('${k.id}', ${k.price}, ${k.income})">
                    ${isOwned ? 'SAHİPSİN' : k.price + ' KGn'}
                </button>
            </div>`;
    });
}

function buyCard(id, price, income) {
    if (user.balance >= price) {
        user.balance -= price;
        user.hourlyIncome += income;
        user.inventory.push(id);
        renderMarket();
        save();
    } else { alert("Yetersiz KGn!"); }
}

function runTask(type) {
    let t = user.tasks[type];
    const now = Date.now();

    if (t.rights === 0) { alert("24 saatlik beklemeye geçildi!"); return; }
    if (type === 'energy' && now < t.cooldown) { alert("10 dakika beklemelisin!"); return; }

    AdController.show().then(() => {
        t.ads++;
        if (type === 'click' && t.ads >= 2) {
            user.tapPower *= 2; t.ads = 0; t.rights--;
            setTimeout(() => { user.tapPower = 5; }, 3600000);
            if(t.rights === 0) t.resetAt = now + 86400000;
            alert("1 Saat Boyunca 2x Tıklama Aktif!");
        }
        else if (type === 'energy' && t.ads >= 2) {
            user.energy = 500; t.ads = 0; t.rights--;
            t.cooldown = now + 600000;
            if(t.rights === 0) t.resetAt = now + 86400000;
            alert("Enerji Fullendi!");
        }
        else if (type === 'gold' && t.ads >= 10) {
            user.balance += 1000; t.ads = 0;
            t.resetAt = now + 86400000;
            alert("1000 KGn Kazandın!");
        }
        save();
    });
}

function switchTab(id, el) {
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active-tab'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active-tab');
    el.classList.add('active');
}

function save() {
    user.lastLogin = Date.now();
    localStorage.setItem('kgn_v4', JSON.stringify(user));
}

window.onload = init;
