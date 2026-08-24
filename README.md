# Game Edukasi SEO (SEO Master) 🚀

**SEO Master** adalah aplikasi web simulasi game edukasi berbasis Bahasa Indonesia yang dirancang untuk membantu pemula, mahasiswa, dan pemilik bisnis memahami konsep **Search Engine Optimization (SEO)** secara interaktif dan menyenangkan.

Situs web ini disiapkan dan dioptimalkan untuk diunggah langsung ke **GitHub Pages** di repository:
`https://github.com/dhanyled/game_edukasi_seo`

---

## 🎮 Fitur Utama Game

Aplikasi ini mencakup 5 tahapan simulasi SEO yang mencakup pilar-pilar penting optimasi mesin pencari:

### 1. Riset Kata Kunci (Keyword Research) 🔍
- Pelajari cara memilih kata kunci berdasarkan **Search Volume**, **Keyword Difficulty (KD)**, dan **Search Intent**.
- Pilih 3 kata kunci terbaik untuk toko online *"Kopi Lokal Nusantara"*.

### 2. Optimasi On-Page SEO 📝
- Editor web interaktif untuk memperbaiki elemen **Title Tag**, **Meta Description**, **URL Slug**, **Tag H1**, dan **Alt Text Gambar**.
- Pratinjau tampilan live pada SERP Google beserta checklist audit instan.

### 3. Technical SEO & Performa Situs ⚙️
- Perbaiki masalah teknis seperti **Sertifikat SSL (HTTPS)**, **Kecepatan Pemuatan Halaman**, **Sitemap XML**, dan **Broken Link (Error 404)**.
- Lihat peningkatan *Health Score* situs secara real-time.

### 4. Off-Page SEO & Evaluasi Backlink 🔗
- Evaluasi tawaran kerjasama *backlink* masuk.
- Belajar membedakan backlink berkualitas (*High Domain Authority*) dengan link spam/PBN berbahaya.

### 5. Simulasi Peringkat Google SERP 🏆
- Jalankan algoritma mesin pencari untuk melihat estimasi posisi *ranking* situs Anda di halaman pertama Google beserta estimasi trafik pengunjung per bulan!

---

## 🔊 Fitur Tambahan
- **Efek Suara Synthesizer (Web Audio API)**: Memberikan umpan balik suara saat mengklik, berhasil menyelesaikan tahap, atau salah mengambil keputusan tanpa menggunakan file audio eksternal.
- **Penyimpanan Kemajuan (`localStorage`)**: Kemajuan belajar, skor XP, dan status level tersimpan secara otomatis di browser Anda.
- **Desain Responsif & Modern**: Tampilan bertema gelap (*Dark Mode*) yang nyaman diakses melalui PC, tablet, maupun HP.

---

## 📁 Struktur Direktori Project

```text
game_edukasi_seo/
├── index.html        # Struktur HTML utama game & layout dashboard
├── css/
│   └── style.css     # Styling CSS3 responsif, variabel tema, & komponen UI
├── js/
│   └── app.js        # Logika utama game, stage controller, sound engine, & state management
└── README.md         # Dokumentasi project dalam Bahasa Indonesia
```

---

## 🛠️ Cara Menjalankan Secara Lokal

1. Clone repository ini:
   ```bash
   git clone https://github.com/dhanyled/game_edukasi_seo.git
   cd game_edukasi_seo
   ```
2. Jalankan lokal HTTP server (pilih salah satu):
   - Gunakan Python 3:
     ```bash
     python3 -m http.server 8000
     ```
   - Atau gunakan ekstensi **Live Server** di VS Code.
3. Buka browser dan akses `http://localhost:8000`.

---

## 🌐 Cara Deploy ke GitHub Pages

1. Push seluruh kode ke repository GitHub `dhanyled/game_edukasi_seo`:
   ```bash
   git add .
   git commit -m "Initial commit Game Edukasi SEO"
   git push origin main
   ```
2. Masuk ke halaman Repository di GitHub: **Settings** > **Pages**.
3. Pada bagian **Source**, pilih branch `main` dan folder `/ (root)`.
4. Klik **Save**. Dalam beberapa menit, game Anda akan live di URL GitHub Pages (misal: `https://dhanyled.github.io/game_edukasi_seo/`).

---

## 📄 Lisensi & Kontribusi
Project ini bersifat open source dan dapat dikembangkan lebih lanjut untuk keperluan edukasi dan pembelajaran SEO.
