# Orbitly — Landing Page + PWA Premium (Vanilla HTML/CSS/JS)

Website siap pakai bertema startup 2026: landing page premium, dashboard demo,
autentikasi lokal (localStorage), dan Progressive Web App penuh (offline mode
+ bisa diinstal). Tanpa framework, tanpa backend berbayar.

## ⚠️ Baca dulu — batasan yang jujur

Sebelum kamu jual ini ke klien, pahami batasannya supaya tidak salah janji:

- **Login/Register di sini adalah demo**, bukan sistem autentikasi production.
  Data akun disimpan di `localStorage` browser pengunjung (di-hash SHA-256,
  tapi tetap di sisi klien, bisa dihapus/direset kapan saja, dan tidak
  tersinkron antar perangkat). Cocok untuk prototipe, demo produk, atau
  portofolio — **tidak cocok** untuk menyimpan data pengguna sungguhan.
- **Formulir kontak** menyimpan pesan ke `localStorage`, bukan mengirim email.
  Untuk kontak sungguhan, sambungkan ke layanan gratis seperti Formspree,
  Web3Forms, atau EmailJS (tinggal ganti bagian `fetch` di `script.js`).
- **Statistik & chart** di dashboard memakai data contoh/simulasi, bukan data
  real-time dari server.
- Kalau klien butuh akun pengguna sungguhan (banyak pengguna, lintas
  perangkat, aman), kamu tetap butuh backend (mis. Firebase Auth + Firestore
  — keduanya punya tingkat gratis yang layak untuk proyek kecil).

## Struktur Folder

```
orbitly/
├── index.html          → Landing page (hero, fitur, harga, testimoni, blog, FAQ, kontak)
├── auth.html            → Login & Register (demo, localStorage)
├── dashboard.html        → Dashboard (tugas, profil, pengaturan, statistik)
├── 404.html              → Halaman error 404
├── offline.html           → Halaman fallback saat offline & belum pernah dibuka
├── style.css             → Semua styling (design system, dark/light, animasi)
├── script.js             → Semua interaksi & logika (vanilla JS, modular)
├── manifest.json          → Konfigurasi PWA
├── service-worker.js       → Caching & offline mode
├── robots.txt             → Instruksi crawler SEO
├── sitemap.xml             → Peta situs SEO
├── favicon.ico
└── assets/
    ├── icons/            → Ikon PWA (192, 512, maskable, apple-touch, favicon)
    └── images/            → Gambar Open Graph untuk preview share
```

---

## 1. Cara Menjalankan di Komputer

Browser modern memblokir beberapa fitur (Service Worker, modul) saat file
dibuka langsung lewat `file://`. Jalankan lewat server lokal sederhana:

**Opsi A — Python (biasanya sudah terpasang):**
```bash
cd orbitly
python3 -m http.server 8080
```
Buka `http://localhost:8080` di browser.

**Opsi B — Node.js:**
```bash
npx serve orbitly -l 8080
```

**Opsi C — Ekstensi VS Code:**
Install ekstensi "Live Server", klik kanan `index.html` → "Open with Live Server".

## 2. Cara Menjalankan di HP Android

1. Upload folder `orbitly` dulu ke hosting gratis (lihat bagian 4–7 di bawah),
   atau
2. Pakai aplikasi **Termux** di Android untuk menjalankan server lokal:
   ```bash
   pkg install python
   cd orbitly
   python -m http.server 8080
   ```
   Lalu buka `http://localhost:8080` di Chrome Android.
3. Setelah online di hosting, buka linknya di Chrome Android → menu titik
   tiga → **"Tambahkan ke layar utama"** untuk menginstalnya sebagai app (PWA).

## 3. Cara Upload ke GitHub

