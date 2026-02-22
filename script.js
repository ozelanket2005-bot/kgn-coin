let puan = parseInt(localStorage.getItem('kgn_puan')) || 0;
const scoreElement = document.getElementById('score');
const coinElement = document.getElementById('coin');

// Başlangıç puanını göster
scoreElement.innerText = puan.toLocaleString();

// Tıklama Sistemi
coinElement.addEventListener('touchstart', (e) => {
    e.preventDefault();
    puan += 1;
    puanGuncelle();
    vibrate(10);
});

// Reklam Sistemi (Senin ID: 23508)
const AdController = window.Adsgram.init({ blockId: "23508" });

function izleVeKazan() {
    AdController.show().then((result) => {
        puan += 500;
        puanGuncelle();
        alert("Efendim Kaan, ödül hesabına geçti! +500 KGn");
    }).catch((result) => {
        alert("Reklam tamamlanamadı.");
    });
}

function puanGuncelle() {
    scoreElement.innerText = puan.toLocaleString();
    localStorage.setItem('kgn_puan', puan);
}

function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}
