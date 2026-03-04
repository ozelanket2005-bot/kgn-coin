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
    tasks: { click: { count: 0, hak: 3, nextAvailable: 0 }, energy: { count: 0, hak: 3, nextAvailable: 0 }, gold: { count: 0, hak: 1, nextAvailable: 0 } }
};

const borsaKartlari = [ 
    { id: 'ym', name: 'Yazılım Mühendisi', price: 50000, income: 1000 }, 
    { id: 'gm', name: 'Görsel Mühendisi', price: 70000, income: 2000 }, 
    { id: 'uc', name: 'Uzman Çalışan', price: 60000, income: 1500 }, 
    { id: 'p1', name: 'Patron 1', price: 5000, income: 250 }, 
    { id: 'p2', name: 'Patron 2', price: 25000, income: 500 }, 
    { id: 'p3', name: 'Patron 3', price: 40000, income: 1000 } 
];

const dailyRewards = [ 
    { d: 1, prize: "50 KGn", val: 50, type: "gold" }, 
    { d: 2, prize: "150 KGn", val: 150, type: "gold" }, 
    { d: 3, prize: "1 Saat 2x Tık", val: 10, type: "mult" }, 
    { d: 4, prize: "250 KGn", val: 250, type: "gold" }, 
    { d: 5, prize: "500 KGn", val: 500, type: "gold" }, 
    { d: 6, prize: "1000 KGn", val: 1000, type: "gold" }, 
    { d: 7, prize: "Full Enerji", val: 500, type: "energy" } 
];

function init() {
    if (!state.username) document.getElementById('login-screen').style.display = 'flex';
    else {
        document.getElementById('display-name').innerText = "Hoş geldin, " + state.username + " 👋";
        const botUsername = "KGn_coin_bot"; 
        document.getElementById('ref-link-display').innerText = "https://t.me/" + botUsername + "?start=" + state.userId;
        checkDailyRewardReset();
        loadFriends();
    }
    renderMarket(); renderTasks(); createParticles(); renderRewardGrid();
    setInterval(tick, 1000);
}

function checkDailyRewardReset() {
    let simdi = Date.now();
    if (state.lastRewardClaim > 0 && (simdi - state.lastRewardClaim > 172800000)) { state.rewardDay = 1; save(); }
}

function tick() {
    let incomePerSec = (state.hourlyIncome / 3600);
    state.balance += incomePerSec; state.totalCollected += incomePerSec;
    if (state.energy < 500) state.energy += (500 / 10800);
    updateUI(); save();
}

function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome + " KGn";
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";
    document.getElementById('level-display').innerText = "Seviye " + calculateLevel();
}

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active'); el.classList.add('active');

    // SADECE OYUN SEKEMESİNDE PANELİ GÖSTER
    const gamePanel = document.getElementById('only-game-header');
    if (tabId === 'game-tab') {
        gamePanel.style.display = 'block';
    } else {
        gamePanel.style.display = 'none';
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

function claimDailyReward() {
    let now = Date.now();
    if (now - state.lastRewardClaim < 86400000) { alert("Bugünkü ödülünüzü zaten aldınız!"); return; }
    let current = dailyRewards[state.rewardDay - 1];
    if (current.type === "gold") { state.balance += current.val; state.totalCollected += current.val; } 
    else if (current.type === "mult") { state.tapPower = 10; setTimeout(() => { state.tapPower = 5; save(); }, 3600000); } 
    else if (current.type === "energy") { state.energy = 500; }
    state.lastRewardClaim = now; state.rewardDay++; if (state.rewardDay > 7) state.rewardDay = 1;
    save(); updateUI(); renderRewardGrid(); alert(current.prize + " kazandınız!");
}

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = borsaKartlari.map(k => {
        let isOwned = state.inventory.includes(k.id);
        return `<div class="market-card"><div style="font-size:12px; height:40px"><strong>${k.name}</strong></div><div style="color:#ffd700; font-size:11px; margin:5px 0">+${k.income}/saat</div><button class="task-go-btn" style="font-size:10px; padding:5px" ${isOwned ? 'disabled' : ''} onclick="buyCard('${k.id}', ${k.price}, ${k.income})">${isOwned ? 'ALINDI' : k.price + ' KGn'}</button></div>`;
    }).join('');
}

function loadFriends() {
    const container = document.getElementById('friend-list-container');
    if(window.db) {
        db.collection("users").where("invitedBy", "==", state.userId).onSnapshot((snapshot) => {
            document.getElementById('friend-count').innerText = snapshot.size;
            container.innerHTML = snapshot.docs.map(doc => {
                const f = doc.data();
                return `<div class="friend-item"><div><strong>${f.username}</strong></div><div style="color:#ffd700; font-weight:bold">${Math.floor(f.balance).toLocaleString()} KGn</div></div>`;
            }).join('');
        });
    }
}

function calculateLevel() {
    let tc = state.totalCollected;
    if (tc < 100000) return 1; if (tc < 350000) return 2; if (tc < 450000) return 3; if (tc < 550000) return 4; if (tc < 650000) return 5;
    return 6;
}

function saveUsername() {
    let input = document.getElementById('username-input').value;
    if (input.trim().length > 2) { state.username = input; document.getElementById('login-screen').style.display = 'none'; init(); save(); }
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

function copyRefLink() { const link = document.getElementById('ref-link-display').innerText; navigator.clipboard.writeText(link).then(() => { alert("Davet linki kopyalandı!"); }); }
function buyCard(id, price, income) { if (state.balance >= price) { state.balance -= price; state.hourlyIncome += income; state.inventory.push(id); renderMarket(); save(); } else alert("Yetersiz bakiye!"); }
function createParticles() { const cont = document.getElementById('particle-container'); cont.innerHTML = ''; for(let i=0; i<80; i++) { let p = document.createElement('div'); p.className = 'particle'; p.style.left = Math.random()*100+'vw'; p.style.top = Math.random()*100+'vh'; p.style.width = Math.random()*3+1+'px'; p.style.height = p.style.width; p.style.animationDuration = (Math.random()*3+3)+'s'; p.style.animationDelay = (Math.random()*5)+'s'; cont.appendChild(p); } }
function save() { state.lastUpdate = Date.now(); localStorage.setItem('kgn_coin_v50', JSON.stringify(state)); }
window.onload = init;
        
