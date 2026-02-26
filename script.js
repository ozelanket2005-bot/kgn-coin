// Durum yönetimine username eklendi
let state = JSON.parse(localStorage.getItem('kgn_v20_final')) || {
    username: null,
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    inventory: [],
    tapPower: 5,
    lastUpdate: Date.now(),
    tasks: {
        click: { count: 0, hak: 3, nextAvailable: 0 },
        energy: { count: 0, hak: 3, nextAvailable: 0 },
        gold: { count: 0, hak: 1, nextAvailable: 0 }
    }
};

const borsaKartlari = [
    { id: 'ym', name: 'Yazılım Mühendisi', price: 5000, income: 1000 },
    { id: 'gm', name: 'Görsel Mühendisi', price: 5000, income: 1000 },
    { id: 'uc', name: 'Uzman Çalışan', price: 5000, income: 1000 },
    { id: 'p1', name: 'Patron 1', price: 1000, income: 250 },
    { id: 'p2', name: 'Patron 2', price: 2000, income: 500 },
    { id: 'p3', name: 'Patron 3', price: 3000, income: 1000 }
];

function init() {
    // Kullanıcı adı kontrolü
    if (!state.username) {
        document.getElementById('login-screen').style.display = 'flex';
    } else {
        document.getElementById('display-name').innerText = "👤 " + state.username;
    }

    renderMarket();
    renderTasks();
    createParticles(); // Parıltılar burada artırıldı
    
    let simdi = Date.now();
    let gecenSaniye = (simdi - state.lastUpdate) / 1000;
    state.balance += (state.hourlyIncome / 3600) * gecenSaniye;
    state.energy = Math.min(500, state.energy + (gecenSaniye * (500 / 10800)));

    setInterval(tick, 1000);
}

// Yeni Kullanıcı Kaydetme
function saveUsername() {
    let input = document.getElementById('username-input').value;
    if (input.trim().length > 2) {
        state.username = input;
        document.getElementById('login-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('display-name').innerText = "👤 " + state.username;
        }, 500);
        save();
    } else {
        alert("Lütfen en az 3 karakterli bir isim girin.");
    }
}

function tick() {
    state.balance += (state.hourlyIncome / 3600);
    if (state.energy < 500) state.energy += (500 / 10800);
    updateUI();
    save();
}

// UI GÜNCELLEMELERİ (Aynı kalsın dedin, dokunmadım)
function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome + " KGn";
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";

    const timer = document.getElementById('cooldown-timer');
    if (state.energy >= 500) {
        timer.innerText = "Enerji Dolu";
    } else {
        let kalan = Math.floor((500 - state.energy) / (500 / 10800));
        let h = Math.floor(kalan / 3600), m = Math.floor((kalan % 3600) / 60), s = kalan % 60;
        timer.innerText = `${h > 0 ? h + 's ' : ''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}

// REKLAM SİSTEMİ (ID 23517 Sabit, dokunmadım)
async function runRewardAd(type) {
    if (typeof window.Adsgram === 'undefined') {
        alert("Reklam ağı bağlanıyor..."); return;
    }
    const AdController = window.Adsgram.init({ blockId: "23517" });
    AdController.show().then(() => {
        let now = Date.now();
        let t = state.tasks[type];
        if (type === 'gold') {
            state.balance += 100; t.count++;
            if (t.count >= 10) { t.hak--; t.count = 0; if (t.hak <= 0) { t.nextAvailable = now + (24 * 60 * 60 * 1000); t.hak = 1; } }
        } 
        else if (type === 'click') {
            t.count++; if (t.count >= 2) { state.tapPower = 10; t.count = 0; t.hak--; setTimeout(() => { state.tapPower = 5; }, 3600000); if (t.hak <= 0) { t.nextAvailable = now + (24 * 60 * 60 * 1000); t.hak = 3; } }
        }
        else if (type === 'energy') {
            t.count++; if (t.count >= 2) { state.energy = 500; t.count = 0; t.hak--; if (t.hak <= 0) { t.nextAvailable = now + (24 * 60 * 60 * 1000); t.hak = 3; } else { t.nextAvailable = now + (10 * 60 * 1000); } }
        }
        save(); renderTasks(); alert("İşlem Başarılı Efendim Kaan!");
    }).catch(() => { alert("Reklam hazır değil."); });
}

function handleTap(e) {
    if (state.energy >= 5) {
        state.balance += state.tapPower; state.energy -= 5;
        let p = document.createElement('div'); p.className = 'plus-anim'; p.innerText = "+" + state.tapPower;
        let x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        let y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        p.style.left = x + 'px'; p.style.top = y + 'px';
        document.body.appendChild(p); setTimeout(() => p.remove(), 800);
        updateUI();
    }
}

// PARILTI ARTIŞI (Sarı noktalar 20'den 50'ye çıkarıldı ve hızı artırıldı)
function createParticles() {
    const cont = document.getElementById('particle-container');
    if(!cont) return;
    cont.innerHTML = ''; // Temizle
    for(let i=0; i<50; i++) {
        let p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random()*100+'vw'; p.style.top = Math.random()*100+'vh';
        p.style.width = Math.random()*4+'px'; p.style.height = p.style.width;
        p.style.animationDuration = (Math.random()*2 + 2) + 's';
        p.style.animationDelay = Math.random()*5+'s';
        cont.appendChild(p);
    }
}

// PAZAR VE GÖREVLER (Aynı kalsın dedin, dokunmadım)
function renderTasks() {
    const list = document.getElementById('task-list'); if (!list) return;
    let now = Date.now();
    const tasksHTML = [
        { id: 'gold', title: '10 Reklam İzle (Para Kazan)', desc: 'Reklam başı 100 KGn', cooldown: state.tasks.gold.nextAvailable },
        { id: 'click', title: '2 Reklam İzle (2x Güç)', desc: '1 Saatlik Tıklama Bonusu', cooldown: state.tasks.click.nextAvailable },
        { id: 'energy', title: '2 Reklam İzle (Full Enerji)', desc: 'Enerjini Anında Yenile', cooldown: state.tasks.energy.nextAvailable }
    ];
    list.innerHTML = tasksHTML.map(t => {
        let isWaiting = now < t.cooldown;
        return `<div class="task-card"><div><strong>${t.title}</strong><br><small>${t.desc}</small></div><button class="task-go-btn" ${isWaiting ? 'disabled' : ''} onclick="runRewardAd('${t.id}')">${isWaiting ? "BEKLE" : "İZLE"}</button></div>`;
    }).join('');
}

function renderMarket() {
    const list = document.getElementById('market-list'); if(!list) return;
    list.innerHTML = borsaKartlari.map(k => {
        let isOwned = state.inventory.includes(k.id);
        return `<div class="market-card"><div><strong>${k.name}</strong><br><small>Gelir: +${k.income}/saat</small></div><button class="task-go-btn" ${isOwned ? 'disabled' : ''} onclick="buyCard('${k.id}', ${k.price}, ${k.income})">${isOwned ? 'ALINDI' : k.price + ' KGn'}</button></div>`;
    }).join('');
}

function buyCard(id, price, income) {
    if (state.balance >= price) {
        state.balance -= price; state.hourlyIncome += income; state.inventory.push(id);
        renderMarket(); save();
    } else alert("Yetersiz KGn!");
}

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active'); el.classList.add('active');
}

function save() { state.lastUpdate = Date.now(); localStorage.setItem('kgn_v20_final', JSON.stringify(state)); }
window.onload = init;
    
