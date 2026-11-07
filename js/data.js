/* ==========================================================================
 * TaqwaLife - Data ibadah, kutipan, doa & penilaian
 * Daftar amalan, kutipan harian, doa, badge, serta rumus poin / streak / level.
 * ========================================================================== */

// Daftar ibadah bawaan per kelompok: [id, nama, poin, keterangan].
const G = [
    { n: 'Sholat Wajib', i: [['subuh', 'Subuh', 10], ['dzuhur', 'Dzuhur', 10], ['ashar', 'Ashar', 10], ['maghrib', 'Maghrib', 10], ['isya', 'Isya', 10]] },
    { n: 'Sholat Sunnah', i: [['rawatib', 'Rawatib', 5, 'Qabliyah / Ba\'diyah'], ['dhuha', 'Dhuha', 5], ['tahajud', 'Tahajud', 8], ['witir', 'Witir', 5]] },
    { n: 'Al-Qur\'an & Dzikir', i: [['tilawah', 'Tilawah Al-Qur\'an', 8, 'Minimal 1 halaman'], ['hafalan', 'Murajaah / Hafalan', 6], ['dzpagi', 'Dzikir Pagi', 5], ['dzsore', 'Dzikir Petang', 5], ['istighfar', 'Istighfar & Sholawat', 3]] },
    { n: 'Amal Sosial & Ilmu', i: [['sedekah', 'Sedekah', 6], ['puasa', 'Puasa Sunnah', 10, 'Senin, Kamis, atau Ayyamul Bidh'], ['ortu', 'Berbakti pada Orang Tua', 5], ['ilmu', 'Menuntut Ilmu', 5]] }
];
// ALL = semua ibadah bawaan (datar); TOTAL = jumlah poin maksimal sehari.
const ALL = G.flatMap(g => g.i), TOTAL = ALL.reduce((a, x) => a + x[2], 0);
// Kutipan ayat/hadits harian di beranda: [teks, sumber].
const QUOTES = [
    ['Sesungguhnya amal itu tergantung pada niatnya.', 'HR. Bukhari & Muslim'],
    ['Amalan yang paling dicintai Allah adalah yang terus-menerus walaupun sedikit.', 'HR. Bukhari & Muslim'],
    ['Maka ingatlah kepada-Ku, niscaya Aku ingat kepadamu.', 'QS. Al-Baqarah: 152'],
    ['Sesungguhnya bersama kesulitan ada kemudahan.', 'QS. Asy-Syarh: 6'],
    ['Barang siapa bertakwa kepada Allah, niscaya Dia memberinya jalan keluar.', 'QS. At-Talaq: 2'],
    ['Senyummu di hadapan saudaramu adalah sedekah.', 'HR. Tirmidzi'],
    ['Sebaik-baik kalian adalah yang belajar Al-Qur\'an dan mengajarkannya.', 'HR. Bukhari'],
    ['Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.', 'QS. Ar-Ra\'d: 28'],
    ['Barang siapa menempuh jalan untuk mencari ilmu, Allah mudahkan baginya jalan menuju surga.', 'HR. Muslim'],
    ['Bersuci itu separuh dari iman.', 'HR. Muslim'],
    ['Barang siapa beriman kepada Allah dan hari akhir, hendaklah berkata baik atau diam.', 'HR. Bukhari & Muslim'],
    ['Sesungguhnya Allah tidak melihat rupa dan harta kalian, tetapi melihat hati dan amal kalian.', 'HR. Muslim'],
    ['Sedekah tidak akan mengurangi harta.', 'HR. Muslim'],
    ['Mintalah pertolongan dengan sabar dan sholat.', 'QS. Al-Baqarah: 45'],
    ['Sesungguhnya Allah bersama orang-orang yang sabar.', 'QS. Al-Baqarah: 153'],
    ['Berdoalah kepada-Ku, niscaya Aku kabulkan untukmu.', 'QS. Ghafir: 60'],
    ['Allah tidak membebani seseorang melainkan sesuai kesanggupannya.', 'QS. Al-Baqarah: 286'],
    ['Barang siapa menunjukkan kepada kebaikan, ia mendapat pahala seperti pelakunya.', 'HR. Muslim'],
    ['Orang kuat bukanlah yang menang bergulat, tetapi yang mampu menahan dirinya ketika marah.', 'HR. Bukhari & Muslim']
];
// Daftar doa: [judul, Arab, terjemahan, sumber, kategori].
const DOA = [
    ['Bangun tidur', 'اَلْحَمْدُ لِلّٰهِ الَّذِيْ أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', 'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dikembalikan.'],
    ['Sebelum tidur', 'بِاسْمِكَ اللّٰهُمَّ أَحْيَا وَبِاسْمِكَ أَمُوتُ', 'Dengan nama-Mu ya Allah aku hidup dan aku mati.'],
    ['Sebelum makan', 'اَللّٰهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ', 'Ya Allah, berkahilah rezeki yang Engkau berikan kepada kami dan jagalah kami dari azab neraka.'],
    ['Setelah makan', 'اَلْحَمْدُ لِلّٰهِ الَّذِيْ أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim.'],
    ['Keluar rumah', 'بِسْمِ اللّٰهِ تَوَكَّلْتُ عَلَى اللّٰهِ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ', 'Dengan nama Allah, aku bertawakal kepada Allah. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.'],
    ['Masuk masjid', 'اَللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.'],
    ['Keluar masjid', 'اَللّٰهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', 'Ya Allah, sungguh aku memohon karunia-Mu.'],
    ['Doa sapu jagat', 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.']
];
// Daftar badge pencapaian: [ikon, nama, fungsi syarat].
const BD = [['🔥', 'Istiqamah 3 hari', () => best() >= 3], ['🌙', '7 hari beruntun', () => best() >= 7], ['👑', '30 hari beruntun', () => best() >= 30], ['🕌', 'Hari sempurna', () => Object.keys(D.days).some(k => pct(k) === 100)], ['⭐', '500 poin', () => points() >= 500], ['💎', '1.500 poin', () => points() >= 1500], ['🎯', 'Target tuntas', () => D.tg.some(t => t.c >= t.g)], ['✍️', '5 catatan jurnal', () => D.nt.length >= 5], ['📖', 'Hafalan mutqin', () => D.hf.some(h => h.st === 2)], ['🗓️', 'Agenda tuntas 100%', () => Object.keys(D.ag).some(k => agPct(k) === 100)], ['🏆', 'Tantangan selesai', () => D.ch.some(c => Object.keys(c.done).length >= c.len)]];
// Streak terbaik (rekor beruntun).
const best = () => Math.max(D.best || 0, streak());
// Daftar ibadah yang berlaku pada tanggal k (bawaan + tambahan pengguna).
const itemsOn = k => ALL.concat((D.ci || []).filter(c => k >= c.d && (!c.e || k < c.e)).map(c => [c.id, c.n, c.p]));
// Persentase capaian ibadah pada tanggal k.
const pct = k => {
    const d = D.days[k];
    if (!d)
        return 0;
    const it = itemsOn(k), t = it.reduce((a, x) => a + x[2], 0);
    return Math.round(it.reduce((a, x) => a + (d[x[0]] ? x[2] : 0), 0) / t * 100);
};
// Mengambil (atau membuat) catatan ibadah untuk tanggal k.
const day = k => D.days[k] || (D.days[k] = {});
// Jumlah hari beruntun dengan capaian minimal 60%.
function streak() {
    let s = 0, d = new Date();
    if (pct(key(d)) < 60)
        d.setDate(d.getDate() - 1);
    while (pct(key(d)) >= 60) {
        s++;
        d.setDate(d.getDate() - 1);
    }
    return s;
}
// Total poin dari seluruh riwayat.
const points = () => Object.entries(D.days).reduce((a, [k, d]) => a + itemsOn(k).reduce((b, x) => b + (d[x[0]] ? x[2] : 0), 0), 0);
// Nama-nama level; tiap 600 poin naik satu level.
const LV = ['Pemula', 'Pejuang Istiqamah', 'Penjaga Waktu', 'Hamba Rajin', 'Ahli Ibadah', 'Hamba Pilihan'];
// Menghitung level pengguna dari total poin.
function level() {
    const p = points(), i = Math.min(Math.floor(p / 600), LV.length - 1);
    return {
        n: LV[i],
        i,
        p,
        next: (i + 1) * 600
    };
}
