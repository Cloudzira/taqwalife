/* ==========================================================================
 * TaqwaLife - Jadwal sholat
 * Daftar kota dan perhitungan jadwal sholat langsung di perangkat (tanpa API).
 * ========================================================================== */

// Daftar kota: [nama, lintang, bujur, zona waktu].
const CITIES = [['Jakarta', -6.2088, 106.8456, 7], ['Bogor', -6.5944, 106.7892, 7], ['Bekasi', -6.2383, 106.9756, 7], ['Tangerang', -6.1783, 106.63, 7], ['Serang', -6.12, 106.15, 7], ['Bandung', -6.9175, 107.6191, 7], ['Cirebon', -6.7063, 108.557, 7], ['Tegal', -6.8694, 109.1402, 7], ['Pekalongan', -6.8886, 109.6753, 7], ['Purwokerto', -7.4242, 109.2396, 7], ['Cilacap', -7.7264, 109.0147, 7], ['Semarang', -6.9667, 110.4167, 7], ['Surakarta (Solo)', -7.5755, 110.8243, 7], ['Yogyakarta', -7.7956, 110.3695, 7], ['Surabaya', -7.2575, 112.7521, 7], ['Malang', -7.9666, 112.6326, 7], ['Banda Aceh', 5.5483, 95.3238, 7], ['Medan', 3.5952, 98.6722, 7], ['Padang', -0.9471, 100.4172, 7], ['Pekanbaru', 0.5071, 101.4478, 7], ['Batam', 1.0456, 104.0305, 7], ['Jambi', -1.6101, 103.6131, 7], ['Palembang', -2.9761, 104.7754, 7], ['Bengkulu', -3.8004, 102.2655, 7], ['Bandar Lampung', -5.45, 105.2667, 7], ['Pontianak', -0.0263, 109.3425, 7], ['Banjarmasin', -3.3194, 114.5908, 8], ['Balikpapan', -1.2379, 116.8529, 8], ['Samarinda', -0.5022, 117.1536, 8], ['Denpasar', -8.65, 115.2167, 8], ['Mataram', -8.5833, 116.1167, 8], ['Makassar', -5.1477, 119.4327, 8], ['Palu', -0.9, 119.8707, 8], ['Kendari', -3.9985, 122.5129, 8], ['Gorontalo', 0.5435, 123.0568, 8], ['Manado', 1.4748, 124.8421, 8], ['Kupang', -10.1772, 123.607, 8], ['Ambon', -3.6954, 128.1814, 9], ['Jayapura', -2.5337, 140.7181, 9]];
// Menyimpan kota atau lokasi GPS untuk jadwal sholat.
function setCity() {
    const v = $('#ci').value;
    if (v === 'gps') {
        if (!navigator.geolocation)
            return toast('GPS tidak tersedia');
        return navigator.geolocation.getCurrentPosition(p => {
            D.city = 'Lokasi saya';
            D.loc = [p.coords.latitude, p.coords.longitude, -new Date().getTimezoneOffset() / 60];
            D.pt = null;
            save();
            loadPT();
            render();
            toast('Lokasi disimpan');
        }, () => toast('Izin lokasi diperlukan'));
    }
    const c = CITIES.find(x => x[0] === v);
    if (!c)
        return;
    D.city = c[0];
    D.loc = [c[1], c[2], c[3]];
    D.pt = null;
    save();
    loadPT();
    render();
    toast('Kota disimpan');
}
// Koordinat lokasi aktif [lintang, bujur, zona waktu].
const locOf = () => {
    if (D.loc)
        return D.loc;
    const c = CITIES.find(x => x[0] === D.city) || CITIES[9];
    return [c[1], c[2], c[3]];
};
/* Jadwal sholat dihitung di perangkat: tanpa API, tanpa batas kuota, jalan offline. Metode Kemenag (Subuh 20°, Isya 18°, Ashar mazhab Syafii, ihtiyath +2 menit) */
// Menghitung 5 waktu sholat (metode Kemenag) untuk tanggal & lokasi tertentu.
function calcPT(date, lat, lon, tz) {
    const R = Math.PI / 180, sin = x => Math.sin(x * R), cos = x => Math.cos(x * R), tan = x => Math.tan(x * R), asin = x => Math.asin(x) / R, acos = x => Math.acos(x) / R, atan2 = (y, x) => Math.atan2(y, x) / R, acot = x => Math.atan(1 / x) / R, fx = (a, b) => a - b * Math.floor(a / b);
    let Y = date.getFullYear(), M = date.getMonth() + 1;
    const d = date.getDate();
    if (M <= 2) {
        Y--;
        M += 12;
    }
    const A = Math.floor(Y / 100), B = 2 - A + Math.floor(A / 4);
    const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 - lon / 360;
    const sp = t => {
        const Dd = jd + t - 2451545, g = fx(357.529 + 0.98560028 * Dd, 360), q = fx(280.459 + 0.98564736 * Dd, 360), L = fx(q + 1.915 * sin(g) + 0.020 * sin(2 * g), 360), e = 23.439 - 0.00000036 * Dd, RA = fx(atan2(cos(e) * sin(L), cos(L)) / 15, 24);
        return { dec: asin(sin(e) * sin(L)), eqt: q / 15 - RA };
    };
    const mid = t => fx(12 - sp(t).eqt, 24);
    const at = (a, t, ccw) => {
        const dec = sp(t).dec, v = acos((-sin(a) - sin(dec) * sin(lat)) / (cos(dec) * cos(lat))) / 15;
        return mid(t) + (ccw ? -v : v);
    };
    const asr = t => at(-acot(1 + tan(Math.abs(lat - sp(t).dec))), t, false);
    const f = h => {
        const m = Math.round(fx(h + tz - lon / 15, 24) * 60 + 2) % 1440;
        return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    };
    return [at(20, 5 / 24, true), mid(.5), asr(13 / 24), at(.833, 18 / 24, false), at(18, 18 / 24, false)].map(f);
}
// Memuat/menghitung jadwal sholat hari ini bila belum ada.
function loadPT() {
    const k = key(new Date()) + D.city;
    if (D.pt && D.pt.k === k)
        return;
    const [la, lo, tz] = locOf(), t = calcPT(new Date(), la, lo, tz);
    D.pt = { k, t: [['Subuh', t[0]], ['Dzuhur', t[1]], ['Ashar', t[2]], ['Maghrib', t[3]], ['Isya', t[4]]] };
    lss('taqwalife_v1_' + uid, JSON.stringify(D));
    if (tab === 'home' && $('#app').style.display === 'block')
        render();
}
// Teks hitung mundur menuju sholat berikutnya.
function nxi() {
    if (!D.pt)
        return '';
    const n = new Date(), m = n.getHours() * 60 + n.getMinutes();
    let r = null;
    for (const [k, v] of D.pt.t) {
        const [h, mm] = v.split(':'), x = +h * 60 + +mm;
        if (x > m) {
            r = [k, x - m];
            break;
        }
    }
    if (!r) {
        const [h, mm] = D.pt.t[0][1].split(':');
        r = [D.pt.t[0][0], 1440 - m + +h * 60 + +mm];
    }
    return `<p style="margin-bottom:10px;color:var(--mut)">${r[0]} dalam <b style="color:var(--gold)">${r[1] >= 60 ? Math.floor(r[1] / 60) + ' jam ' : ''}${r[1] % 60} menit</b></p>`;
}
