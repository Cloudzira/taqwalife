/* ==========================================================================
 * TaqwaLife - Agenda harian
 * Rencana ibadah dan aktivitas dari bangun tidur sampai tidur lagi.
 * ========================================================================== */

// agD = tanggal agenda yang sedang dilihat; agE = id agenda yang sedang diubah.
let agD = new Date(), agE = null;
// Kunci tanggal agenda aktif.
const agK = () => key(agD);
// Label pengingat agenda.
const rl = a => {
    const r = a.r ?? 0;
    return r < 0 ? '' : ' · 🔔 ' + (r ? r + ' mnt sebelum' : 'tepat waktu');
};
// Daftar agenda (dapat diubah) untuk tanggal aktif.
const agArr = () => (D.ag[agK()] = D.ag[agK()] || []);
// Daftar agenda tanggal aktif, terurut jam.
const agList = () => (D.ag[agK()] || []).slice().sort((a, b) => a.t.localeCompare(b.t));
// Predikat nilai dari persentase.
const grade = p => p >= 90 ? 'Sangat Baik (A)' : p >= 75 ? 'Baik (B)' : p >= 60 ? 'Cukup (C)' : p > 0 ? 'Perlu ditingkatkan (D)' : 'Belum ada yang tercentang';
// Jam sekarang "HH:MM".
const nowHM = () => {
    const n = new Date();
    return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
};
// Persentase agenda selesai pada tanggal k.
function agPct(k) {
    const L = D.ag[k] || [];
    return L.length ? Math.round(L.filter(a => a.d).length / L.length * 100) : null;
}
// Template agenda harian bawaan (menyesuaikan jadwal sholat).
function tplB() {
    const [sb, dz, as, mg, is] = D.pt ? D.pt.t.map(x => x[1]) : ['04:30', '12:00', '15:15', '18:00', '19:15'];
    return [[addMin(sb, -60), 'Bangun tidur, berdoa & tahajud', 'i'], [sb, 'Sholat Subuh berjamaah', 'i'], [addMin(sb, 25), 'Dzikir pagi & tilawah Al-Qur\'an', 'i'], ['06:30', 'Sarapan & persiapan aktivitas', 'a'], ['07:30', 'Aktivitas utama (kerja / sekolah)', 'a'], ['09:00', 'Sholat Dhuha', 'i'], [dz, 'Sholat Dzuhur', 'i'], [addMin(dz, 30), 'Makan siang & istirahat', 'a'], [as, 'Sholat Ashar', 'i'], [addMin(as, 30), 'Dzikir petang', 'i'], [mg, 'Sholat Maghrib & ba\'diyah', 'i'], [addMin(mg, 25), 'Tilawah / murajaah hafalan', 'i'], [is, 'Sholat Isya', 'i'], [addMin(is, 40), 'Keluarga, belajar & muhasabah', 'a'], [addMin(is, 100), 'Witir, doa & adab tidur', 'i'], ['22:00', 'Tidur', 'a']];
}
// Halaman agenda harian.
V.agenda = function () {
    const k = agK(), tk = key(new Date()), isT = k === tk, L = agList(), hm = nowHM();
    const dn = x => x.filter(a => a.d).length, ib = L.filter(a => a.c === 'i'), ac = L.filter(a => a.c !== 'i'), p = L.length ? Math.round(dn(L) / L.length * 100) : 0, r = (D.agr || {})[k] || {};
    const dates = Object.keys(D.ag).filter(x => x !== k && D.ag[x].length).sort().reverse().slice(0, 14);
    const lab = isT ? 'Hari ini' : k === key(new Date(Date.now() + 864e5)) ? 'Besok' : agD.toLocaleDateString('id-ID', { weekday: 'long' });
    return `<div class="sec"><div class="card flex sp"><button class="icb" onclick="agShift(-1)" aria-label="Hari sebelumnya">‹</button><div style="text-align:center"><b>${lab}</b><br><small style="color:var(--mut)">${agD.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · ${hijri(agD)}</small></div><button class="icb" onclick="agShift(1)" aria-label="Hari berikutnya">›</button></div>
  <div class="flex" style="margin-bottom:12px"><button class="chip pc" onclick="agSet(0)">Hari ini</button><button class="chip pc" onclick="agSet(1)">Besok</button></div>
  ${L.length ? `<div class="card"><div class="flex sp"><h3>Ketercapaian agenda</h3><b style="color:var(--gold);font-size:22px;font-family:Sora,sans-serif">${p}%</b></div><div class="bar"><i style="width:${p}%"></i></div><small style="color:var(--mut)">${dn(L)} dari ${L.length} selesai · Ibadah ${dn(ib)}/${ib.length} · Aktivitas ${dn(ac)}/${ac.length}</small><p style="margin-top:6px;font-weight:700;color:var(--gold)">${k > tk ? 'Rencana siap, insyaAllah dilaksanakan' : grade(p)}</p></div>` : ''}
  <div class="h">Jadwal</div>
  <div class="card" style="padding:4px 14px">${L.length ? L.map(a => {
        const late = !a.d && (k < tk || (isT && a.t < hm));
        return `<div class="row ${a.d ? 'on' : ''}"><button class="ck" onclick="tgA('${a.id}')" aria-label="Tandai selesai">${a.d ? '✓' : ''}</button><span class="t"><span class="tm">${a.t}</span>${esc(a.n)}<small>${a.c === 'i' ? 'Ibadah' : 'Aktivitas'}${rl(a)}${late ? ' · belum terlaksana' : ''}</small></span><button class="icb" onclick="editA('${a.id}')" aria-label="Ubah">✎</button><button class="icb" onclick="delA('${a.id}')" aria-label="Hapus" style="color:var(--bad)">×</button></div>`;
    }).join('') : '<p style="padding:14px 0;color:var(--mut)">Belum ada agenda. Tambahkan di bawah atau pakai template cepat.</p>'}</div>
  <div class="card"><h3>${agE ? 'Ubah agenda' : 'Tambah agenda'}</h3><div class="flex"><input id="agt" type="time" style="width:130px" value="06:00"><input id="agn" placeholder="Misal: Tilawah 1 juz" maxlength="60"></div><select id="agc" style="margin-top:8px"><option value="i">Ibadah</option><option value="a">Aktivitas harian</option></select><select id="agr" style="margin-top:8px" aria-label="Pengingat"><option value="0">Ingatkan tepat waktu</option><option value="5">Ingatkan 5 menit sebelumnya</option><option value="10">Ingatkan 10 menit sebelumnya</option><option value="15">Ingatkan 15 menit sebelumnya</option><option value="30">Ingatkan 30 menit sebelumnya</option><option value="60">Ingatkan 1 jam sebelumnya</option><option value="-1">Tanpa pengingat</option></select><div class="flex" style="margin-top:10px"><button class="btn sm" onclick="addA()">${agE ? 'Simpan perubahan' : 'Tambah'}</button>${agE ? '<button class="btn sm o" onclick="agE=null;render()">Batal</button>' : ''}</div></div>
  <div class="card"><h3>Susun cepat</h3><div class="flex" style="flex-wrap:wrap"><button class="btn sm" onclick="agTplB()">Template harian bawaan</button>${D.agt ? '<button class="btn sm o" onclick="agAdd(D.agt)">Template saya</button>' : ''}${L.length ? '<button class="btn sm o" onclick="agSaveTpl()">Simpan sebagai template saya</button>' : ''}</div>
  ${dates.length ? `<div class="flex" style="margin-top:10px"><select id="agp">${dates.map(x => `<option value="${x}">${new Date(x + 'T00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</option>`).join('')}</select><button class="btn sm o" onclick="agCopy()">Salin</button></div><small style="color:var(--mut)">Salin agenda dari hari lain ke hari ini yang dipilih.</small>` : ''}</div>
  ${L.length ? `<div class="card"><h3>Penilaian diri</h3><p style="color:var(--mut);font-size:13px">Seberapa puas Anda dengan ${isT ? 'hari ini' : 'hari ini yang dipilih'}?</p><div class="flex">${[1, 2, 3, 4, 5].map(n => `<button class="st ${(r.s || 0) >= n ? 'on' : ''}" onclick="agRate(${n})" aria-label="${n} bintang">★</button>`).join('')}</div><textarea id="agev" rows="3" placeholder="Evaluasi: apa yang berjalan baik, apa yang perlu diperbaiki besok?" style="margin-top:8px">${esc(r.n || '')}</textarea><button class="btn sm" style="margin-top:10px" onclick="agNote()">Simpan evaluasi</button></div>` : ''}</div>`;
};
// Pindah ke hari ini (0) atau besok (1) pada agenda.
function agSet(n) {
    agD = new Date();
    agD.setDate(agD.getDate() + n);
    agE = null;
    render();
}
// Buka tab agenda pada hari tertentu.
function agGo(n) {
    agD = new Date();
    agD.setDate(agD.getDate() + n);
    agE = null;
    go('agenda');
}
// Geser tanggal agenda n hari.
function agShift(n) {
    agD = new Date(agD);
    agD.setDate(agD.getDate() + n);
    agE = null;
    render();
}
// Menambah atau menyimpan perubahan agenda.
function addA() {
    const t = $('#agt').value, n = $('#agn').value.trim(), c = $('#agc').value, r = +$('#agr').value;
    if (!t)
        return toast('Pilih jam');
    if (!n)
        return toast('Isi nama agenda');
    const L = agArr();
    if (agE) {
        const a = L.find(x => x.id === agE);
        if (a) {
            a.t = t;
            a.n = n;
            a.c = c;
            a.r = r;
        }
        agE = null;
    } else {
        if (L.length >= 40)
            return toast('Maksimal 40 agenda per hari');
        L.push({
            id: 'a' + Date.now().toString(36) + Math.floor(Math.random() * 999),
            t,
            n,
            c,
            d: 0,
            r
        });
    }
    save();
    render();
}
// Mengisi form untuk mengubah agenda.
function editA(id) {
    agE = id;
    render();
    const a = agArr().find(x => x.id === id);
    if (a) {
        $('#agt').value = a.t;
        $('#agn').value = a.n;
        $('#agc').value = a.c;
        $('#agr').value = String(a.r ?? 0);
        $('#agn').scrollIntoView({ block: 'center' });
        $('#agn').focus();
    }
}
// Centang agenda selesai.
function tgA(id) {
    if (agK() > key(new Date()))
        return toast('Agenda baru bisa dicentang pada harinya');
    const L = agArr(), a = L.find(x => x.id === id);
    if (!a)
        return;
    a.d = a.d ? 0 : 1;
    save();
    render();
    if (a.d && L.every(x => x.d))
        toast('MasyaAllah, seluruh agenda hari ini tuntas! 🌟');
}
// Menghapus agenda.
function delA(id) {
    if (!confirm('Hapus agenda ini?'))
        return;
    D.ag[agK()] = agArr().filter(x => x.id !== id);
    save();
    render();
}
// Menambah banyak agenda sekaligus (dari template/salinan).
function agAdd(items) {
    const L = agArr();
    let n = 0;
    (items || []).forEach(([t, nm, c, r]) => {
        if (L.length < 40 && !L.some(x => x.t === t && x.n === nm)) {
            L.push({
                id: 'a' + Date.now().toString(36) + n + Math.floor(Math.random() * 999),
                t,
                n: nm,
                c,
                d: 0,
                r: r ?? 0
            });
            n++;
        }
    });
    save();
    render();
    toast(n + ' agenda ditambahkan');
}
// Memakai template harian bawaan.
function agTplB() {
    if (agArr().length && !confirm('Agenda sudah ada. Tambahkan template di bawahnya?'))
        return;
    agAdd(tplB());
}
// Menyimpan agenda hari ini sebagai template pribadi.
function agSaveTpl() {
    D.agt = agArr().map(a => [a.t, a.n, a.c, a.r ?? 0]);
    save();
    render();
    toast('Template tersimpan');
}
// Menyalin agenda dari tanggal lain.
function agCopy() {
    const f = $('#agp').value;
    agAdd((D.ag[f] || []).map(a => [a.t, a.n, a.c, a.r ?? 0]));
}
// Menyimpan penilaian diri (bintang).
function agRate(n) {
    D.agr = D.agr || {};
    D.agr[agK()] = Object.assign({}, D.agr[agK()], { s: n });
    save();
    render();
}
// Menyimpan catatan evaluasi agenda.
function agNote() {
    D.agr = D.agr || {};
    D.agr[agK()] = Object.assign({}, D.agr[agK()], { n: $('#agev').value.trim().slice(0, 600) });
    save();
    toast('Evaluasi tersimpan');
}
// Kartu agenda di beranda.
function agHome() {
    const tk = key(new Date()), L = (D.ag[tk] || []).slice().sort((a, b) => a.t.localeCompare(b.t)), h = new Date().getHours();
    let o = '';
    if (!L.length)
        o = `<div class="card flex sp"><b>🗓 Belum ada agenda hari ini</b><button class="btn sm" onclick="agGo(0)">Susun</button></div>`;
    else {
        const d = L.filter(a => a.d).length, hm = nowHM(), nx = L.find(a => !a.d && a.t >= hm) || L.find(a => !a.d);
        o = `<div class="card"><div class="flex sp"><b>🗓 Agenda hari ini: ${d}/${L.length}</b><button class="btn sm o" onclick="agGo(0)">Buka</button></div><div class="bar"><i style="width:${Math.round(d / L.length * 100)}%"></i></div>${nx ? `<small style="color:var(--mut)">Berikutnya: <b style="color:var(--gold)">${nx.t}</b> ${esc(nx.n)}</small>` : '<small style="color:var(--gold);font-weight:700">Semua agenda selesai. Alhamdulillah!</small>'}</div>`;
    }
    if (h >= 18 && !(D.ag[key(new Date(Date.now() + 864e5))] || []).length)
        o += `<div class="card flex sp"><b>🌙 Susun agenda besok</b><button class="btn sm" onclick="agGo(1)">Susun</button></div>`;
    return o;
}
