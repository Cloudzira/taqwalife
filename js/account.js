/* ==========================================================================
 * TaqwaLife - Akun, profil & pengingat islami
 * Halaman akun, simpan nama, dan kartu pengingat islami di beranda.
 * ========================================================================== */

// Halaman akun.
V.acc = function () {
    return '<div class="sec">' + accV() + '</div>';
};
// Nama tampilan (sapaan + nama).
const dn = () => (D.sp ? D.sp + ' ' : '') + D.name;
// Menyimpan profil (nama & sapaan).
function saveName() {
    const n = $('#nm').value.trim().slice(0, 30);
    if (!n)
        return toast('Nama tidak boleh kosong');
    D.name = n;
    D.sp = $('#sp').value;
    save();
    if (db && uid !== 'local')
        pubStats();
    try {
        if (CFG && auth && auth.currentUser)
            auth.currentUser.updateProfile({ displayName: n }).catch(() => {
            });
    } catch (e) {
    }
    toast('Profil disimpan');
    render();
}
// Menyalakan/mematikan pengingat islami.
function togglIr() {
    D.ir = D.ir === 0 ? 1 : 0;
    save();
    render();
}
// Kartu pengingat islami sesuai waktu sekarang.
function irem() {
    if (D.ir === 0 || !D.pt)
        return '';
    const n = new Date(), m = n.getHours() * 60 + n.getMinutes(), tm = s => {
        const [h, mm] = s.split(':');
        return +h * 60 + +mm;
    }, [sb, dz, as, mg, is] = D.pt.t.map(x => tm(x[1])), L = [];
    if (n.getDay() === 5)
        L.push(['🕌', 'Hari Jumat', 'Perbanyak sholawat, baca Surah Al-Kahfi, mandi, dan bersegera menuju masjid.']);
    if (m >= 150 && m < sb)
        L.push(['✨', 'Sepertiga malam terakhir', 'Waktu yang mulia untuk tahajud, istighfar, dan berdoa.']);
    if (m >= sb && m < sb + 100)
        L.push(['☀️', 'Waktunya dzikir pagi', 'Bacalah dzikir pagi dan istighfar, lalu lanjutkan dengan tilawah.']);
    if (m >= sb + 100 && m < dz - 20)
        L.push(['🌤️', 'Waktu sholat Dhuha', 'Dua rakaat Dhuha dihitung sebagai sedekah bagi seluruh persendian tubuh (HR. Muslim).']);
    if (m >= as && m < mg)
        L.push(['🌇', 'Waktunya dzikir petang', 'Jaga dzikir petang sebelum Maghrib tiba.']);
    if (m >= is + 60)
        L.push(['🌙', 'Persiapan tidur', 'Berwudhu, baca Ayat Kursi dan tiga Qul, lalu doa sebelum tidur.']);
    if (!L.length)
        return '';
    return `<div class="card"><h3>Pengingat hari ini</h3>${L.slice(0, 3).map(x => `<div class="flex" style="align-items:flex-start;padding:6px 0"><span style="font-size:20px;line-height:1.3">${x[0]}</span><div><b>${x[1]}</b><br><small style="color:var(--mut)">${x[2]}</small></div></div>`).join('')}</div>`;
}
