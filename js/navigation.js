/* ==========================================================================
 * TaqwaLife - Navigasi tab bawah & render halaman
 * Mengatur tab aktif dan memanggil fungsi tampilan yang sesuai (render).
 * ========================================================================== */

// Ikon SVG untuk tab navigasi bawah.
const ICO = {
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    ibadah: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 9l2 2 4-4M8 16h8"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    jurnal: '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM9 9h6M9 13h6"/>',
    agenda: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18M8 15h3"/>',
    more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'
};
// Daftar tab navigasi: [id, label].
const TABS = [['home', 'Beranda'], ['ibadah', 'Ibadah'], ['agenda', 'Agenda'], ['target', 'Target'], ['more', 'Lainnya']];
// tab = tab aktif; cur = tanggal checklist; sub = sub-halaman menu Lainnya; QB = arah kiblat.
let tab = 'home', cur = new Date(), sub = '', QB = null, cmp = false;
// Menggambar tombol navigasi bawah.
function nav() {
    $('#nav').innerHTML = TABS.map(t => `<button onclick="${t[0] === 'more' ? `sub='';` : ''}go('${t[0]}')" class="${tab === t[0] ? 'on' : ''}"><svg viewBox="0 0 24 24">${ICO[t[0]]}</svg>${t[1]}</button>`).join('');
}
// Pindah ke tab t lalu tampilkan ulang.
function go(t) {
    tab = t;
    nav();
    render();
    scrollTo(0, 0);
}
// Menggambar ulang halaman aktif ke dalam #view.
function render() {
    $('#view').innerHTML = V[tab]();
    $('#hd').innerHTML = tab === 'home' ? 'Taqwa<span class="lt">Life</span>' : ({
        acc: 'Akun',
        ibadah: 'Checklist Ibadah',
        agenda: 'Agenda Harian',
        target: 'Target Ibadah',
        jurnal: 'Jurnal Muhasabah',
        more: 'Lainnya'
    })[tab];
}
// Membuka halaman Tentang.
function openAbout() {
    sub = 'abt';
    go('more');
}
