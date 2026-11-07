/* ==========================================================================
 * TaqwaLife - Notifikasi & pengingat
 * Pemeriksaan berkala (tick) untuk memunculkan notifikasi pengingat, agenda, kajian, dan waktu sholat.
 * ========================================================================== */

// Mencatat notifikasi yang sudah dibunyikan agar tidak berulang.
let fired = {};
// Menampilkan satu notifikasi sistem.
function notify(m) {
    const o = { body: m, icon: 'icon-192.png', badge: 'icon-192.png' };
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller)
        navigator.serviceWorker.ready.then(r => r.showNotification('TaqwaLife', o));
    else
        try {
            new Notification('TaqwaLife', o);
        } catch (e) {
        }
}
// Dijalankan tiap 20 detik: cek apakah ada pengingat yang harus berbunyi.
function tick() {
    if ($('#app').style.display !== 'block')
        return;
    const n = new Date(), hm = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0'), k = key(n) + hm, mn = n.getHours() * 60 + n.getMinutes(), AG = [];
    ((D.ag || {})[key(n)] || []).forEach(a => {
        const r = a.r ?? 0;
        if (a.d || r < 0)
            return;
        const [h, m] = a.t.split(':'), df = mn - (+h * 60 + +m - r), fk = 'a' + key(n) + a.id;
        if (df >= 0 && df <= 2 && !fired[fk]) {
            fired[fk] = 1;
            AG.push((r > 0 ? 'Agenda ' + r + ' menit lagi: ' : 'Saatnya: ') + a.n);
        }
    });
    const L = [];
    if (D.notif && !fired[k]) {
        D.rm.filter(r => r.t === hm).forEach(r => L.push(r.l));
        (D.kj || []).filter(x => x.d === key(n) && x.w && addMin(x.w, -60) === hm).forEach(x => L.push('Kajian 1 jam lagi: ' + x.t));
        if (D.pt)
            D.pt.t.forEach(x => {
                if (x[1] === hm)
                    L.push('Waktu sholat ' + x[0] + ' telah tiba');
            });
        if (D.ir !== 0 && D.pt) {
            if (hm === addMin(D.pt.t[0][1], 30))
                L.push('Waktunya dzikir pagi');
            if (hm === addMin(D.pt.t[2][1], 15))
                L.push('Waktunya dzikir petang');
            if (n.getDay() === 5 && hm === addMin(D.pt.t[1][1], -90))
                L.push('Hari Jumat: perbanyak sholawat dan baca Surah Al-Kahfi');
        }
        if (L.length)
            fired[k] = 1;
    }
    if (D.notif)
        L.concat(AG).forEach(notify);
    else if (AG.length)
        toast(AG.join(' · '));
}
