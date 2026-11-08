/* ==========================================================================
 * TaqwaLife - Tentang aplikasi, panduan & FAQ
 * Halaman informasi aplikasi, panduan penggunaan, FAQ, dan tautan media sosial.
 * ========================================================================== */

// Versi aplikasi.
const APP_V = '1.0.0';
// Memuat ikon Font Awesome hanya saat halaman Tentang dibuka.
function loadFA() {
    if (document.querySelector('#fa'))
        return;
    const l = document.createElement('link');
    l.id = 'fa';
    l.rel = 'stylesheet';
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(l);
}
// Isi panduan penggunaan: [judul, HTML].
const GUIDE = [
    ['1. Memulai dan masuk', `<ol><li>Buka aplikasi, lalu pilih <b>Daftar</b> atau <b>Masuk</b> dengan email atau akun Google.</li><li>Lupa kata sandi? Isi email lalu ketuk <b>Lupa kata sandi</b>, tautan reset dikirim ke email Anda.</li><li>Tanpa login (mode lokal), data hanya tersimpan di perangkat ini dan tidak bisa dipindah otomatis.</li><li>Ganti nama, sapaan, lokasi, dan tema di halaman <b>Akun</b> (ikon orang di pojok kanan atas). Tombol <b>Keluar</b> juga ada di sana.</li></ol>`],
    ['2. Checklist ibadah dan poin', `<ol><li>Buka tab <b>Ibadah</b> lalu ketuk amalan yang sudah dikerjakan.</li><li>Tiap amalan punya poin (angka +). Persentase hari ini dihitung dari total poin.</li><li><b>Streak</b> bertambah bila capaian harian minimal 60% secara beruntun.</li><li>Level naik setiap 600 poin.</li><li>Gunakan panah di atas untuk mengisi hari sebelumnya.</li><li>Tambahkan ibadah atau amal sendiri lewat bagian <b>Tambah ibadah / amal</b> di bawah daftar. Sholat wajib tetap dan tidak bisa diubah.</li></ol>`],
    ['3. Agenda harian', `<ol><li>Buka tab <b>Agenda</b>, ketuk <b>Besok</b> untuk menyusun rencana esok hari.</li><li>Tambahkan agenda: pilih jam, nama kegiatan, jenis (Ibadah atau Aktivitas), dan pengingat (tepat waktu atau 5 menit sampai 1 jam sebelumnya).</li><li>Pakai <b>Template harian bawaan</b> untuk menyusun cepat. Jam sholat mengikuti kota Anda.</li><li>Simpan susunan favorit lewat <b>Simpan sebagai template saya</b>, atau <b>Salin</b> dari hari lain.</li><li>Pada harinya, centang agenda yang terlaksana. Nilai A sampai D muncul otomatis.</li><li>Isi <b>Penilaian diri</b> (bintang dan catatan) sebagai bahan evaluasi.</li></ol>`],
    ['4. Target, hafalan, dan tantangan', `<ul><li><b>Target:</b> tab Target, pilih template atau buat sendiri, lalu ubah progres dengan tombol + dan −.</li><li><b>Hafalan:</b> Lainnya, Hafalan. Ketuk status untuk menaikkan dari Baru, Murajaah, lalu Mutqin. Pengingat murajaah muncul setelah 3 hari (baru) atau 7 hari (lancar).</li><li><b>Tantangan:</b> Lainnya, Tantangan. Pilih durasi 7 sampai 40 hari lalu centang kotak setiap hari.</li></ul>`],
    ['5. Jurnal muhasabah', `<p>Tab <b>Jurnal</b> untuk menulis evaluasi diri harian: yang disyukuri, yang perlu diperbaiki, dan niat untuk besok.</p>`],
    ['6. Evaluasi dan pencapaian', `<p>Buka <b>Lainnya, Evaluasi</b> untuk grafik 7 hari, rata-rata capaian, amalan paling konsisten dan yang perlu ditingkatkan, ketercapaian agenda, peta konsistensi 5 minggu, serta badge pencapaian.</p>`],
    ['7. Jadwal sholat dan arah kiblat', `<ul><li>Jadwal dihitung langsung di perangkat (metode Kemenag), jadi tetap jalan tanpa internet. Hasilnya perkiraan dengan selisih sekitar 2 menit.</li><li>Pilih kota atau lokasi GPS di <b>Akun</b>.</li><li><b>Kiblat:</b> Lainnya, Kiblat, lalu izinkan lokasi dan sensor. Jauhkan HP dari logam atau magnet. Jika kompas melenceng, gerakkan HP membentuk angka 8.</li></ul>`],
    ['8. Pengingat dan notifikasi', `<ul><li>Buka <b>Lainnya, Pengingat</b>, aktifkan notifikasi, lalu tambahkan pengingat dengan jam pilihan Anda.</li><li>Notifikasi sholat dan agenda berbunyi saat aplikasi sedang terbuka.</li><li><b>Pengingat islami</b> (dzikir pagi dan petang, adab tidur, amalan Jumat) tampil di beranda dan bisa diaktifkan atau dimatikan di Pengingat.</li><li><b>Notifikasi push</b> (pesan walau aplikasi tertutup) butuh login. Di iPhone, aplikasi harus dipasang ke layar utama lebih dulu.</li></ul>`],
    ['9. Grup keluarga', `<ol><li>Lainnya, Keluarga, lalu <b>Buat grup</b> dan bagikan kode 6 karakter ke anggota.</li><li>Anggota lain memilih <b>Gabung dengan kode</b>. Maksimal 30 anggota per grup.</li><li>Peringkat 7 hari dan target bersama tampil untuk semua anggota. Ketuk tombol muat ulang untuk memperbarui.</li><li>Poin Anda di peringkat ikut diperbarui saat data tersinkron.</li></ol>`],
    ['10. Data, sinkronisasi, dan cadangan', `<ul><li>Semua data disimpan di perangkat lebih dulu, jadi aplikasi cepat dan tetap berjalan saat offline.</li><li>Untuk akun yang login, data dikirim ke cloud otomatis sekitar tiap 6 jam atau saat aplikasi ditutup. Gunakan <b>Sinkron sekarang</b> di Akun bila perlu (jeda 2 menit).</li><li>Pindah perangkat: cukup masuk dengan akun yang sama.</li><li>Unduh <b>cadangan</b> berkas JSON secara berkala, dan gunakan <b>Pulihkan</b> bila diperlukan.</li></ul>`],
    ['11. Pasang aplikasi dan mode offline', `<ul><li><b>Android (Chrome):</b> Akun, <b>Pasang di perangkat</b>, atau menu browser lalu Tambahkan ke layar utama.</li><li><b>iPhone (Safari):</b> ketuk Bagikan, lalu <b>Tambah ke Layar Utama</b>.</li><li>Setelah dibuka sekali dengan internet, aplikasi bisa dipakai offline.</li></ul>`],
    ['12. Tema tampilan', `<p>Tersedia 6 tema: <b>Gelap</b>, <b>Terang</b>, <b>Muslimah</b>, <b>Zamrud</b>, <b>Biru Malam</b>, dan <b>Lavender</b>. Ketuk ikon palet di pojok kanan atas untuk memilih, atau buka <b>Akun, Tema tampilan</b>.</p>`]
];
// Pertanyaan umum: [pertanyaan, jawaban].
const FAQ = [
    ['Data saya hilang, apa penyebabnya?', 'Pastikan Anda masuk dengan akun yang sama. Data lokal ikut terhapus bila Anda membersihkan data browser, jadi sinkronkan dan unduh cadangan secara berkala.'],
    ['Notifikasi tidak muncul.', 'Periksa izin notifikasi di browser. Aplikasi harus terbuka, dan di HP matikan penghemat baterai untuk browser atau aplikasi ini.'],
    ['Jadwal sholat berbeda dengan masjid setempat.', 'Jadwal adalah perkiraan dengan selisih sekitar 2 menit. Pilih kota terdekat atau gunakan GPS, dan rujuk jadwal masjid untuk keperluan resmi.'],
    ['Tanggal Hijriah berbeda dengan penetapan pemerintah.', 'Aplikasi memakai kalender Umm al-Qura yang bisa berbeda satu hari dari penetapan resmi setempat.'],
    ['Arah kiblat kurang akurat.', 'Izinkan lokasi dan sensor, jauhkan dari logam, kalibrasi dengan gerakan angka 8, dan cocokkan dengan kompas lain bila ragu.']
];
// Halaman Tentang.
function abtV() {
    loadFA();
    return `<div class="card" style="text-align:center;padding:26px 16px"><svg width="64" height="64"><use href="#fl"/></svg><h2 style="font-size:24px;margin-top:8px">Taqwa<span class="lt">Life</span></h2><small style="color:var(--mut)">Versi ${APP_V}</small><p style="color:var(--mut);font-size:13px;margin-top:10px">Pendamping ibadah harian muslim: susun agenda, catat amalan, pantau target, dan evaluasi diri dengan tenang dan konsisten.</p></div>
  <div class="card"><h3>Panduan penggunaan</h3>${GUIDE.map(g => `<details><summary>${g[0]}</summary>${g[1]}</details>`).join('')}</div>
  <div class="card"><h3>Pertanyaan umum</h3>${FAQ.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</div>
  <div class="card"><h3>Ikuti dan hubungi kami</h3><div class="soc">
   <a href="https://instagram.com/kurniapedia" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-instagram"></i>Instagram</a>
   <a href="https://tiktok.com/@kurniapedia" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-tiktok"></i>TikTok</a>
   <a href="https://kurniapedia.my.id/" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-globe"></i>Kurniapedia</a></div>
  <div class="flex" style="margin-top:14px;flex-wrap:wrap"><button class="btn sm" onclick="shareApp()">Bagikan aplikasi</button></div></div>`;
}
// Membagikan tautan aplikasi.
async function shareApp() {
    const t = 'Yuk gunakan TaqwaLife untuk merencanakan dan mengevaluasi ibadah harian.', u = location.href.split('#')[0];
    try {
        if (navigator.share)
            await navigator.share({ title: 'TaqwaLife', text: t, url: u });
        else {
            await navigator.clipboard.writeText(t + ' ' + u);
            toast('Tautan disalin');
        }
    } catch (e) {
    }
}
