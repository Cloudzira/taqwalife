# TaqwaLife - Amal Yaumi Harian

Aplikasi web (PWA) untuk merencanakan, mencatat, dan mengevaluasi ibadah harian.
Tanpa build tool: cukup unggah folder ini ke GitHub lalu deploy di Cloudflare Pages.

## Struktur folder

```
taqwalife-main/
├── index.html              Kerangka halaman (HTML) + urutan pemuatan skrip
├── css/style.css           Seluruh gaya tampilan, dibagi per bagian berjudul
├── js/                     Kode program, satu file per fitur (dimuat berurutan)
├── sw.js                   Service worker: cache offline + notifikasi push
├── manifest.webmanifest    Pengaturan aplikasi yang bisa dipasang (PWA)
├── *.png                   Ikon aplikasi
├── firestore.rules         Aturan keamanan database (pasang di Firebase Console)
└── _headers                Header keamanan untuk Cloudflare Pages
```

## Urutan file JavaScript (jangan diubah)

File dimuat dari atas ke bawah dan saling berbagi variabel. `main.js` harus paling akhir.

| File | Isi |
|------|-----|
| config.js | Konfigurasi Firebase |
| core.js | Fungsi bantu (`$`, `esc`, `key`, `toast`) dan data bawaan |
| security.js | Validasi/pembersihan semua data dari luar |
| storage.js | Simpan lokal, sinkron cloud |
| data.js | Daftar ibadah, kutipan, doa, poin, streak, level |
| auth.js | Login, daftar, keluar, `boot()` |
| navigation.js | Tab bawah dan `render()` |
| theme.js | 6 tema warna |
| views.js | Pembuat HTML tiap halaman (objek `V`) |
| actions.js | Aksi tombol (centang, tambah, hapus) |
| notifications.js | Pengingat dan notifikasi |
| prayer-times.js | Kota dan perhitungan jadwal sholat |
| backup-share.js | Template target, bagikan, cadangan JSON |
| family.js | Grup keluarga |
| hafalan.js, challenges.js, agenda.js, kajian.js, doa.js | Fitur masing-masing |
| about.js | Tentang, panduan, FAQ |
| ibadah-extra.js, account.js, menu.js, push.js | Pelengkap |
| main.js | Menjalankan `boot()` |

## Istilah singkat di kode

- `D` = seluruh data pengguna; `uid` = id pengguna (`local` bila tanpa login)
- `V.home()`, `V.ibadah()`, ... = fungsi pembuat tampilan; `render()` menggambarnya
- `save()` = simpan data; `toast('...')` = pesan singkat; `go('tab')` = pindah tab

## Keamanan

Yang sudah diterapkan:

1. **Validasi data** (`js/security.js`): data dari localStorage, cloud, file cadangan, dan dokumen grup dibangun ulang dengan tipe/format ketat. Ini menutup celah XSS lewat id/nama dan prototype pollution lewat file cadangan palsu.
2. **`esc()`** kini juga mengamankan tanda `'` dan `` ` ``.
3. **Content Security Policy** di `index.html` membatasi sumber skrip, koneksi, frame, dan object.
4. **Header keamanan** di `_headers` (nosniff, anti-iframe, referrer, HSTS).
5. **Batas ukuran/panjang** input dan file cadangan (maks 2 MB).

Yang perlu Anda lakukan sekali (di luar kode):

1. **Pasang `firestore.rules`** di Firebase Console > Firestore > Rules > Publish. Tanpa ini, keamanan database bergantung pada aturan lama Anda.
2. **Batasi API key** di Google Cloud Console > APIs & Services > Credentials: pilih *HTTP referrers* dan isi domain Cloudflare Pages Anda (misal nama-proyek.pages.dev). (API key Firebase memang publik, tetapi sebaiknya dibatasi domain.)
3. Setelah deploy, **uji login Email, login Google, dan notifikasi push**. Bila ada yang gagal karena CSP, hapus sementara baris `<meta http-equiv="Content-Security-Policy" ...>` di `index.html`, lalu beri tahu saya agar dilonggarkan seperlunya.

Catatan jujur: CSP masih memakai `'unsafe-inline'` untuk skrip karena tombol di aplikasi memakai atribut `onclick`. Risiko XSS tetap ditekan oleh `esc()` dan `security.js`. Mengganti `onclick` ke event listener adalah perubahan besar yang bisa dilakukan di tahap berikutnya.

## Setiap kali memperbarui file

Naikkan angka versi cache di `sw.js` (`const V = 'taqwalife-v19'`) agar pengguna mendapat versi terbaru. Bila menambah file `.js`/`.css` baru, daftarkan juga di `SHELL` pada `sw.js`.
