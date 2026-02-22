// SİSTEM AYARLARI VE KAYITLAR
let data = JSON.parse(localStorage.getItem('kgn_v3')) || {
    balance: 0,
    hourlyIncome: 0,
    energy: 500,
    maxEnergy: 500,
    tapPower: 5,
    lastUpdate: Date.now(),
    inventory: [],
    tasks: {
        click: { count: 0, rights: 3, lastReset: 0 },
        energy: { count: 0, rights: 3, lastReset: 0, cooldown: 0 },
        gold: { count: 0, lastReset: 0 }
    }
};

const AdController = window.Adsgram.init({ blockId: "23508" });

// MARKET KARTLARI
const cards = [
    { id: 'sw', name: 'Yazılım Mühendisi', price: 5000, income: 1000 },
    { id: 've', name: 'Görsel Mühendisi', price: 5000, income: 1000 },
    { id: 'ex', name: 'Uzman Çalışan', price: 5000, income: 1000 },
    { id: 'p1', name: 'Patron 1', price: 1000, income: 250 },
    { id: 'p2', name: 'Patron 2', price: 2000, income: 500 },
    { id: 'p3', name: 'Patron 3', price: 3000, income: 1000 }
];

// BAŞLATMA
function init() {
    renderMarket();
    updateDisplay();
    startLoops();
}

function updateDisplay() {
    document.getElementById('total-balance').innerText = Math.floor(data.balance).toLocaleString();
    document.getElementById('p-hour').innerText = data.hourlyIncome;
    document.getElementById('e-current').innerText = Math.floor(data.energy);
    document.getElementById('energy-fill').style.width = (data.energy / data.maxEnergy * 100) + "%";
}

// TIKLAMA FONKSİYONU
function tapAction(e) {
    if (data.energy >= data.tapPower) {
        data.balance += data.tapPower;
        data.energy -= data.tapPower;
        showTapAnim(e);
        updateDisplay();
    }
}

function showTapAnim(e) {
    const plus = document.createElement('div');
    plus.className = 'tap-plus';
    plus.innerText = "+" + data.tapPower;
    plus.style.left = e.clientX + 'px';
    plus.style.top = e.clientY + 'px';
    document.body.appendChild(plus);
    setTimeout(() => plus.remove(), 800);
}

// MARKET İŞLEMLERİ
function renderMarket() {
    const list = document.getElementById('market-list');
    list.innerHTML = '';
    cards.forEach(c => {
        const owned = data.inventory.includes(c.id);
        list.innerHTML += `
            <div class="card">
                <div class="card-info">
                    <h4>${c.name}</h4>
                    <small>+${c.income} KGn/saat</small>
                </div>
                <button class="buy-btn ${owned ? '' : 'active'}" onclick="buyCard('${c.id}', ${c.price}, ${c.income})">
                    ${owned ? 'ALINDI' : c.price + ' KGn'}
                </button>
            </div>`;
    });
}

function buyCard(id, price, income) {
    if (!data.inventory.includes(id) && data.balance >= price) {
        data.balance -= price;
        data.hourlyIncome += income;
        data.inventory.push(id);
        renderMarket();
        updateDisplay();
        save();
    }
}

// GÖREV SİSTEMİ (ADSGRAM ENTEGRELİ)
function startTask(type) {
    const now = Date.now();
    const task = data.tasks[type];

    // 24 Saatlik Kontrol
    if (task.lastReset && now - task.lastReset < 86400000 && task.rights === 0) {
        alert("24 saatlik bekleme süresindesiniz!");
        return;
    }

    AdController.show().then(() => {
        task.count++;
        
        if (type === 'click' && task.count >= 2) {
            data.tapPower *= 2;
            task.count = 0;
            task.rights--;
            setTimeout(() => { data.tapPower /= 2; }, 3600000); // 1 saatlik boost
            alert("Tıklama gücü 2 katına çıktı!");
        } 
        else if (type === 'energy' && task.count >= 2) {
            data.energy = data.maxEnergy;
            task.count = 0;
            task.rights--;
            // 10 dk cooldown başlat
            task.cooldown = now + 600000;
            alert("Enerji Fullendi! 10 dk bekleme süresi başladı.");
        }
        else if (type === 'gold' && task.count >= 10) {
            data.balance += 1000;
            task.count = 0;
            task.lastReset = now; // 24 saati başlat
            alert("1000 KGn kazandın!");
        }

        if (task.rights === 0 && !task.lastReset) task.lastReset = now;
        save();
        updateDisplay();
    });
}

// DÖNGÜLER (ENERJİ VE SAATLİK KAZANÇ)
function startLoops() {
    setInterval(() => {
        const now = Date.now();
        
        // Pasif Kazanç (Saniyelik ekleme)
        if (data.hourlyIncome > 0) {
            data.balance += (data.hourlyIncome / 3600);
        }

        // Enerji Dolumu (3 saatte full = 10800 saniye. 500 / 10800 = 0.046 saniyede)
        if (data.energy < data.maxEnergy) {
            data.energy += (data.maxEnergy / 10800);
            updateEnergyTimer();
        }

        updateDisplay();
        save();
    }, 1000);
}

function updateEnergyTimer() {
    const remaining = Math.max(0, (data.maxEnergy - data.energy) * (10800 / data.maxEnergy));
    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    document.getElementById('e-timer').innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// YARDIMCI FONKSİYONLAR
function showTab(id, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active-tab');
    el.classList.add('active');
}

function save() {
    localStorage.setItem('kgn_v3', JSON.stringify(data));
}

window.onload = init;
                        
