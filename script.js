// VERİ YÖNETİMİ
let state = {
    puan: parseInt(localStorage.getItem('kgn_puan')) || 0,
    energy: parseInt(localStorage.getItem('kgn_energy')) || 1000,
    hourlyIncome: parseInt(localStorage.getItem('kgn_income')) || 0,
    maxEnergy: 1000
};

// ADSGRAM BAŞLATMA
const AdController = window.Adsgram.init({ blockId: "23508" });

function updateUI() {
    document.getElementById('score').innerText = state.puan.toLocaleString();
    document.getElementById('current-energy').innerText = state.energy;
    document.getElementById('hourly-income').innerText = state.hourlyIncome;
    document.getElementById('energy-bar').style.width = (state.energy / state.maxEnergy * 100) + "%";
    
    localStorage.setItem('kgn_puan', state.puan);
    localStorage.setItem('kgn_energy', state.energy);
    localStorage.setItem('kgn_income', state.hourlyIncome);
}

// TIKLAMA VE PARLAMA EFEKTİ
function handleTap(event) {
    if (state.energy > 0) {
        state.puan += 1;
        state.energy -= 1;
        createParticle(event.clientX, event.clientY);
        updateUI();
    }
}

function createParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.width = Math.random() * 8 + 4 + 'px';
    p.style.height = p.style.width;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
}

// BORSA SİSTEMİ
function buyAsset(cost, income) {
    if (state.puan >= cost) {
        state.puan -= cost;
        state.hourlyIncome += income;
        updateUI();
        alert("Varlık satın alındı!");
    } else {
        alert("Yetersiz bakiye Efendim Kaan!");
    }
}

// GÖREV SİSTEMİ (REKLAM)
function izleVeKazan() {
    AdController.show().then(() => {
        state.puan += 500;
        updateUI();
        alert("Görev Tamamlandı: +500 KGn!");
    }).catch(() => alert("Reklam bitmedi."));
}

// SEKME YÖNETİMİ
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
    document.getElementById(tabId).classList.add('active-tab');
}

// SAATLİK KAZANÇ VE ENERJİ DOLUMU (Her Saniye)
setInterval(() => {
    // Enerji dolumu (Saniyede +1)
    if (state.energy < state.maxEnergy) {
        state.energy += 1;
    }
    // Saatlik kazancı saniyeye böl ve ekle
    if (state.hourlyIncome > 0) {
        state.puan += (state.hourlyIncome / 3600);
    }
    updateUI();
}, 1000);

updateUI();
            