1. Buat akun di [github.com](https://github.com) (gratis).
2. Klik **New repository** → beri nama, mis. `orbitly-web` → Create.
3. Di komputer, dalam folder `orbitly`:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Orbitly website"
   git branch -M main
   git remote add origin https://github.com/USERNAME/orbitly-web.git
   git push -u origin main
   ```
   (Ganti `USERNAME` dengan username GitHub-mu.)

## 4. Cara Upload ke GitHub Pages (Gratis)

1. Di repo GitHub-mu → **Settings** → **Pages**.
2. Source: pilih branch `main`, folder `/root` → **Save**.
3. Tunggu 1–2 menit. Situsmu akan online di:
   `https://USERNAME.github.io/orbitly-web/`
4. **Penting:** karena situs berada di sub-folder (bukan domain root), buka
   `manifest.json`, `index.html`, dll., dan ganti semua path yang diawali `/`
   (misalnya `/style.css`) menjadi path relatif (`style.css`,
   `assets/icons/...`, `service-worker.js`). Ini satu-satunya penyesuaian
   yang dibutuhkan khusus untuk GitHub Pages di sub-folder.

## 5. Cara Upload ke Netlify (Gratis)

1. Buat akun di [netlify.com](https://netlify.com), login pakai GitHub.
2. **Add new site → Import an existing project** → pilih repo `orbitly-web`.
3. Build command: kosongkan. Publish directory: `.` (folder root).
4. Klik **Deploy**. Situs online dalam < 1 menit dengan domain gratis
   `namamu.netlify.app`.
5. Update selanjutnya otomatis setiap kali kamu `git push`.

## 6. Cara Upload ke Cloudflare Pages (Gratis)

1. Buat akun di [pages.cloudflare.com](https://pages.cloudflare.com).
2. **Create a project → Connect to Git** → pilih repo `orbitly-web`.
3. Build command: kosongkan. Build output directory: `/`.
4. Klik **Save and Deploy**. Domain gratis: `namamu.pages.dev`.

## 7. Cara Upload ke Vercel (Gratis)

1. Buat akun di [vercel.com](https://vercel.com), login pakai GitHub.
2. **Add New → Project** → import repo `orbitly-web`.
3. Framework preset: pilih **Other**. Biarkan build command kosong.
4. Klik **Deploy**. Domain gratis: `namamu.vercel.app`.

## 8. Cara Menghubungkan Domain Gratis

- Domain gratis (opsional): layanan seperti **Freenom** sudah tidak stabil;
  alternatif yang lebih realistis adalah subdomain gratis dari hosting di
  atas (`.netlify.app`, `.pages.dev`, `.vercel.app`, `.github.io`) — ini
  sudah cukup profesional untuk portofolio dan penjualan jasa.
- Kalau ingin domain sungguhan (`.com`, `.id`, dst), beli di Namecheap/
  Niagahoster, lalu di dashboard hosting (Netlify/Vercel/Cloudflare) buka
  **Domain Settings → Add custom domain** dan ikuti instruksi DNS yang
  diberikan (biasanya tinggal tambah record CNAME/A).

## 9. Cara Update Website Setelah Online

```bash
# edit file yang perlu diubah, lalu:
git add .
git commit -m "Update: deskripsi perubahan"
git push
```
Netlify/Vercel/Cloudflare Pages otomatis build ulang dan online dalam
hitungan detik–menit. Untuk GitHub Pages, tunggu 1–2 menit setelah push.

**Penting untuk PWA:** setiap kali kamu ubah `style.css` atau `script.js`,
naikkan angka `CACHE_VERSION` di baris atas `service-worker.js` (misalnya
dari `orbitly-v1.0.0` jadi `orbitly-v1.0.1`). Jika tidak, pengguna yang
sudah pernah membuka situs bisa tetap melihat versi lama karena ter-cache.

## 10. Cara Memperbaiki Error Umum

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| Tampilan berantakan, CSS tidak muncul | Membuka file langsung via `file://` | Jalankan lewat server lokal (lihat bagian 1) |
| Service Worker gagal / offline tidak jalan | Situs tidak diakses via `https://` atau `localhost` | Service Worker hanya jalan di HTTPS atau localhost — ini normal, pastikan hosting pakai HTTPS (semua opsi di atas otomatis HTTPS) |
| Tombol "Install App" tidak muncul | Kriteria PWA belum lengkap, atau sudah pernah diinstal | Pastikan manifest & service worker termuat tanpa error di DevTools → Application tab |
| Perubahan tidak muncul setelah update | Cache lama browser/service worker | Naikkan `CACHE_VERSION`, atau hard refresh (`Ctrl+Shift+R`) |
| Path gambar/CSS 404 di GitHub Pages | Path absolut `/style.css` tidak cocok dengan sub-folder repo | Ganti ke path relatif, lihat bagian 4 |
| Data dashboard "hilang" | Localstorage berbeda per browser & mode incognito | Ini perilaku normal demo lokal — jelaskan ke klien sesuai batasan di atas |

---

# 💰 Cara Menjual Website Ini Tanpa Modal

Berikut strategi realistis untuk mulai menghasilkan dari kemampuan membangun
situs seperti ini — bukan menjual *file ini apa adanya*, tapi menjual
**jasa/kustomisasi** memakai template dan skill ini sebagai portofolio.

## Model bisnis yang masuk akal

1. **Jasa pembuatan landing page/website** untuk UMKM, startup kecil,
   freelancer, personal brand — pakai Orbitly sebagai contoh kualitas kerja.
2. **Jual template** (bukan jasa) di Gumroad/Itch.io/Lemon Squeezy — orang
   beli file untuk dipakai sendiri.
3. **Kombinasi keduanya**: template gratis/murah untuk menarik trafik →
   upsell jasa kustomisasi berbayar.

## Platform & cara mendaftar (gratis)

- **GitHub** — upload source code sebagai portofolio publik + host demo
  gratis via GitHub Pages. Sertakan README yang menjelaskan fitur.
- **Gumroad** ([gumroad.com](https://gumroad.com)) — daftar gratis, upload
  file `.zip` template, atur harga (bisa "pay what you want" untuk awal).
- **Itch.io** ([itch.io](https://itch.io)) — meski dikenal untuk game, cukup
  ramah untuk menjual "web template" atau "tools" juga.
- **Ko-fi** ([ko-fi.com](https://ko-fi.com)) — cocok untuk donasi + jual
  "Shop" item (template) sekaligus buka jasa custom lewat "Commissions".
- **Lemon Squeezy** ([lemonsqueezy.com](https://lemonsqueezy.com)) — mirip
  Gumroad, punya fitur checkout lebih modern; daftar gratis, ambil komisi
  saat ada penjualan.
- **Facebook Marketplace / Grup Facebook** — cari grup seperti "Jasa Website
  Murah", "UMKM Naik Kelas", grup freelancer lokal. Posting jasa dengan
  portofolio Orbitly sebagai contoh.
- **LinkedIn** — posting studi kasus ("Saya membangun landing page premium
  dalam X jam, ini prosesnya") dengan link demo. Menarik klien B2B/startup.
- **TikTok / Instagram** — buat video "before/after" atau "proses membangun
  website ini dari nol", trending format yang mudah viral untuk niche coding.
- **Fiverr / Upwork** — buat gig "Modern SaaS Landing Page Design" dengan
  Orbitly sebagai contoh utama di portofolio gig.

## Strategi mencari pelanggan pertama

1. **Jangan mulai dari platform freelance besar** (kompetisi tinggi, sulit
   dipercaya tanpa review) — mulai dari **jaringan terdekat**: teman, grup
   komunitas, UMKM di sekitar yang belum punya website bagus.
2. Tawarkan **1–2 proyek pertama dengan harga miskin atau gratis** murni
   untuk dapat testimoni + izin memakai hasilnya sebagai portofolio publik.
3. Setelah punya 2–3 testimoni nyata, baru masuk ke Fiverr/Upwork/grup
   Facebook dengan harga normal — testimoni adalah alat jual terkuat di awal.
4. Selalu minta izin menampilkan nama klien atau logo di portofolio (kalau
   diizinkan) — ini jauh lebih meyakinkan daripada demo generik.

## Menentukan harga (patokan pasar Indonesia, sesuaikan lokasimu)

| Jenis proyek | Kisaran harga (indikatif) |
|---|---|
| Landing page 1 halaman, konten dari klien | Rp300rb – Rp1,5 juta |
| Landing page + form kontak + SEO dasar | Rp1 – Rp3 juta |
| Website + dashboard/login demo (seperti Orbitly) | Rp3 – Rp8 juta |
| Paket bulanan (maintenance + update kecil) | Rp200rb – Rp500rb/bulan |

Harga di atas hanyalah **patokan awal**, bukan aturan baku — sesuaikan
dengan kompleksitas, target pasar, dan pengalamanmu. Untuk klien luar
negeri via Fiverr/Upwork, harga dalam USD bisa 3–8x lipat.

## Membuat portofolio yang meyakinkan

- Deploy Orbitly ini ke domain gratis (`.netlify.app`, dsb) sebagai contoh
  demo hidup — jangan hanya screenshot.
- Tulis **studi kasus singkat**: masalah → solusi → hasil (mis. "waktu
  loading di bawah 1 detik", "skor Lighthouse 95+").
- Kumpulkan 3–5 proyek variatif (landing page, dashboard, portofolio pribadi)
  supaya calon klien melihat rentang kemampuanmu, bukan cuma satu gaya.

## Contoh deskripsi jual (siap pakai, tinggal sesuaikan)

**Untuk Fiverr/Upwork (Inggris):**
> I build fast, modern, mobile-first landing pages and dashboards using
> clean HTML/CSS/JavaScript — no bloated frameworks, no slow load times.
> Every project includes PWA support (installable, works offline), SEO
> basics, and a polished dark/light UI inspired by Apple, Stripe, and
> Linear. See a live demo of my work: [link]. Let's build something your
> users will actually enjoy using.

**Untuk grup Facebook/Marketplace (Indonesia):**
> Butuh website yang terlihat premium tapi nggak bikin kantong bolong?
> Saya bikin landing page modern, cepat, dan mobile-friendly — lengkap
> dengan mode gelap/terang, animasi halus, dan bisa diinstal seperti
> aplikasi (PWA). Cocok untuk UMKM, startup kecil, atau personal brand
> yang mau tampil beda. Contoh hasil kerja: [link demo]. DM untuk
> konsultasi gratis!

**Untuk LinkedIn (studi kasus):**
> Saya baru saja membangun Orbitly — landing page + dashboard demo dengan
> performa tinggi, PWA penuh (offline mode + installable), dan desain yang
> terinspirasi dari Apple, Stripe, dan Linear. Dibangun murni dengan
> HTML/CSS/JavaScript tanpa framework berat, sehingga loading-nya sangat
> cepat. Kalau kamu atau timmu butuh landing page dengan kualitas serupa,
> mari ngobrol. [link demo]

---

## Ringkasan Fitur yang Benar-Benar Berjalan

- Landing page lengkap: hero, logo strip, statistik animasi, fitur, galeri,
  harga, testimoni, blog, FAQ accordion, form kontak (tervalidasi + anti-bot
  honeypot + anti-XSS).
- Navbar responsif dengan menu mobile, dark/light mode (tersimpan otomatis),
  smooth scroll, scroll reveal, cursor glow, ripple effect di tombol.
- Dashboard demo: login/register lokal (password di-hash SHA-256), CRUD
  tugas dengan pencarian & filter, grafik SVG yang bereaksi terhadap data,
  notifikasi, profil, pengaturan, hapus data.
- PWA penuh: manifest, service worker cache-first/network-first, halaman
  offline, tombol install, deteksi online/offline dengan toast.
- SEO: meta lengkap, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`,
  markup semantik, `aria-label` untuk aksesibilitas, fokus keyboard terlihat.
- Halaman 404 & offline khusus, back-to-top, share/copy-link, pintasan
  keyboard (`/` untuk cari, `g h` ke beranda, `g d` ke dashboard, `Esc`
  menutup panel).

Semua file di folder ini siap di-upload apa adanya ke hosting gratis mana
pun di atas. Tidak ada langkah tambahan yang wajib, kecuali penyesuaian
path relatif jika kamu memakai GitHub Pages di sub-folder (lihat bagian 4).
