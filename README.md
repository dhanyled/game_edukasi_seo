# Game Edukasi SEO

Panduan untuk mengunggah (upload) file proyek game dari komputer lokal (`D:\Dhany\Client\Game_ngodong\Google_game`) ke repository GitHub ini (`https://github.com/dhanyled/game_edukasi_seo`).

---

## 🚀 Cara Upload via Command Prompt (CMD) / Git Bash (Windows)

Buka **Command Prompt (CMD)** atau **Git Bash** di komputer Anda, lalu ikuti langkah-langkah berikut:

### 1. Masuk ke Folder Proyek Game
```cmd
cd /d D:\Dhany\Client\Game_ngodong\Google_game
```

### 2. Inisialisasi Git (Jika belum diinisialisasi)
```cmd
git init
```

### 3. Tambahkan Remote Repository GitHub
```cmd
git remote add origin https://github.com/dhanyled/game_edukasi_seo.git
```
> *Catatan: Jika remote origin sudah ada, Anda dapat memperbaruinya dengan:*
> `git remote set-url origin https://github.com/dhanyled/game_edukasi_seo.git`

### 4. Tambahkan Semua File dan Buat Commit
```cmd
git add .
git commit -m "Add game assets and source code"
```

### 5. Push File ke GitHub
Ubah nama branch ke `main` (jika diperlukan) dan lakukan push:
```cmd
git branch -M main
git push -u origin main
```

---

## 🖥️ Alternatif: Upload Menggunakan GitHub Desktop

1. Buka aplikasi **GitHub Desktop**.
2. Pilih menu **File** > **Add Local Repository...**.
3. Cari dan pilih folder `D:\Dhany\Client\Game_ngodong\Google_game`.
4. Pilih **Publish repository** atau hubungkan ke repository `dhanyled/game_edukasi_seo`.
5. Klik **Push origin** untuk mengunggah file.
