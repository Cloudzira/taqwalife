/* ==========================================================================
 * TaqwaLife - Menu Lainnya
 * Ikon dan daftar menu pada tab Lainnya.
 * ========================================================================== */

// Ikon SVG menu Lainnya.
const ICOS = {
    chart: '<path d="M4 20V11M10 20V4M16 20v-6M2.5 20h19"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c.5-3.5 3-5 6-5s5.5 1.5 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.2c2.6.2 4.2 1.7 4.5 4.8"/>',
    book: '<path d="M12 6c-2-1.5-4.5-2-8-2v14c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2V4c-3.5 0-6 .5-8 2zM12 6v14"/>',
    flag: '<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>',
    pen: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1zM14 7l3 3"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"/><path d="M17 3l.7 1.8 1.8.7-1.8.7L17 8l-.7-1.8-1.8-.7 1.8-.7z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    beads: '<circle cx="12" cy="5" r="1.6"/><circle cx="18" cy="8.5" r="1.6"/><circle cx="18" cy="15" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="6" cy="15" r="1.6"/><circle cx="6" cy="8.5" r="1.6"/><path d="M12 19v3"/>',
    bell: '<path d="M6 17v-6a6 6 0 0112 0v6l1.5 2h-15zM10 21h4"/>'
};
// Daftar menu Lainnya: [id, label, ikon].
const MENU = [['eval', 'Evaluasi', 'chart'], ['fam', 'Keluarga', 'people'], ['haf', 'Hafalan', 'book'], ['cha', 'Tantangan', 'flag'], ['jur', 'Jurnal', 'pen'], ['kjn', 'Kajian', 'mic'], ['doa', 'Doa', 'moon'], ['qib', 'Kiblat', 'compass'], ['zak', 'Zakat', 'coins'], ['tas', 'Tasbih', 'beads'], ['rem', 'Pengingat', 'bell']];
// Kisi menu Lainnya.
function menuV() {
    return `<div class="mg">${MENU.map(m => `<button class="mt" onclick="sub='${m[0]}';render();scrollTo(0,0)"><i><svg viewBox="0 0 24 24" aria-hidden="true">${ICOS[m[2]]}</svg></i>${m[1]}</button>`).join('')}</div>`;
}
