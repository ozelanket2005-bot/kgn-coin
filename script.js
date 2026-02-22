let balance = 0;
let energy = 500;
const maxEnergy = 500;
const kgnPerClick = 5; // Her tıklamada 5 KGn
const energyCost = 5; // Her tıklamada 5 enerji azalır

const balanceElement = document.getElementById('balance');
const energyText = document.getElementById('energy-text');
const energyFill = document.getElementById('energy-fill');
const coinButton = document.getElementById('kgn-chip');

// Tıklama Fonksiyonu
coinButton.addEventListener('click', (e) => {
    if (energy >= energyCost) {
        // Kazanç ve Enerji Azalması
        balance += kgnPerClick;
        energy -= energyCost;

        // Ekranı Güncelle
        updateUI();

        // Tıklama Efekti (Opsiyonel: +5 yazısı uçsun istersen)
        showClickAnimation(e);
    } else {
        alert("Enerjin bitti Efendim Kaan! Biraz dinlenmelisin.");
    }
});

function updateUI() {
    balanceElement.textContent = balance.toLocaleString(); // Bakiyeyi formatlı yazar
    energyText.textContent = `${energy}/${maxEnergy}`;
    
    // Enerji barını güncelle
    const energyPercentage = (energy / maxEnergy) * 100;
    energyFill.style.width = `${energyPercentage}%`;
}

// Enerji Yenileme (Saniyede 1 enerji dolar)
setInterval(() => {
    if (energy < maxEnergy) {
        energy++;
        updateUI();
    }
}, 1000);

function showClickAnimation(e) {
    const text = document.createElement('div');
    text.textContent = `+${kgnPerClick}`;
    text.style.position = 'absolute';
    text.style.left = `${e.pageX}px`;
    text.style.top = `${e.pageY}px`;
    text.style.color = '#f3ba2f';
    text.style.fontWeight = 'bold';
    text.style.fontSize = '24px';
    text.style.pointerEvents = 'none';
    text.style.animation = 'floatUp 0.8s ease-out forwards';
    
    document.body.appendChild(text);
    
    setTimeout(() => {
        text.remove();
    }, 800);
}

// Float Animasyonu için CSS (Eğer style.css'e eklemediysen)
const style = document.createElement('style');
style.innerHTML = `
@keyframes floatUp {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-100px); opacity: 0; }
}
`;
document.head.appendChild(style);

// İlk açılışta UI güncelle
updateUI();
        
