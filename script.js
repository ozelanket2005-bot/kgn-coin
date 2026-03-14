// DURUM YÖNETİMİ
let state = JSON.parse(localStorage.getItem('kgn_v2026')) || {
    username: null,
    userId: Math.floor(100000 + Math.random() * 900000),
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    lastUpdate: Date.now(),
    inventory: [],
    tapPower: 5,
    tasks: {
        gold: { count: 0, hak: 1, cooldown: 0 },   // 10 reklam için
        click: { count: 0, hak: 3, cooldown: 0 },  // 2x tık için
        energy: { count: 0, hak: 3, cooldown: 0 }  // enerji için
    }
};

const marketItems = [
    { id: 'ym', name: 'Yazılım Mühendisi', price: 5000, income: 1000 },
    { id: 'gm', name: 'Görsel Mühendisi', price: 5000, income: 1000 },
    { id: 'uc', name: 'Uzman Çalışan', price: 5000, income: 1000 },
    { id: 'p1', name: 'Patron 1', price: 1000, income: 250 },
    { id: 'p2', name: 'Patron 2', price: 2000, income: 500 },
    { id: 'p3', name: 'Patron 3', price: 3000, income: 1000 }
];

function init() {
    if (!state.username) {
        document.getElementById('login-screen').style.display = 'flex';
    } else {
        document.getElementById('ref-link').innerText = "https://t.me/KGn_coin_bot?start=" + state.userId;
        calculateOfflineEarnings();
        setInterval(gameLoop, 1000);
        renderMarket();
        renderTasks();
        createParticles();
    }
}

// OYUN DÖNGÜSÜ
function gameLoop() {
    let now = Date.now();
    let diff = (now - state.lastUpdate) / 1000;
    
    // Saatlik kazanç ekle (Saniye bazlı)
    let incomePerSec = state.hourlyIncome / 3600;
    state.balance += incomePerSec;
    
    // Enerji Yenilenmesi (3 saatte full = 500/10800 saniye)
    if (state.energy < 500) {
        state.energy += (500 / 10800);
    }
    
    state.lastUpdate = now;
    updateUI();
    save();
}

function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome;
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";
    
    // Enerji Geri Sayım
    let timer = document.getElementById('cooldown-timer');
    if (state.energy >= 500) {
        timer.innerText = "Enerji Dolu";
    } else {
        let remainingSeconds = Math.floor((500 - state.energy) / (500 / 10800));
        let h = Math.floor(remainingSeconds / 3600);
        let m = Math.floor((remainingSeconds % 3600) / 60);
        let s = remainingSeconds % 60;
        timer.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}

// TIKLAMA MEKANİĞİ
function handleTap(e) {
    if (state.energy >= 5) {
        state.balance += state.tapPower;
        state.energy -= 5;
        
        // Animasyon
        let p = document.createElement('div');
        p.className = 'plus-anim';
        p.innerText = "+" + state.tapPower;
        let x = e.clientX || (e.touches ? e.touches[0].clientX : window.innerWidth/2);
        let y = e.clientY || (e.touches ? e.touches[0].clientY : window.innerHeight/2);
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
        
        updateUI();
    }
}

// BORSA SİSTEMİ
function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = marketItems.map(item => {
        const isOwned = state.inventory.includes(item.id);
        return `
            <div class="card">
                <strong>${item.name}</strong>
                <small>+${item.income}/saat</small>
                <button class="btn-action" ${isOwned ? 'disabled' : ''} onclick="buyCard('${item.id}', ${item.price}, ${item.income})">
                    ${isOwned ? 'ALINDI' : item.price + ' KGn'}
                </button>
            </div>
        `;
    }).join('');
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

// ADSGRAM & GÖREVLER
async function watchAd(type) {
    if (typeof window.Adsgram === 'undefined') return alert("Reklam sistemi yükleniyor...");
    
    const AdController = window.Adsgram.init({ blockId: "23517" }); // Senin blok ID'n kalsın
    
    AdController.show().then(() => {
        handleAdReward(type);
    }).catch(() => {
        alert("Şu an reklam hazır değil, lütfen sonra deneyin.");
    });
}

function handleAdReward(type) {
    let now = Date.now();
    let t = state.tasks[type];

    if (type === 'gold') {
        state.balance += 100;
        t.count++;
        if (t.count >= 10) {
            t.cooldown = now + 86400000; // 24 saat
            t.count = 0;
        }
    } else if (type === 'click') {
        t.count++;
        if (t.count >= 2) {
            state.tapPower = 10;
            setTimeout(() => { state.tapPower = 5; }, 3600000); // 1 saatlik 2x
            t.hak--;
            t.count = 0;
            if (t.hak <= 0) {
                t.cooldown = now + 86400000; // 24 saat beklet
            }
        }
    } else if (type === 'energy') {
        t.count++;
        if (t.count >= 2) {
            state.energy = 500;
            t.hak--;
            t.count = 0;
            if (t.hak <= 0) {
                t.cooldown = now + 86400000;
            } else {
                t.cooldown = now + 600000; // 10 dakika bekleme
            }
        }
    }
    renderTasks();
    save();
    alert("Ödül Tanımlandı!");
}

function renderTasks() {
    const list = document.getElementById('task-list');
    const now = Date.now();
    
    const tasks = [
        { id: 'click', title: '2 Reklam: 2x Tık (1 Saat)', key: 'click' },
        { id: 'energy', title: '2 Reklam: Enerji Fulleyin', key: 'energy' },
        { id: 'gold', title: '10 Reklam: KGn Kazanın', key: 'gold' }
    ];

    list.innerHTML = tasks.map(task => {
        let t = state.tasks[task.key];
        let isWaiting = now < t.cooldown;
        let btnText = isWaiting ? "BEKLEYİN" : "İZLE (" + t.count + ")";
        
        return `
            <div class="card" style="width:100%; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div style="text-align:left"><strong>${task.title}</strong><small>Kalan Hak: ${t.hak || 'Sınırsız'}</small></div>
                <button class="btn-action" style="width:100px" ${isWaiting ? 'disabled' : ''} onclick="watchAd('${task.key}')">${btnText}</button>
            </div>
        `;
    }).join('');
}

// YARDIMCI FONKSİYONLAR
function showTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(el) el.classList.add('active');
}

function calculateOfflineEarnings() {
    let diff = (Date.now() - state.lastUpdate) / 1000;
    let earned = (state.hourlyIncome / 3600) * diff;
    state.balance += earned;
    state.energy = Math.min(500, state.energy + (diff * (500 / 10800)));
}

function saveUser() {
    let user = document.getElementById('username-input').value;
    if (user.length > 2) {
        state.username = user;
        document.getElementById('login-screen').style.display = 'none';
        init();
        save();
    }
}

function createParticles() {
    const cont = document.getElementById('particle-container');
    for(let i=0; i<50; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.width = Math.random() * 3 + 1 + 'px';
        p.style.height = p.style.width;
        p.style.animationDuration = (Math.random() * 5 + 5) + 's';
        cont.appendChild(p);
    }
}

function copyLink() {
    navigator.clipboard.writeText(document.getElementById('ref-link').innerText);
    alert("Davet linki kopyalandı!");
}

function save() { localStorage.setItem('kgn_v2026', JSON.stringify(state)); }

window.onload = init;
                 
