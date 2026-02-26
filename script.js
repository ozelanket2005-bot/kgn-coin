let state = JSON.parse(localStorage.getItem('kgn_coin_v50')) || {
    username: null,
    userId: Math.floor(100000 + Math.random() * 900000),
    balance: 0,
    totalCollected: 0,
    hourlyIncome: 0,
    energy: 500,
    inventory: [],
    tapPower: 5,
    lastUpdate: Date.now(),
    lastRewardClaim: 0,
    rewardDay: 1,
    tasks: {
        click: { count: 0, hak: 3, nextAvailable: 0 },
        energy: { count: 0, hak: 3, nextAvailable: 0 },
        gold: { count: 0, hak: 1, nextAvailable: 0 }
    }
};

const borsaKartlari = [ 
    { id: 'ym', name: 'Yazılım Mühendisi', price: 10000, income: 1000 }, 
    { id: 'gm', name: 'Görsel Mühendisi', price: 10000, income: 1000 }, 
    { id: 'uc', name: 'Uzman Çalışan', price: 10000, income: 1000 }, 
    { id: 'p1', name: 'Patron 1', price: 2000, income: 250 }, 
    { id: 'p2', name: 'Patron 2', price: 4000, income: 500 }, 
    { id: 'p3', name: 'Patron 3', price: 6000, income: 1000 } 
];

const dailyRewards = [ 
    { d: 1, prize: "50 KGn", val: 50, type: "gold" }, 
    { d: 2, prize: "150 KGn", val: 150, type: "gold" }, 
    { d: 3, prize: "2x Tık", val: 2, type: "mult" }, 
    { d: 4, prize: "250 KGn", val: 250, type: "gold" }, 
    { d: 5, prize: "500 KGn", val: 500, type: "gold" }, 
    { d: 6, prize: "1000 KGn", val: 1000, type: "gold" }, 
    { d: 7, prize: "Full Enerji", val: 500, type: "energy" } 
];

function init() {
    if (!state.username) document.getElementById('login-screen').style.display = 'flex';
    else {
        document.getElementById('display-name').innerText = "Hoş geldin, " + state.username + " 👋";
        // HATALI LİNK BURADA DÜZELTİLDİ: Küçük harf kullanımı ve standart t.me formatı
        document.getElementById('ref-link-display').innerText = "https://t.me/kgncoinbot?start=" + state.userId;
        loadFriends();
    }

    renderMarket();
    renderTasks();
    createParticles();
    renderRewardGrid();
    
    let simdi = Date.now();
    let gecenSaniye = (simdi - state.lastUpdate) / 1000;
    let earned = (state.hourlyIncome / 3600) * gecenSaniye;
    state.balance += earned;
    state.totalCollected += earned;
    state.energy = Math.min(500, state.energy + (gecenSaniye * (500 / 10800)));

    setInterval(tick, 1000);
}

function loadFriends() {
    const container = document.getElementById('friend-list-container');
    const countDisplay = document.getElementById('friend-count');

    if(window.db) {
        db.collection("users").where("invitedBy", "==", state.userId)
        .onSnapshot((querySnapshot) => {
            let friends = [];
            querySnapshot.forEach((doc) => {
                friends.push(doc.data());
            });
            
            countDisplay.innerText = friends.length;
            if(friends.length > 0) {
                container.innerHTML = friends.map(f => `
                    <div class="friend-item">
                        <div>
                            <strong style="color: white;">${f.username}</strong><br>
                            <small style="color: #aaa;">Seviye ${f.level || 1}</small>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: #ffd700; font-weight: bold;">${Math.floor(f.balance).toLocaleString()}</span>
                            <small style="color: #ffd700;"> KGn</small>
                        </div>
                    </div>
                `).join('');
            }
        });
    }
}

function calculateLevel() {
    let tc = state.totalCollected;
    if (tc < 100000) return 1; if (tc < 350000) return 2; if (tc < 450000) return 3; if (tc < 550000) return 4; if (tc < 650000) return 5; if (tc < 750000) return 6; if (tc < 850000) return 7; if (tc < 950000) return 8; if (tc < 1000000) return 9;
    let level = 10; let base = 1000000;
    for (let i = 11; i <= 20; i++) { base += 200000; if (tc < base) return level; level = i; }
    return 20;
}

function tick() {
    let incomePerSec = (state.hourlyIncome / 3600);
    state.balance += incomePerSec;
    state.totalCollected += incomePerSec;
    if (state.energy < 500) state.energy += (500 / 10800);
    updateUI();
    save();
}

