/* ==========================================================================
 * TaqwaLife - Penyimpanan data (lokal + cloud)
 * Data disimpan di perangkat lebih dulu (localStorage), lalu disinkronkan ke Firestore secara hemat kuota.
 * ========================================================================== */

// Jeda minimal sinkron (6 jam) dan baca cloud (12 jam) agar hemat kuota gratis.
const SYNC_MS = 6 * 36e5, READ_MS = 12 * 36e5;
// 1 bila ada perubahan yang belum dikirim ke cloud.
let dirty = 0;
// Baca localStorage dengan aman (tidak error bila diblokir).
const lsg = k => {
    try {
        return localStorage.getItem(k);
    } catch (e) {
        return null;
    }
};
// Tulis localStorage dengan aman (tidak error bila penuh/diblokir).
const lss = (k, v) => {
    try {
        localStorage.setItem(k, v);
    } catch (e) {
    }
};
// Membuang data lama agar ukuran data tidak membengkak.
function prune() {
    const lim = new Date();
    lim.setDate(lim.getDate() - 400);
    const lk = key(lim);
    for (const k in D.days)
        if (k < lk)
            delete D.days[k];
    if (D.nt.length > 300)
        D.nt.length = 300;
    const la = new Date();
    la.setDate(la.getDate() - 120);
    const ak = key(la);
    for (const k in D.ag)
        if (k < ak || !D.ag[k].length)
            delete D.ag[k];
    for (const k in D.agr)
        if (k < ak)
            delete D.agr[k];
}
// Memadatkan data D menjadi teks JSON ringkas untuk dikirim ke cloud.
function pack() {
    const o = Object.assign({}, D), days = {};
    for (const k in D.days) {
        const v = D.days[k], m = ALL.reduce((a, x, i) => a | (v[x[0]] ? 1 << i : 0), 0);
        if (m)
            days[k] = m;
    }
    o.days = days;
    o.pk = 1;
    delete o.pt;
    const cx = {};
    for (const k in D.days) {
        const ids = (D.ci || []).filter(c => D.days[k][c.id]).map(c => c.id);
        if (ids.length)
            cx[k] = ids;
    }
    o.cx = cx;
    const l30 = key(new Date(Date.now() - 30 * 864e5)), ag = {}, agr = {};
    for (const k in D.ag)
        if (k >= l30 && D.ag[k].length)
            ag[k] = D.ag[k].map(a => [a.t, a.n, a.c, a.d, a.r ?? 0]);
    for (const k in D.agr)
        if (k >= l30)
            agr[k] = D.agr[k];
    o.ag = ag;
    o.agr = agr;
    return JSON.stringify(o);
}
// Kebalikan pack(): mengubah teks dari cloud menjadi objek data lengkap.
function unpack(j) {
    const o = JSON.parse(j);
    if (o.pk) {
        const days = {};
        for (const k in o.days) {
            if (!RE_DATE.test(k))
                continue;
            const m = o.days[k], v = {};
            ALL.forEach((x, i) => {
                if (m & (1 << i))
                    v[x[0]] = 1;
            });
            days[k] = v;
        }
        o.days = days;
    }
    if (o.cx) {
        for (const k in o.cx) {
            if (!RE_DATE.test(k))
                continue;
            const v = (o.days[k] = o.days[k] || {});
            o.cx[k].forEach(id => {
                if (sId(id))
                    v[id] = 1;
            });
        }
        delete o.cx;
    }
    if (o.ag)
        for (const k in o.ag)
            o.ag[k] = o.ag[k].map((a, i) => Array.isArray(a) ? {
                id: 'a' + k.replace(/-/g, '') + i,
                t: a[0],
                n: a[1],
                c: a[2],
                d: a[3],
                r: a[4] ?? 0
            } : a);
    delete o.pk;
    return o;
}
// Menyimpan data ke perangkat dan menandai perlu sinkron ke cloud.
function save() {
    D._ts = Date.now();
    prune();
    lss('taqwalife_v1_' + uid, JSON.stringify(D));
    if (db && uid !== 'local')
        dirty = 1;
}
// Mengirim data ke cloud bila ada perubahan dan jeda minimal terpenuhi.
async function syncCloud(force) {
    if (!dirty || !db || uid === 'local' || !navigator.onLine)
        return;
    if (!force && Date.now() - (+lsg('tl_w_' + uid) || 0) < SYNC_MS)
        return;
    dirty = 0;
    try {
        await db.collection('users').doc(uid).set({ data: pack() }, { merge: true });
        lss('tl_w_' + uid, Date.now());
        lss('tl_r_' + uid, Date.now());
        pubStats();
    } catch (e) {
        dirty = 1;
    }
}
document.addEventListener('visibilitychange', () => {
    if (document.hidden)
        syncCloud();
});
addEventListener('pagehide', () => syncCloud());
setInterval(() => syncCloud(), 10 * 60 * 1000);
// Memuat data pengguna dari perangkat dan/atau cloud, lalu memilih yang terbaru.
async function loadData() {
    let l = null, c = null;
    try {
        l = JSON.parse(lsg('taqwalife_v1_' + uid) || lsg('muslimlife_v2_' + uid));
    } catch (e) {
    }
    const need = !l || Date.now() - (+lsg('tl_r_' + uid) || 0) > READ_MS;
    if (db && uid !== 'local' && navigator.onLine && need) {
        try {
            const s = await db.collection('users').doc(uid).get();
            if (s.exists && s.data().data)
                c = unpack(s.data().data);
            lss('tl_r_' + uid, Date.now());
        } catch (e) {
        }
    }
    D = sanitizeData((c && (!l || (c._ts || 0) >= (l._ts || 0))) ? c : (l || {}));
    if (c && l && (l._ts || 0) > (c._ts || 0))
        dirty = 1;
}
// Sinkron manual (dibatasi 1x per 2 menit).
async function syncNow() {
    if (uid === 'local' || !db)
        return toast('Mode lokal tidak disinkronkan');
    if (Date.now() - (+lsg('tl_m_' + uid) || 0) < 120000)
        return toast('Tunggu 2 menit sebelum sinkron lagi');
    lss('tl_m_' + uid, Date.now());
    dirty = 1;
    await syncCloud(true);
    toast('Tersinkron ke cloud');
    render();
}
// Teks keterangan status sinkronisasi untuk halaman Akun.
const syncInfo = () => uid === 'local' ? 'Mode lokal: data hanya di perangkat ini.' : (+lsg('tl_w_' + uid) ? 'Terakhir tersinkron: ' + new Date(+lsg('tl_w_' + uid)).toLocaleString('id-ID') : 'Otomatis tersinkron saat aplikasi ditutup atau berjalan beberapa jam.');
