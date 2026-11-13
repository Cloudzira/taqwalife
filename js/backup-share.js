/* ==========================================================================
 * TaqwaLife - Template target, bagikan, dan cadangan data
 * Template target cepat, berbagi progres, serta unduh/pulihkan cadangan JSON.
 * ========================================================================== */

// Template target cepat: [nama, jumlah, satuan].
const PRE = [['Khatam Al-Qur\'an', 30, 'juz'], ['Hafalan 1 juz', 20, 'halaman'], ['Puasa Senin-Kamis', 8, 'kali'], ['Sedekah harian', 30, 'hari'], ['Tahajud sebulan', 30, 'malam'], ['Sholat berjamaah', 35, 'kali']];
// Mengisi form target dari template ke-i.
function preT(i) {
    $('#tt').value = PRE[i][0];
    $('#tgl').value = PRE[i][1];
    $('#tu').value = PRE[i][2];
}
// Membagikan progres hari ini.
async function shareProg() {
    const t = 'Alhamdulillah, hari ini amal yaumi saya ' + pct(key(new Date())) + '% 🔥 Streak ' + streak() + ' hari di TaqwaLife. Yuk istiqamah bersama!';
    try {
        if (navigator.share)
            await navigator.share({ title: 'TaqwaLife', text: t, url: location.href.split('#')[0] });
        else {
            await navigator.clipboard.writeText(t + ' ' + location.href);
            toast('Teks disalin');
        }
    } catch (e) {
    }
}
// Mengunduh cadangan data (file JSON).
function exp() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(D)], { type: 'application/json' }));
    a.download = 'taqwalife-cadangan-' + key(new Date()) + '.json';
    a.click();
}
// Memulihkan data dari file cadangan JSON (sudah divalidasi).
function imp(el) {
    const f = el.files[0];
    el.value = '';
    if (!f)
        return;
    if (f.size > 2 * 1024 * 1024)
        return toast('File cadangan terlalu besar');
    const r = new FileReader();
    r.onload = () => {
        try {
            const x = JSON.parse(r.result);
            if (!isObj(x) || !isObj(x.days))
                throw 0;
            D = sanitizeData(x);
            save();
            toast('Data dipulihkan');
            render();
        } catch (e) {
            toast('File cadangan tidak valid');
        }
    };
    r.readAsText(f);
}
