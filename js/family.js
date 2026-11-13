/* ==========================================================================
 * TaqwaLife - Grup keluarga
 * Peringkat dan target bersama via Firestore (1 dokumen per grup, maksimal 30 anggota).
 * ========================================================================== */

// Cache dokumen grup keluarga dari Firestore dan penanda status muat.
let gDoc = null, gAt = 0, gBusy = 0, gPend = {}, gTm = null;
// Batas anggota grup; FV = helper nilai khusus Firestore.
const MAXM = 30, FV = () => firebase.firestore.FieldValue;
// Referensi dokumen grup di Firestore.
const gref = () => db.collection('groups').doc(D.group.code);
// Total poin 7 hari terakhir.
const weekPts = () => {
    let s = 0;
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const x = D.days[key(d)];
        if (x)
            s += itemsOn(key(d)).reduce((a, y) => a + (x[y[0]] ? y[2] : 0), 0);
    }
    return s;
};
// Mengirim statistik pengguna ke dokumen grup.
function pubStats() {
    if (!db || uid === 'local' || !D.group)
        return;
    gref().update({ ['members.' + uid]: {
            n: D.name,
            w: weekPts(),
            s: streak(),
            t: points(),
            ts: Date.now()
        } }).catch(() => {
    });
}
// Mereset cache grup agar dimuat ulang.
function famListen() {
    gDoc = null;
    gAt = 0;
}
// Memuat data grup dari Firestore (dengan pembatasan frekuensi).
async function famLoad(force) {
    if (!db || uid === 'local' || !D.group || gBusy)
        return;
    if (force && Date.now() - gAt < 30000)
        return toast('Baru saja diperbarui');
    if (!force && gAt && Date.now() - gAt < 10 * 60000)
        return;
    gBusy = 1;
    try {
        const s = await gref().get();
        if (!s.exists) {
            D.group = null;
            save();
            gDoc = null;
        } else {
            gDoc = sanitizeGroupDoc(s.data());
            gAt = Date.now();
        }
    } catch (e) {
        gAt = Date.now();
        toast('Gagal memuat grup');
    }
    gBusy = 0;
    if (tab === 'more' && sub === 'fam')
        render();
}
// Halaman grup keluarga.
function famV() {
    if (!db || uid === 'local')
        return `<div class="card"><h3>Keluarga</h3><p style="color:var(--mut)">Fitur ini butuh login Firebase. Masuk dengan akun Anda untuk membuat atau bergabung ke grup keluarga.</p></div>`;
    if (!D.group)
        return `<div class="card"><h3>Buat grup keluarga</h3><input id="gn" placeholder="Nama grup, misal: Keluarga Barokah"><button class="btn sm" style="margin-top:10px" onclick="gCreate()">Buat grup</button></div>
  <div class="card"><h3>Gabung dengan kode</h3><input id="gc" placeholder="Kode 6 karakter" maxlength="6" style="text-transform:uppercase"><button class="btn sm" style="margin-top:10px" onclick="gJoin()">Gabung</button></div>`;
    famLoad();
    const M = Object.entries((gDoc && gDoc.members) || {}).map(([id, u]) => ({ id, ...u })).sort((a, b) => b.w - a.w);
    const T = Object.entries((gDoc && gDoc.targets) || {}).map(([id, t]) => ({ id, ...t }));
    return `<div class="card" style="text-align:center"><h3>${esc(D.group.name)}</h3><div class="code">${D.group.code}</div><small style="color:var(--mut)">Bagikan kode ini kepada anggota keluarga (maks ${MAXM} orang)</small></div>
  <div class="card"><div class="flex sp"><h3>Peringkat 7 hari</h3><button class="icb" onclick="famLoad(true)" aria-label="Muat ulang">↻</button></div>${M.length ? M.map((u, i) => `<div class="lb ${u.id === uid ? 'me' : ''}"><span class="rk">${i + 1}</span><div style="flex:1"><b>${esc(u.n)}</b><br><small style="color:var(--mut)">🔥 ${u.s} hari · total ${u.t} poin</small></div><b style="color:var(--gold)">${u.w}</b></div>`).join('') : `<small style="color:var(--mut)">${gDoc ? 'Belum ada data anggota. Data muncul setelah sinkron.' : 'Memuat…'}</small>`}</div>
  <div class="card"><h3>Target bersama</h3><input id="gt" placeholder="Misal: Khatam Al-Qur'an keluarga"><div class="flex" style="margin-top:8px"><input id="gg" type="number" min="1" placeholder="Jumlah"><input id="gu" placeholder="Satuan (juz)"></div><button class="btn sm" style="margin-top:10px" onclick="gAddT()">Tambah target</button></div>
  ${T.map(t => {
        const p = Math.min(100, Math.round(t.c / t.g * 100));
        return `<div class="card"><div class="flex sp"><b>${esc(t.t)}</b><button class="del" onclick="gDelT('${t.id}')">Hapus</button></div><div class="bar"><i style="width:${p}%"></i></div><div class="flex sp"><small style="color:var(--mut)">${t.c} / ${t.g} ${esc(t.u)} · ${p}%</small><div class="flex"><button class="icb" onclick="gAdj('${t.id}',-1)">−</button><button class="icb" onclick="gAdj('${t.id}',1)">+</button></div></div></div>`;
    }).join('')}
  <button class="btn o" onclick="gLeave()">Keluar dari grup</button>`;
}
// Membuat grup baru dengan kode acak 6 karakter.
async function gCreate() {
    const n = $('#gn').value.trim().slice(0, 60);
    if (!n)
        return toast('Isi nama grup');
    const code = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
    try {
        await db.collection('groups').doc(code).set({
            name: n,
            owner: uid,
            created: Date.now(),
            members: {},
            targets: {}
        });
        D.group = { code, name: n };
        save();
        famListen();
        pubStats();
        render();
        toast('Grup dibuat');
    } catch (e) {
        toast('Gagal membuat grup. Periksa aturan Firestore');
    }
}
// Bergabung ke grup dengan kode.
async function gJoin() {
    const c = $('#gc').value.trim().toUpperCase();
    if (!RE_CODE.test(c))
        return toast('Kode harus 6 karakter');
    try {
        const s = await db.collection('groups').doc(c).get();
        if (!s.exists)
            return toast('Kode grup tidak ditemukan');
        const gd = sanitizeGroupDoc(s.data()), m = gd.members;
        if (Object.keys(m).length >= MAXM && !m[uid])
            return toast('Grup penuh (maks ' + MAXM + ' anggota)');
        D.group = { code: c, name: gd.name };
        save();
        famListen();
        pubStats();
        render();
        toast('Berhasil bergabung');
    } catch (e) {
        toast('Gagal bergabung. Periksa aturan Firestore');
    }
}
// Keluar dari grup.
function gLeave() {
    if (!confirm('Keluar dari grup ini?'))
        return;
    gref().update({ ['members.' + uid]: FV().delete() }).catch(() => {
    });
    D.group = null;
    save();
    famListen();
    render();
}
// Menambah target bersama.
function gAddT() {
    const t = $('#gt').value.trim().slice(0, 100), g = +$('#gg').value, u = $('#gu').value.trim().slice(0, 30) || 'kali';
    if (!t || g < 1)
        return toast('Isi nama dan jumlah target');
    const id = 't' + Date.now().toString(36), o = {
        t,
        g,
        u,
        c: 0,
        by: D.name
    };
    if (gDoc) {
        (gDoc.targets = gDoc.targets || {})[id] = o;
    }
    render();
    gref().update({ ['targets.' + id]: o }).catch(() => toast('Gagal menambah target'));
}
// Mengubah progres target bersama (dikirim bertahap agar hemat tulis).
function gAdj(id, n) {
    const t = gDoc && gDoc.targets && gDoc.targets[id];
    if (!t)
        return;
    n = Math.max(-t.c, n);
    if (!n)
        return;
    t.c += n;
    gPend[id] = (gPend[id] || 0) + n;
    render();
    clearTimeout(gTm);
    gTm = setTimeout(() => {
        const u = {};
        for (const k in gPend)
            if (gPend[k])
                u['targets.' + k + '.c'] = FV().increment(gPend[k]);
        gPend = {};
        if (Object.keys(u).length)
            gref().update(u).catch(() => {
            });
    }, 1500);
}
// Menghapus target bersama.
function gDelT(id) {
    if (!confirm('Hapus target bersama ini?'))
        return;
    if (gDoc && gDoc.targets)
        delete gDoc.targets[id];
    render();
    gref().update({ ['targets.' + id]: FV().delete() }).catch(() => {
    });
}
