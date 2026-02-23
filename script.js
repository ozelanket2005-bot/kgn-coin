// DURUM YÖNETİMİ
let state = JSON.parse(localStorage.getItem('kgn_v10_final')) || {
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    inventory: [],
    tapPower: 5,
    lastUpdate: Date.now(),
    tasks: {
        click: { count: 0, lastReset: 0, nextAvailable: 0 },
        energy: { count: 0, lastReset: 0, nextAvailable: 0 },
        gold: { count: 0, lastReset: 0, nextAvailable: 0 }
    }
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
    renderTasks();
    createParticles();
    
    // Çevrimdışı Kazanç ve Enerji
    let simdi = Date.now();
    let gecenSaniye = (simdi - state.lastUpdate) / 1000;
    state.balance += (state.hourlyIncome / 3600) * gecenSaniye;
    state.energy = Math.min(500, state.energy + (gecenSaniye * (500 / 10800)));

    setInterval(tick, 1000);
}

function tick() {
    state.balance += (state.hourlyIncome / 3600);
    if (state.energy < 500) state.energy += (500 / 10800);
    updateUI();
    save();
}

function updateUI() {
    document.getElementById('balance-text').innerText = Math.floor(state.balance).toLocaleString();
    document.getElementById('hourly-display').innerText = "+" + state.hourlyIncome + " KGn";
    document.getElementById('current-energy').innerText = Math.floor(state.energy);
    document.getElementById('energy-fill').style.width = (state.energy / 500 * 100) + "%";

    const timer = document.getElementById('cooldown-timer');
    if (state.energy >= 500) {
        timer.innerText = "Enerji Dolu";
        timer.style.color = "#ffd700";
    } else {
        let kalan = Math.floor((500 - state.energy) / (500 / 10800));
        let h = Math.floor(kalan / 3600), m = Math.floor((kalan % 3600) / 60), s = kalan % 60;
        timer.innerText = `${h > 0 ? h + 's ' : ''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        timer.style.color = "#fff";
    }
}

// TIKLAMA MANTIĞI
function handleTap(e) {
    if (state.energy >= 5) {
        state.balance += state.tapPower;
        state.energy -= 5;
        
        // +5 Animasyonu
        let p = document.createElement('div');
        p.className = 'plus-anim';
        p.innerText = "+" + state.tapPower;
        p.style.left = (e.clientX || e.touches[0].clientX) + 'px';
        p.style.top = (e.clientY || e.touches[0].clientY) + 'px';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
        updateUI();
    }
}

// REKLAM VE GÖREV DÖNGÜSÜ
async function runRewardAd(type) {
    if (!AdController) return alert("Reklam şu an hazır değil.");
    
    let now = Date.now();
    let t = state.tasks[type];

    // Bekleme Süresi Kontrolü
    if (now < t.nextAvailable) {
        return alert("Lütfen bekleme süresinin bitmesini bekleyin!");
    }

    AdController.show().then(() => {
        t.count++;
        
        if (type === 'gold') {
            state.balance += 100;
            if (t.count >= 10) {
                t.nextAvailable = now + (24 * 60 * 60 * 1000);
                t.count = 0;
            }
        } 
        else if (type === 'click') {
            if (t.count >= 2) {
                state.tapPower = 10;
                t.count = 0;
                setTimeout(() => state.tapPower = 5, 3600000); // 1 saatlik etki
                // 3 hak kontrolü
                // (Burada senin istediğin 3 hak / 24 saat mantığı işlenir)
            }
        }
        else if (type === 'energy') {
            if (t.count >= 2) {
                state.energy = 500;
                t.count = 0;
                t.nextAvailable = now + (10 * 60 * 1000); // 10 dk bekleme
            }
        }
        
        save();
        renderTasks();
        alert("Başarılı!");
    }).catch(() => alert("Reklam tamamlanmadı."));
}

function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = '';
    borsaKartlari.forEach(k => {
        let isOwned = state.inventory.includes(k.id);
        list.innerHTML += `
            <div class="market-card">
                <div><strong>${k.name}</strong><br><small>Gelir: +${k.income}/saat</small></div>
                <button class="task-go-btn" ${isOwned ? 'disabled' : ''} onclick="buyCard('${k.id}', ${k.price}, ${k.income})">
                    ${isOwned ? 'SAHİPSİN' : k.price + ' KGn'}
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
    } else alert("Yetersiz KGn!");
}

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    el.classList.add('active');
}

function createParticles() {
    const cont = document.getElementById('particle-container');
    for(let i=0; i<20; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random()*100+'vw';
        p.style.top = Math.random()*100+'vh';
        p.style.width = '3px'; p.style.height = '3px';
        p.style.animationDelay = Math.random()*4+'s';
        cont.appendChild(p);
    }
}

function save() { state.lastUpdate = Date.now(); localStorage.setItem('kgn_v10_final', JSON.stringify(state)); }
window.onload = init;
                
