/* ==========================================================================
 * TaqwaLife - Keamanan data (validasi & pembersihan input)
 * Semua data dari luar (localStorage, cloud, file cadangan, dokumen grup)
 * dianggap TIDAK DIPERCAYA. Sebelum dipakai, data dibangun ulang field demi
 * field dengan tipe & format yang ketat. Ini mencegah XSS (script berbahaya
 * lewat nama/id), serta prototype pollution lewat file cadangan palsu.
 * Tampilan dan fitur aplikasi tidak berubah: data yang sah lolos apa adanya.
 * ========================================================================== */

// Format yang diizinkan
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;           // 2026-11-07
const RE_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;     // 06:30
const RE_ID = /^[A-Za-z0-9_-]{1,40}$/;           // id item (huruf, angka, _ dan -)
const RE_UID = /^[A-Za-z0-9_-]{1,128}$/;         // id pengguna Firebase
const RE_CODE = /^[A-Z0-9]{6}$/;                 // kode grup keluarga
const PT_NAMES = ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'];

// ---- Pembersih nilai tunggal ----
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
// Teks bebas (tetap di-escape saat ditampilkan), dibatasi panjangnya.
const sStr = (v, max = 200) => typeof v === 'string' ? v.slice(0, max) : '';
// Teks yang mungkin ditampilkan tanpa escape: buang karakter HTML berbahaya.
const sSafe = (v, max = 100) => sStr(v, max).replace(/[<>&"'`]/g, '');
const sNum = (v, def = 0, min = -1e9, max = 1e9) => {
    v = +v;
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
};
const sFlag = v => v ? 1 : 0;
const sDate = v => typeof v === 'string' && RE_DATE.test(v) ? v : null;
const sTime = v => typeof v === 'string' && RE_TIME.test(v) ? v : null;
const sId = v => typeof v === 'string' && RE_ID.test(v) && v !== '__proto__' ? v : null;
const sArr = (v, max) => Array.isArray(v) ? v.slice(0, max) : [];

// Memetakan objek { kunci: nilai } dengan memeriksa kunci dan nilainya.
function sMap(v, okKey, mapVal, maxKeys) {
    const out = {};
    if (!isObj(v)) return out;
    let n = 0;
    for (const k of Object.keys(v)) {
        if (n >= maxKeys) break;
        if (k === '__proto__' || !okKey(k)) continue;
        const val = mapVal(v[k]);
        if (val !== undefined) { out[k] = val; n++; }
    }
    return out;
}

// ---- Pembersih per bagian data ----
function sAgendaItem(a) {
    if (!isObj(a)) return undefined;
    const id = sId(a.id), t = sTime(a.t);
    if (!id || !t) return undefined;
    return { id, t, n: sStr(a.n, 60), c: a.c === 'i' ? 'i' : 'a', d: sFlag(a.d), r: sNum(a.r, 0, -1, 1440) };
}

function sKajian(k) {
    if (!isObj(k)) return null;
    const id = sId(k.id), d = sDate(k.d);
    if (!id || !d) return null;
    return {
        id, d,
        t: sStr(k.t, 100), s: sStr(k.s, 80), p: sStr(k.p, 100), n: sStr(k.n, 1500),
        w: k.w ? (sTime(k.w) || '') : '',
        q: sArr(k.q, 10).filter(isObj).map(x => ({ x: sStr(x.x, 150), a: sFlag(x.a) }))
    };
}

function sPrayerCache(pt) {
    if (!isObj(pt) || typeof pt.k !== 'string' || !Array.isArray(pt.t) || pt.t.length !== 5) return null;
    const t = [];
    for (let i = 0; i < 5; i++) {
        const row = pt.t[i], time = Array.isArray(row) ? sTime(row[1]) : null;
        if (!time) return null;
        t.push([PT_NAMES[i], time]);
    }
    return { k: sSafe(pt.k, 80), t };
}

/**
 * Membangun ulang objek data pengguna (D) dari data mentah apa pun.
 * Mengembalikan objek lengkap dengan semua field bawaan.
 */
function sanitizeData(raw) {
    const base = defaults();
    if (!isObj(raw)) return base;
    const o = base;

    o.name = sStr(raw.name, 60);
    o.sp = sStr(raw.sp, 20);
    o.city = sStr(raw.city, 60) || base.city;
    o.notif = sFlag(raw.notif);
    o.push = sFlag(raw.push);
    o.ir = raw.ir === 0 ? 0 : 1;
    o.tasbih = sNum(raw.tasbih, 0, 0, 1e9);
    o.best = sNum(raw.best, 0, 0, 1e5);
    o._ts = sNum(raw._ts, 0, 0, 1e15);
    o.loc = Array.isArray(raw.loc) && raw.loc.length === 3 && raw.loc.every(x => Number.isFinite(+x))
        ? raw.loc.map(Number) : null;
    o.pt = sPrayerCache(raw.pt);

    // Riwayat centang harian: { tanggal: { idIbadah: 1 } }
    o.days = sMap(raw.days, k => RE_DATE.test(k),
        v => sMap(v, k => RE_ID.test(k), x => x ? 1 : undefined, 200), 800);

    o.tg = sArr(raw.tg, 200).filter(isObj).map(x => ({
        t: sStr(x.t, 100), g: sNum(x.g, 1, 1, 1e9), u: sStr(x.u, 30), c: sNum(x.c, 0, 0, 1e9)
    }));
    o.nt = sArr(raw.nt, 300).filter(isObj).map(x => ({ d: sSafe(x.d, 80), x: sStr(x.x, 5000) }));
    o.rm = sArr(raw.rm, 100).filter(isObj).map(x => ({ t: sTime(x.t), l: sStr(x.l, 100) })).filter(x => x.t);
    o.hf = sArr(raw.hf, 300).filter(isObj).map(x => ({
        s: sStr(x.s, 100), a: sStr(x.a, 100) || '-', st: sNum(x.st, 0, 0, 2),
        r: sDate(x.r), d: sDate(x.d) || key(new Date())
    }));
    o.ch = sArr(raw.ch, 20).filter(isObj).map(x => ({
        n: sStr(x.n, 100), len: sNum(x.len, 7, 1, 366), s: sDate(x.s) || key(new Date()),
        done: sMap(x.done, k => RE_DATE.test(k), v => v ? 1 : undefined, 400)
    }));
    o.ag = sMap(raw.ag, k => RE_DATE.test(k), v => sArr(v, 40).map(sAgendaItem).filter(Boolean), 400);
    o.agt = Array.isArray(raw.agt)
        ? raw.agt.slice(0, 40).filter(a => Array.isArray(a) && sTime(a[0]))
            .map(a => [a[0], sStr(a[1], 60), a[2] === 'i' ? 'i' : 'a', sNum(a[3], 0, -1, 1440)])
        : null;
    o.agr = sMap(raw.agr, k => RE_DATE.test(k), v => {
        if (!isObj(v)) return undefined;
        const r = {};
        if ('s' in v) r.s = sNum(v.s, 0, 0, 5);
        if ('n' in v) r.n = sStr(v.n, 600);
        return r;
    }, 400);
    o.kj = sArr(raw.kj, 80).map(sKajian).filter(Boolean);
    o.ci = sArr(raw.ci, 200).filter(isObj).map(x => {
        const id = sId(x.id), d = sDate(x.d);
        if (!id || !d) return null;
        const c = { id, g: sNum(x.g, 1, 1, 3), n: sStr(x.n, 50), p: sNum(x.p, 3, 1, 100), d };
        if (x.e) c.e = sDate(x.e) || undefined;
        return c;
    }).filter(Boolean);
    o.group = isObj(raw.group) && RE_CODE.test(String(raw.group.code))
        ? { code: String(raw.group.code), name: sStr(raw.group.name, 60) } : null;
    return o;
}

/**
 * Membersihkan dokumen grup keluarga dari Firestore. Data ini ditulis oleh
 * anggota lain, jadi tidak boleh dipercaya begitu saja.
 */
function sanitizeGroupDoc(d) {
    if (!isObj(d)) return { name: '', members: {}, targets: {} };
    return {
        name: sStr(d.name, 60),
        owner: typeof d.owner === 'string' && RE_UID.test(d.owner) ? d.owner : '',
        members: sMap(d.members, k => RE_UID.test(k), m => isObj(m) ? {
            n: sStr(m.n, 60), w: sNum(m.w, 0, 0, 1e9), s: sNum(m.s, 0, 0, 1e5),
            t: sNum(m.t, 0, 0, 1e9), ts: sNum(m.ts, 0, 0, 1e15)
        } : undefined, 60),
        targets: sMap(d.targets, k => RE_ID.test(k), t => isObj(t) ? {
            t: sStr(t.t, 100), g: sNum(t.g, 1, 1, 1e9), u: sStr(t.u, 30),
            c: sNum(t.c, 0, 0, 1e9), by: sStr(t.by, 60)
        } : undefined, 100)
    };
}
