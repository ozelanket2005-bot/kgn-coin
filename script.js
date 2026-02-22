// Puanı yerel depolamadan çek veya 0'dan başlat
let puan = parseInt(localStorage.getItem('kgn_puan')) || 0;
const scoreElement = document.getElementById('score');
const coinElement = document.getElementById('coin');

// Sayfa açıldığında puanı yazdır
scoreElement.innerText = puan;

// Coin tıklama olayı
coinElement.addEventListener('click', () => {
    puan += 1;
    puanGuncelle();
});

// Reklam Kontrolcüsü Başlatma (Senin ID'n: 23508)
const AdController = window.Adsgram.init({ blockId: "23508" });

function izleVeKazan() {
    // Reklamı göster
    AdController.show().then((result) => {
        // Reklam başarıyla sonuna kadar izlendiğinde
        puan += 500;
        puanGuncelle();
        alert("Harika Efendim Kaan! 500 KGn hesabına eklendi.");
    }).catch((result) => {
        // Reklam yarıda kesilirse veya hata olursa
        console.error("Reklam hatası:", result);
        alert("Reklam tamamlanmadı. Ödül alabilmek için sonuna kadar izlemelisin.");
    });
}

// Puanı hem ekranda güncelle hem de kaydet
function puanGuncelle() {
    scoreElement.innerText = puan;
    localStorage.setItem('kgn_puan', puan);
}
