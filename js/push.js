/* ==========================================================================
 * TaqwaLife - Notifikasi push & pasang aplikasi (PWA)
 * Mengaktifkan push notification dan tombol pasang aplikasi.
 * ========================================================================== */

// Menyalakan/mematikan notifikasi push.
async function togglePush() {
    if (D.push) {
        D.push = 0;
        save();
        if (db && uid !== 'local')
            db.collection('users').doc(uid).set({ token: null }, { merge: true }).catch(() => {
            });
        return render();
    }
    if (!msg || uid === 'local')
        return toast('Push butuh login Firebase dan browser yang mendukung');
    if (VAPID === 'ISI_VAPID_KEY')
        return toast('Isi VAPID key di bagian konfigurasi dulu');
    try {
        if (await Notification.requestPermission() !== 'granted')
            return toast('Izin notifikasi ditolak');
        const reg = await navigator.serviceWorker.ready, token = await msg.getToken({ vapidKey: VAPID, serviceWorkerRegistration: reg });
        await db.collection('users').doc(uid).set({ token }, { merge: true });
        D.push = 1;
        D.notif = 1;
        save();
        render();
        toast('Push aktif');
    } catch (e) {
        toast('Gagal mengaktifkan push');
    }
}
// Menjalankan dialog pasang aplikasi.
async function pasang() {
    if (!inst)
        return toast('Buka menu browser lalu pilih Tambahkan ke layar utama (iPhone: Bagikan, lalu Tambah ke Layar Utama)');
    inst.prompt();
    await inst.userChoice;
    inst = null;
    insBtn();
}
