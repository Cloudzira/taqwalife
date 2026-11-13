/* ==========================================================================
 * TaqwaLife - Fungsi bantu & state global
 * Fungsi kecil yang dipakai di seluruh aplikasi ($, esc, key, toast) serta data bawaan pengguna.
 * ========================================================================== */

const $ = s => document.querySelector(s);
// Mengamankan teks sebelum dimasukkan ke HTML (mencegah XSS).
const esc = s => String(s).replace(/[&<>"'`]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
}[c]));
// Mengubah tanggal menjadi teks "YYYY-MM-DD" yang dipakai sebagai kunci data harian.
const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
// Menampilkan pesan singkat di bagian bawah layar.
let toastT;
const toast = m => {
    const t = $('#toast');
    t.textContent = m;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2600);
};
// Struktur data bawaan seorang pengguna (D). Lihat juga README untuk arti tiap field.
const defaults = () => ({
    name: '',
    days: {},
    tg: [],
    nt: [],
    rm: [],
    notif: 0,
    city: 'Purwokerto',
    tasbih: 0,
    pt: null,
    loc: null,
    hf: [],
    ch: [],
    ag: {},
    agt: null,
    agr: {},
    kj: [],
    ci: [],
    sp: '',
    ir: 1,
    best: 0,
    group: null,
    push: 0,
    _ts: 0
});
// D = seluruh data pengguna saat ini; uid = id pengguna ("local" untuk mode lokal).
let D = defaults(), uid = 'local', pendingName = '', cloudT;
