/* ==========================================================================
 * TaqwaLife - Aksi pengguna (centang, tambah, hapus)
 * Fungsi yang dipanggil saat tombol ditekan: mencatat ibadah, menambah target, catatan, pengingat, dll.
 * ========================================================================== */

// Geser tanggal checklist sebanyak n hari.
function shift(n) {
    cur.setDate(cur.getDate() + n);
    render();
}
// Centang / batal centang ibadah id pada tanggal terpilih.
function tg(id) {
    const d = day(key(cur));
    d[id] = d[id] ? 0 : 1;
    D.best = best();
    save();
    render();
    if (d[id] && pct(key(cur)) === 100)
        toast('MasyaAllah, semua amalan selesai! 🌟');
    else if (d[id])
        toast('Barakallahu fiik, amalan tercatat');
}
// Menambah target baru.
function addT() {
    const t = $('#tt').value.trim().slice(0, 100), g = +$('#tgl').value, u = $('#tu').value.trim().slice(0, 30) || 'kali';
    if (!t || g < 1)
        return toast('Isi nama dan jumlah target');
    D.tg.push({
        t,
        g,
        u,
        c: 0
    });
    save();
    render();
}
// Mengubah progres target ke-i sebesar n.
function adj(i, n) {
    D.tg[i].c = Math.max(0, D.tg[i].c + n);
    save();
    render();
}
// Menghapus target ke-i.
function delT(i) {
    if (confirm('Hapus target ini?')) {
        D.tg.splice(i, 1);
        save();
        render();
    }
}
// Menyimpan catatan muhasabah baru.
function addN() {
    const x = $('#nt').value.trim().slice(0, 5000);
    if (!x)
        return toast('Catatan masih kosong');
    D.nt.unshift({ d: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }), x });
    save();
    render();
    toast('Catatan disimpan');
}
// Menghapus catatan ke-i.
function delN(i) {
    if (confirm('Hapus catatan ini?')) {
        D.nt.splice(i, 1);
        save();
        render();
    }
}
// Menambah hitungan tasbih (+1).
function tas() {
    D.tasbih = (D.tasbih || 0) + 1;
    save();
    if (navigator.vibrate)
        navigator.vibrate(D.tasbih % 33 === 0 ? [80, 40, 80] : 15);
    render();
}
// Menambah pengingat jam tertentu.
function addR() {
    const t = $('#rt').value, l = $('#rl').value.trim().slice(0, 100);
    if (!t || !l)
        return toast('Isi jam dan nama pengingat');
    D.rm.push({ t, l });
    save();
    render();
}
// Menghapus pengingat ke-i.
function delR(i) {
    D.rm.splice(i, 1);
    save();
    render();
}
// Menyalakan / mematikan notifikasi.
async function toggleNotif() {
    if (D.notif) {
        D.notif = 0;
        save();
        return render();
    }
    if (!('Notification' in window))
        return toast('Browser tidak mendukung notifikasi');
    const p = await Notification.requestPermission();
    if (p === 'granted') {
        D.notif = 1;
        save();
        render();
        toast('Notifikasi aktif');
    } else
        toast('Izin notifikasi ditolak');
}
