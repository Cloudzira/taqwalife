/* ==========================================================================
 * TaqwaLife - Autentikasi (login, daftar, keluar) & boot aplikasi
 * Alur splash screen -> login -> masuk aplikasi, termasuk fungsi boot().
 * ========================================================================== */

// Penanda: splash screen selesai (splashDone) dan status login diketahui (au).
let splashDone = false, au;
// Memutuskan menampilkan halaman login atau aplikasi setelah splash selesai.
function route() {
    if (!splashDone || au === undefined)
        return;
    $('#splash').classList.add('hide');
    if (au)
        enterApp(au);
    else
        showAuth('in');
}
// Menyimpan event "beforeinstallprompt" untuk tombol Pasang Aplikasi.
let inst = null;
addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    inst = e;
    insBtn();
});
addEventListener('appinstalled', () => {
    inst = null;
    insBtn();
    toast('Aplikasi terpasang');
});
// Menampilkan tombol Pasang di header selama aplikasi belum dipasang.
function insBtn() {
    const b = $('#ins');
    if (b)
        b.style.display = (matchMedia('(display-mode: standalone)').matches || navigator.standalone) ? 'none' : '';
}
// Fungsi awal: pasang tema, jalankan splash, cek status login, pasang timer & service worker.
function boot() {
    setTheme(TH());
    insBtn();
    setTimeout(() => {
        splashDone = true;
        route();
    }, 1900);
    if (CFG)
        auth.onAuthStateChanged(u => {
            au = u || null;
            route();
        });
    else
        au = null;
    if ('Notification' in window)
        setInterval(tick, 20000);
    setInterval(() => {
        if (!document.hidden && $('#app').style.display === 'block') {
            loadPT();
            if (tab === 'home')
                render();
        }
    }, 60000);
    if ('serviceWorker' in navigator && location.protocol !== 'file:')
        navigator.serviceWorker.register('sw.js').catch(() => {
        });
}
// Menampilkan form Masuk / Daftar (m = "in" atau "reg").
function showAuth(m) {
    $('#app').style.display = 'none';
    $('#auth').style.display = 'flex';
    const reg = m === 'reg';
    let h = `<svg width="46" height="46"><use href="#fl"/></svg><div class="ar" style="font-size:22px;color:var(--gold2);line-height:1.6">السَّلَامُ عَلَيْكُمْ</div><h2>${reg ? 'Buat akun' : 'Assalamu\'alaikum'}</h2><p>${reg ? 'Mulai perjalanan ibadah yang lebih terencana.' : 'Masuk untuk melanjutkan amal yaumi Anda.'}</p>`;
    if (!CFG) {
        h += `<div class="warn">Firebase belum dikonfigurasi. Isi konfigurasi di bagian atas script untuk mengaktifkan login. Sementara Anda bisa memakai mode lokal.</div>
    <input id="an" placeholder="Nama Anda" maxlength="30"><button class="btn" onclick="startLocal()">Lanjut mode lokal</button>`;
    } else {
        h += `<div class="tabs"><button class="${reg ? '' : 'on'}" onclick="showAuth('in')">Masuk</button><button class="${reg ? 'on' : ''}" onclick="showAuth('reg')">Daftar</button></div>
    ${reg ? '<input id="an" placeholder="Nama lengkap" maxlength="30" autocomplete="name">' : ''}
    <input id="ae" type="email" placeholder="Email" autocomplete="email"><input id="ap" type="password" placeholder="Kata sandi (min. 6 karakter)" autocomplete="${reg ? 'new-password' : 'current-password'}" onkeydown="if(event.key==='Enter')doAuth('${m}')">
    <button class="btn" onclick="doAuth('${m}')">${reg ? 'Daftar sekarang' : 'Masuk'}</button>
    <button class="btn o" onclick="google()">Lanjut dengan Google</button>
    ${reg ? '' : '<button class="lnk" onclick="forgot()">Lupa kata sandi?</button>'}`;
    }
    $('#authBox').innerHTML = h;
}
// Terjemahan kode error Firebase ke pesan bahasa Indonesia.
const ERR = {
    'auth/invalid-email': 'Format email tidak valid',
    'auth/user-not-found': 'Akun tidak ditemukan',
    'auth/wrong-password': 'Kata sandi salah',
    'auth/invalid-credential': 'Email atau kata sandi salah',
    'auth/email-already-in-use': 'Email sudah terdaftar, silakan masuk',
    'auth/weak-password': 'Kata sandi minimal 6 karakter',
    'auth/missing-password': 'Kata sandi belum diisi',
    'auth/network-request-failed': 'Tidak ada koneksi internet',
    'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
    'auth/popup-closed-by-user': 'Login Google dibatalkan'
};
// Proses masuk atau daftar dengan email dan kata sandi.
async function doAuth(m) {
    const e = $('#ae').value.trim(), p = $('#ap').value;
    try {
        if (m === 'reg') {
            const n = $('#an').value.trim();
            if (!n)
                return toast('Nama wajib diisi');
            pendingName = n;
            const r = await auth.createUserWithEmailAndPassword(e, p);
            await r.user.updateProfile({ displayName: n });
        } else
            await auth.signInWithEmailAndPassword(e, p);
    } catch (x) {
        toast(ERR[x.code] || 'Terjadi kesalahan: ' + (x.code || x.message));
    }
}
// Masuk dengan akun Google (popup).
async function google() {
    try {
        await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    } catch (x) {
        if (x.code === 'auth/popup-blocked' || x.code === 'auth/operation-not-supported-in-this-environment')
            return auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider()).catch(() => toast('Login Google gagal'));
        if (x.code === 'auth/cancelled-popup-request')
            return;
        toast(ERR[x.code] || 'Login Google gagal');
    }
}
// Mengirim email reset kata sandi.
async function forgot() {
    const e = $('#ae').value.trim();
    if (!e)
        return toast('Isi email dulu');
    try {
        await auth.sendPasswordResetEmail(e);
        toast('Tautan reset dikirim ke email Anda');
    } catch (x) {
        toast(ERR[x.code] || 'Gagal mengirim email');
    }
}
// Masuk tanpa login (mode lokal, data hanya di perangkat).
function startLocal() {
    au = { uid: 'local', displayName: $('#an').value.trim() || 'Sahabat' };
    route();
}
// Keluar dari akun (data disinkronkan dulu).
async function logout() {
    await syncCloud(true);
    if (CFG)
        auth.signOut().then(() => location.reload());
    else
        location.reload();
}
// Masuk ke aplikasi setelah login: muat data lalu tampilkan beranda.
async function enterApp(u) {
    uid = u.uid;
    await loadData();
    D.name = D.name || pendingName || u.displayName || (u.email || 'Sahabat').split('@')[0];
    save();
    $('#auth').style.display = 'none';
    $('#app').style.display = 'block';
    nav();
    go('home');
    loadPT();
    famListen();
}
