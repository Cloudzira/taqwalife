/* ==========================================================================
 * TaqwaLife - Ibadah tambahan buatan pengguna
 * Menambah, mengubah, dan menghapus ibadah/amal di luar daftar bawaan.
 * ========================================================================== */

// Template ibadah tambahan: [nama, kategori, poin].
const CPS = [['Tahiyatul masjid', 1, 3], ['Sholat istikharah', 1, 5], ['Menjaga wudhu', 1, 3], ['Dzikir setelah sholat', 2, 3], ['Baca Al-Mulk sebelum tidur', 2, 5], ['Sholawat 100x', 2, 3], ['Silaturahmi', 3, 5], ['Menjenguk orang sakit', 3, 5]];
// Mengisi form ibadah tambahan dari template.
function preCI(i) {
    $('#cin').value = CPS[i][0];
    $('#cig').value = String(CPS[i][1]);
    $('#cip').value = String(CPS[i][2]);
}
// Menambah ibadah tambahan.
function addCI() {
    const n = $('#cin').value.trim();
    if (!n)
        return toast('Isi nama ibadah atau amal');
    if ((D.ci || []).filter(c => !c.e).length >= 30)
        return toast('Maksimal 30 ibadah tambahan');
    D.ci = D.ci || [];
    D.ci.push({
        id: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 99),
        g: +$('#cig').value,
        n: n.slice(0, 50),
        p: +$('#cip').value,
        d: key(new Date())
    });
    save();
    render();
    toast('Ibadah ditambahkan. Barakallahu fiik');
}
// Mengubah nama ibadah tambahan.
function editCI(id) {
    const c = D.ci.find(x => x.id === id);
    if (!c)
        return;
    const n = prompt('Ubah nama ibadah:', c.n);
    if (n && n.trim()) {
        c.n = n.trim().slice(0, 50);
        save();
        render();
    }
}
// Menghapus ibadah tambahan (riwayat lama tetap tersimpan).
function delCI(id) {
    const c = D.ci.find(x => x.id === id);
    if (!c || !confirm('Hapus "' + c.n + '" dari daftar? Riwayat sebelumnya tetap tersimpan.'))
        return;
    if (c.d >= key(new Date()))
        D.ci = D.ci.filter(x => x.id !== id);
    else
        c.e = key(new Date());
    save();
    render();
}
