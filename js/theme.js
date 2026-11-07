/* ==========================================================================
 * TaqwaLife - Tema tampilan (6 tema)
 * Memilih, menyimpan, dan menerapkan tema warna.
 * ========================================================================== */

// Daftar tema: kode -> [nama, deskripsi, warna bilah browser].
const THEMES = {
    d: ['Gelap', 'Hitam dan emas', '#0A0A0A'],
    l: ['Terang', 'Putih dan emas', '#F6F5F1'],
    m: ['Muslimah', 'Rose dan plum', '#8E3B66'],
    z: ['Zamrud', 'Hijau dan emas', '#07140F'],
    n: ['Biru Malam', 'Navy dan biru lembut', '#070B1A'],
    v: ['Lavender', 'Ungu lembut', '#F5F2FB']
};
// Mengambil kode tema tersimpan.
const TH = () => {
    const t = lsg('ml_theme');
    return THEMES[t] ? t : 'd';
};
// Menerapkan tema (class pada <body>) dan menyimpannya.
function setTheme(t) {
    if (!THEMES[t])
        t = 'd';
    lss('ml_theme', t);
    const c = document.body.classList;
    c.toggle('dark', t === 'd');
    c.toggle('muslimah', t === 'm');
    c.toggle('th-z', t === 'z');
    c.toggle('th-n', t === 'n');
    c.toggle('th-v', t === 'v');
    const m = document.querySelector('meta[name="theme-color"]');
    if (m)
        m.content = THEMES[t][2];
    const sh = document.querySelector('#thsheet');
    if (sh)
        sh.remove();
    if ($('#app').style.display === 'block')
        render();
}
// Membuka / menutup panel pilih tema.
function openThemes() {
    const o = document.querySelector('#thsheet');
    if (o) {
        o.remove();
        return;
    }
    const d = document.createElement('div');
    d.id = 'thsheet';
    d.innerHTML = `<div class="sh-bg" onclick="openThemes()"></div><div class="sh"><div class="flex sp" style="margin-bottom:12px"><h3 style="margin:0">Pilih tema</h3><button class="icb" onclick="openThemes()" aria-label="Tutup">×</button></div>${themeGrid()}</div>`;
    document.body.appendChild(d);
}
// HTML kisi pilihan tema.
const themeGrid = () => `<div class="thm">${Object.entries(THEMES).map(([k, x]) => `<button class="${TH() === k ? 'on' : ''}" onclick="setTheme('${k}')" aria-label="Tema ${x[0]}"><i class="sw sw-${k}"></i><b>${x[0]}</b><small>${x[1]}</small></button>`).join('')}</div>`;
// Kartu pilihan tema di halaman Akun.
const themeCard = () => `<div class="card"><h3>Tema tampilan</h3>${themeGrid()}</div>`;