function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome + " KGn";
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";
    document.getElementById('level-display').innerText = "Seviye " + calculateLevel();
    const timer = document.getElementById('cooldown-timer');
    if (state.energy >= 500) timer.innerText = "Enerji Dolu";
    else {
        let kalan = Math.floor((500 - state.energy) / (500 / 10800));
        let h = Math.floor(kalan / 3600), m = Math.floor((kalan % 3600) / 60), s = kalan % 60;
        timer.innerText = `${h > 0 ? h + 's ' : ''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
}

function handleTap(e) {
    if (state.energy >= 5) {
        state.balance += state.tapPower; state.totalCollected += state.tapPower; state.energy -= 5;
        let p = document.createElement('div'); p.className = 'plus-anim'; p.innerText = "+" + state.tapPower;
        let x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        let y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
        p.style.left = x + 'px'; p.style.top = y + 'px';
        document.body.appendChild(p); setTimeout(() => p.remove(), 800);
        updateUI();
    }
}

function saveUsername() {
    let input = document.getElementById('username-input').value;
    if (input.trim().length > 2) {
        state.username = input;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('display-name').innerText = "Hoş geldin, " + state.username + " 👋";
        document.getElementById('ref-link-display').innerText = "https://t.me/kgncoinbot?start=" + state.userId;
        save();
    }
}

function createParticles() {
    const cont = document.getElementById('particle-container');
    cont.innerHTML = ''; 
    for(let i=0; i<80; i++) {
        let p = document.createElement('div'); p.className = 'particle';
        p.style.left = Math.random()*100+'vw'; p.style.top = Math.random()*100+'vh';
        p.style.width = Math.random()*3+1+'px'; p.style.height = p.style.width;
        p.style.animationDuration = (Math.random()*3+3)+'s';
        p.style.animationDelay = (Math.random()*5)+'s';
        cont.appendChild(p);
    }
}

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = borsaKartlari.map(k => {
        let isOwned = state.inventory.includes(k.id);
        return `<div class="market-card"><div><strong>${k.name}</strong><br><small>Gelir: +${k.income}/saat</small></div><button class="task-go-btn" ${isOwned ? 'disabled' : ''} onclick="buyCard('${k.id}', ${k.price}, ${k.income})">${isOwned ? 'ALINDI' : k.price + ' KGn'}</button></div>`;
    }).join('');
}

function buyCard(id, price, income) {
    if (state.balance >= price) {
        state.balance -= price; state.hourlyIncome += income; state.inventory.push(id);
        renderMarket(); save();
    } else alert("Yetersiz bakiye!");
}

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active'); el.classList.add('active');
}

async function runRewardAd(type) {
    if (typeof window.Adsgram === 'undefined') return alert("Sistem yükleniyor...");
    const AdController = window.Adsgram.init({ blockId: "23517" });
    AdController.show().then(() => {
        let now = Date.now(); let t = state.tasks[type];
        if (type === 'gold') { state.balance += 100; state.totalCollected += 100; t.count++; if (t.count >= 10) { t.hak--; t.count = 0; if (t.hak <= 0) { t.nextAvailable = now + (24*60*60*1000); t.hak = 1; } } }
        else if (type === 'click') { t.count++; if (t.count >= 2) { state.tapPower = 10; t.count = 0; t.hak--; setTimeout(() => { state.tapPower = 5; }, 3600000); if (t.hak <= 0) { t.nextAvailable = now + (24*60*60*1000); t.hak = 3; } } }
        else if (type === 'energy') { t.count++; if (t.count >= 2) { state.energy = 500; t.count = 0; t.hak--; if (t.hak <= 0) { t.nextAvailable = now + (24*60*60*1000); t.hak = 3; } else { t.nextAvailable = now + (10*60*1000); } } }
        save(); renderTasks(); alert("Başarılı!");
    }).catch(() => { alert("Reklam hazır değil."); });
}

function renderTasks() {
    const list = document.getElementById('task-list');
    const tasksHTML = [ { id: 'gold', title: '10 Reklam İzle', desc: 'Reklam başı 100 KGn', cooldown: state.tasks.gold.nextAvailable }, { id: 'click', title: '2 Reklam İzle', desc: '1 Saat 2x Tık', cooldown: state.tasks.click.nextAvailable }, { id: 'energy', title: '2 Reklam İzle', desc: 'Enerji Yeniler', cooldown: state.tasks.energy.nextAvailable } ];
    list.innerHTML = tasksHTML.map(t => { let isWaiting = Date.now() < t.cooldown; return `<div class="task-card"><div><strong>${t.title}</strong><br><small>${t.desc}</small></div><button class="task-go-btn" ${isWaiting ? 'disabled' : ''} onclick="runRewardAd('${t.id}')">${isWaiting ? "BEKLE" : "İZLE"}</button></div>`; }).join('');
}

function renderRewardGrid() {
    const grid = document.getElementById('reward-days-list');
    grid.innerHTML = dailyRewards.map(r => `<div class="reward-day ${state.rewardDay == r.d ? 'active' : ''}"><b>Gün ${r.d}</b><br>${r.prize}</div>`).join('');
}

function claimDailyReward() {
    let now = Date.now(); if (now - state.lastRewardClaim < 86400000) { alert("Zaten aldınız."); return; }
    let current = dailyRewards[state.rewardDay - 1]; if (current.type === "gold") { state.balance += current.val; state.totalCollected += current.val; } else if (current.type === "mult") { state.tapPower = 10; } else if (current.type === "energy") { if (state.energy >= 500) { alert("Enerji dolu!"); return; } state.energy = 500; }
    state.lastRewardClaim = now; state.rewardDay++; if (state.rewardDay > 7) state.rewardDay = 1;
    save(); updateUI(); renderRewardGrid(); alert(current.prize + " kazanıldı!");
}

function copyRefLink() {
    const link = document.getElementById('ref-link-display').innerText;
    navigator.clipboard.writeText(link).then(() => { alert("Davet linki kopyalandı!"); });
}

function save() { state.lastUpdate = Date.now(); localStorage.setItem('kgn_coin_v50', JSON.stringify(state)); }
window.onload = init;
        
