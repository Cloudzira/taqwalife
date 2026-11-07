/* ==========================================================================
 * TaqwaLife - Tantangan & info Ramadhan
 * Tantangan harian beberapa hari dan informasi Ramadhan.
 * ========================================================================== */

// Template tantangan: [nama, jumlah hari].
const CPRE = [['Ramadhan: 1 juz per hari', 30], ['Tahajud 30 hari', 30], ['Dhuha 21 hari', 21], ['Sedekah tiap hari', 30], ['Sholat berjamaah 7 hari', 7], ['Dzikir pagi petang 40 hari', 40]];
// Menambah n menit pada jam "HH:MM".
const addMin = (t, n) => {
    const [h, m] = t.split(':'), x = ((+h * 60 + +m + n) % 1440 + 1440) % 1440;
    return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
};
// Kartu info Ramadhan (muncul saat bulan Hijriah ke-9).
function ramInfo() {
    if (hM(new Date()) !== 9 || !D.pt)
        return '';
    const has = D.ch.some(c => c.n.startsWith('Ramadhan'));
    return `<div class="card" style="border-color:var(--gold)"><b style="color:var(--gold)">🌙 Ramadhan hari ke-${hDay(new Date())} (perkiraan)</b><br><small style="color:var(--mut)">Imsak ${addMin(D.pt.t[0][1], -10)} · Berbuka ${D.pt.t[3][1]}</small>${has ? '' : '<br><button class="btn sm" style="margin-top:10px" onclick="startRam()">Mulai tantangan Ramadhan</button>'}</div>`;
}
// Memulai tantangan Ramadhan.
function startRam() {
    D.ch.unshift({
        n: CPRE[0][0],
        len: 30,
        s: key(new Date()),
        done: {}
    });
    save();
    sub = 'cha';
    go('more');
}
// Tanggal hari ke-i dari tantangan c.
const cDate = (c, i) => {
    const [y, m, d] = c.s.split('-');
    return new Date(+y, +m - 1, +d + i);
};
// Halaman tantangan.
function chaV() {
    const tk = key(new Date());
    return `<div class="card"><h3>Mulai tantangan baru</h3><div class="flex" style="flex-wrap:wrap;margin-bottom:10px">${CPRE.map((p, i) => `<button class="chip pc" onclick="preC(${i})">${p[0]}</button>`).join('')}</div><input id="cn" placeholder="Nama tantangan"><select id="cl" style="margin-top:8px">${[7, 14, 21, 30, 40].map(n => `<option value="${n}" ${n === 30 ? 'selected' : ''}>${n} hari</option>`).join('')}</select><button class="btn sm" style="margin-top:10px" onclick="addC()">Mulai hari ini</button></div>
  ${D.ch.length ? D.ch.map((c, ci) => {
        const n = Object.keys(c.done).length, p = Math.min(100, Math.round(n / c.len * 100));
        return `<div class="card"><div class="flex sp"><b>${esc(c.n)}</b><button class="del" onclick="delC(${ci})">Hapus</button></div><div class="bar"><i style="width:${p}%"></i></div><small style="color:var(--mut)">${n} dari ${c.len} hari · ${p}%</small>
  <div class="cg" style="grid-template-columns:repeat(${c.len <= 21 ? 7 : 10},1fr)">${[...Array(c.len)].map((_, i) => {
            const k = key(cDate(c, i));
            return `<button class="cl ${c.done[k] ? 'on' : ''} ${k === tk ? 'td' : ''}" ${k > tk ? 'disabled' : ''} onclick="tgC(${ci},'${k}')">${i + 1}</button>`;
        }).join('')}</div>${n >= c.len ? '<small style="color:var(--gold);font-weight:700;display:block;margin-top:8px">Alhamdulillah, tantangan selesai! 🏆</small>' : ''}</div>`;
    }).join('') : '<div class="card" style="text-align:center;color:var(--mut)">Belum ada tantangan. Pilih salah satu di atas untuk mulai.</div>'}`;
}
// Mengisi form tantangan dari template.
function preC(i) {
    $('#cn').value = CPRE[i][0];
    $('#cl').value = CPRE[i][1];
}
// Menambah tantangan baru.
function addC() {
    const n = $('#cn').value.trim().slice(0, 100);
    if (!n)
        return toast('Isi nama tantangan');
    if (D.ch.length >= 20)
        return toast('Maksimal 20 tantangan');
    D.ch.unshift({
        n,
        len: +$('#cl').value,
        s: key(new Date()),
        done: {}
    });
    save();
    render();
    toast('Tantangan dimulai. Semangat!');
}
// Centang hari tantangan.
function tgC(ci, k) {
    const c = D.ch[ci];
    if (c.done[k])
        delete c.done[k];
    else
        c.done[k] = 1;
    save();
    render();
    if (Object.keys(c.done).length === c.len)
        toast('MasyaAllah, tantangan selesai! 🏆');
}
// Menghapus tantangan.
function delC(i) {
    if (confirm('Hapus tantangan ini?')) {
        D.ch.splice(i, 1);
        save();
        render();
    }
}
