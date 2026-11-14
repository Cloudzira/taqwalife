/* ==========================================================================
 * TaqwaLife - Tampilan halaman (HTML template)
 * Objek V berisi fungsi pembuat HTML untuk tiap halaman: beranda, ibadah, target, jurnal, dan menu Lainnya.
 * ========================================================================== */

// Lingkaran progres (SVG) untuk persentase p.
function ring(p, s = 104) {
    const r = s / 2 - 8, c = 2 * Math.PI * r;
    return `<svg width="${s}" height="${s}" style="flex:none"><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" style="stroke:var(--rt)" stroke-width="8"/><circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="none" style="stroke:var(--rg)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p / 100)}" transform="rotate(-90 ${s / 2} ${s / 2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#F4EFE0" font-size="20" font-family="Sora,sans-serif" font-weight="700">${p}%</text></svg>`;
}
// Sapaan sesuai jam (pagi/siang/sore/malam).
const greet = () => {
    const h = new Date().getHours();
    return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam';
};
// Nama bulan Hijriah (ditulis sendiri agar sama di semua HP; sebagian HP salah memakai nama bulan Masehi).
const HMN = ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadhan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah'];
// Tanggal Hijriah (kalender Umm al-Qura), contoh: 4 Jumadil Akhir 1448 H.
const hijri = d => {
    try {
        const p = {};
        new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d).forEach(x => p[x.type] = x.value);
        const m = +p.month, y = parseInt(p.year, 10);
        if (!(m >= 1 && m <= 12) || !y)
            return '';
        return +p.day + ' ' + HMN[m - 1] + ' ' + y + ' H';
    } catch (e) {
        return '';
    }
};
// Hari dalam bulan Hijriah (angka).
const hDay = d => {
    try {
        return +new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric' }).format(d);
    } catch (e) {
        return 0;
    }
};
// Nomor bulan Hijriah (9 = Ramadhan).
const hM = d => {
    try {
        return +new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric' }).format(d);
    } catch (e) {
        return 0;
    }
};
// Info puasa sunnah hari ini/besok (Senin, Kamis, Ayyamul Bidh).
function puasaInfo() {
    const t = new Date(), n = new Date(t);
    n.setDate(n.getDate() + 1);
    const f = d => {
        const w = d.getDay(), h = hDay(d);
        return w === 1 ? 'Senin' : w === 4 ? 'Kamis' : (h >= 13 && h <= 15) ? 'Ayyamul Bidh (perkiraan)' : '';
    };
    if (f(t))
        return 'Hari ini sunnah berpuasa: ' + f(t);
    if (f(n))
        return 'Besok sunnah berpuasa: ' + f(n) + '. Niatkan dari malam ini.';
    return '';
}
// Nama waktu sholat berikutnya.
function nextPrayer() {
    if (!D.pt)
        return null;
    const n = new Date(), m = n.getHours() * 60 + n.getMinutes();
    for (const [k, v] of D.pt.t) {
        const [h, mm] = v.split(':');
        if (+h * 60 + +mm > m)
            return k;
    }
    return D.pt.t[0][0];
}
// V = kumpulan fungsi tampilan; V.home(), V.ibadah(), dst. mengembalikan teks HTML.
const V = {
    home() {
        const k = key(new Date()), p = pct(k), L = level(), q = QUOTES[Math.floor(new Date() / 864e5) % QUOTES.length], np = nextPrayer(), pi = puasaInfo();
        const IT = itemsOn(k), doneN = IT.filter(x => (D.days[k] || {})[x[0]]).length;
        return `<div class="hero">${ring(p)}<div><small class="ar" style="font-size:19px;display:block;line-height:1.5">السَّلَامُ عَلَيْكُمْ</small><small>${greet()}</small><h2>${esc(dn())}</h2>
  <div class="chips"><span class="chip">🔥 ${streak()} hari</span><span class="chip">⭐ ${L.p} poin</span><span class="chip">${L.n}</span></div></div></div>
  <div class="sec"><div class="card"><b>${new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })}</b><br><small style="color:var(--mut)">${hijri(new Date())}</small>
  <div class="bar" style="margin-top:12px"><i style="width:${p}%"></i></div><small style="color:var(--mut)">${doneN} dari ${IT.length} amalan selesai hari ini</small><br>
  <div class="flex" style="margin-top:12px"><button class="btn sm" onclick="cur=new Date();go('ibadah')">Buka checklist hari ini</button><button class="btn sm o" onclick="shareProg()">Bagikan</button></div></div>
  ${pi ? `<div class="card" style="border-color:var(--gold)"><b style="color:var(--gold)">🌙 ${pi}</b></div>` : ''}${irem()}${agHome()}${kjHome()}${ramInfo()}${hafDue()}
  <div class="card"><h3>Jadwal Sholat · ${esc(D.city)}</h3>${nxi()}${D.pt ? `<div class="pt">${D.pt.t.map(x => `<div class="${x[0] === np ? 'nx' : ''}">${x[0]}<b>${x[1]}</b></div>`).join('')}</div>` : '<small style="color:var(--mut)">Memuat jadwal sholat… (butuh internet)</small>'}</div>
  <div class="card quote"><p>“${q[0]}”</p><small>${q[1]}</small></div>
  <div class="card"><h3>Level: ${L.n}</h3><div class="bar"><i style="width:${Math.min(100, (L.p % 600) / 6)}%"></i></div><small style="color:var(--mut)">${L.i < LV.length - 1 ? (L.next - L.p) + ' poin lagi menuju level berikutnya' : 'Level tertinggi. Teruslah istiqamah!'}</small></div></div>`;
    },
    ibadah() {
        const k = key(cur), d = day(k), isT = k === key(new Date()), cs = (D.ci || []).filter(c => k >= c.d && (!c.e || k < c.e));
        return `<div class="sec"><div class="card flex sp"><button class="icb" onclick="shift(-1)" aria-label="Hari sebelumnya">‹</button><div style="text-align:center"><b>${isT ? 'Hari ini' : cur.toLocaleDateString('id-ID', { weekday: 'long' })}</b><br><small style="color:var(--mut)">${cur.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} · ${pct(k)}%</small></div><button class="icb" onclick="shift(1)" aria-label="Hari berikutnya">›</button></div>
  ${G.map((g, gi) => `<div class="h">${g.n}</div><div class="card" style="padding:4px 14px">${g.i.map(x => `<button class="row ${d[x[0]] ? 'on' : ''}" onclick="tg('${x[0]}')"><span class="ck">${d[x[0]] ? '✓' : ''}</span><span class="t">${x[1]}${x[3] ? `<small>${x[3]}</small>` : ''}</span><span class="pts">+${x[2]}</span></button>`).join('')}${cs.filter(c => c.g === gi).map(c => `<div class="row ${d[c.id] ? 'on' : ''}"><button class="ck" onclick="tg('${c.id}')" aria-label="Tandai ${esc(c.n)}">${d[c.id] ? '✓' : ''}</button><span class="t" onclick="tg('${c.id}')" style="cursor:pointer">${esc(c.n)}<small>Tambahan saya</small></span><span class="pts">+${c.p}</span><button class="icb" onclick="editCI('${c.id}')" aria-label="Ubah nama" style="width:30px;height:30px;font-size:14px">✎</button><button class="icb" onclick="delCI('${c.id}')" aria-label="Hapus" style="width:30px;height:30px;color:var(--bad)">×</button></div>`).join('')}</div>`).join('')}
  <div class="h">Tambah ibadah / amal</div>
  <div class="card"><div class="flex" style="flex-wrap:wrap;margin-bottom:10px">${CPS.map((c, i) => `<button class="chip pc" onclick="preCI(${i})">${c[0]}</button>`).join('')}</div>
  <input id="cin" placeholder="Nama ibadah atau amal, misal: Sholat tahiyatul masjid" maxlength="50">
  <div class="flex" style="margin-top:8px"><select id="cig" aria-label="Kategori"><option value="1">Sholat Sunnah</option><option value="2">Al-Qur'an & Dzikir</option><option value="3">Amal Sosial & Ilmu</option></select><select id="cip" aria-label="Bobot poin"><option value="3">Ringan (+3)</option><option value="5" selected>Sedang (+5)</option><option value="8">Berat (+8)</option><option value="10">Tinggi (+10)</option></select></div>
  <button class="btn sm" style="margin-top:10px" onclick="addCI()">Tambah</button>
  <small style="color:var(--mut);display:block;margin-top:8px">Sholat wajib tetap dan tidak bisa ditambah atau diubah. Ibadah tambahan dihitung mulai hari ditambahkan dan ikut menentukan persentase harian.</small></div></div>`;
    },
    target() {
        return `<div class="sec"><div class="card"><h3>Tambah target baru</h3><div class="flex" style="flex-wrap:wrap;margin-bottom:10px">${PRE.map((p, i) => `<button class="chip pc" onclick="preT(${i})">${p[0]}</button>`).join('')}</div><input id="tt" placeholder="Contoh: Khatam Al-Qur'an"><div class="flex" style="margin-top:8px"><input id="tgl" type="number" min="1" placeholder="Jumlah target"><input id="tu" placeholder="Satuan (juz, hari)"></div><button class="btn sm" style="margin-top:10px" onclick="addT()">Simpan target</button></div>
  ${D.tg.length ? D.tg.map((t, i) => {
            const p = Math.min(100, Math.round(t.c / t.g * 100));
            return `<div class="card"><div class="flex sp"><b>${esc(t.t)}</b><button class="del" onclick="delT(${i})">Hapus</button></div><div class="bar"><i style="width:${p}%"></i></div><div class="flex sp"><small style="color:var(--mut)">${t.c} / ${t.g} ${esc(t.u)} · ${p}%</small><div class="flex"><button class="icb" onclick="adj(${i},-1)">−</button><button class="icb" onclick="adj(${i},1)">+</button></div></div>${p >= 100 ? '<small style="color:var(--gold);font-weight:700">Alhamdulillah, target tercapai! 🎉</small>' : ''}</div>`;
        }).join('') : '<div class="card" style="text-align:center;color:var(--mut)">Belum ada target. Tambahkan target pertama Anda di atas.</div>'}</div>`;
    },
    jurnal() {
        return `<div class="card"><h3>Muhasabah hari ini</h3><textarea id="nt" rows="4" placeholder="Apa yang sudah baik hari ini? Apa yang ingin diperbaiki besok? Apa yang disyukuri?"></textarea><button class="btn sm" style="margin-top:10px" onclick="addN()">Simpan catatan</button></div>
  ${D.nt.length ? D.nt.map((n, i) => `<div class="note"><small>${n.d}</small><p>${esc(n.x).replace(/\n/g, '<br>')}</p><button class="del" onclick="delN(${i})">Hapus</button></div>`).join('') : '<div class="card" style="text-align:center;color:var(--mut)">Catatan Anda akan muncul di sini.</div>'}`;
    },
    more() {
        const S = {
            eval: evalV,
            fam: famV,
            haf: hafV,
            cha: chaV,
            doa: doaV,
            zak: zakV,
            tas: tasV,
            rem: remV,
            abt: abtV,
            jur: () => V.jurnal(),
            kjn: kajianV
        };
        if (!sub || !S[sub])
            return menuV();
        const ti = (MENU.find(x => x[0] === sub) || [0, 'Tentang'])[1];
        return `<div class="sec"><div class="flex" style="margin-bottom:12px"><button class="icb" onclick="sub='';render()" aria-label="Kembali ke menu Lainnya">‹</button><b style="font-family:Sora,sans-serif;font-size:16px">${ti}</b></div>${S[sub]()}</div>`;
    }
};
// Halaman Evaluasi: grafik 7 hari, evaluasi 30 hari, peta konsistensi, badge.
function evalV() {
    D.best = best();
    const a7 = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        return [d, agPct(key(d))];
    }), av = a7.filter(x => x[1] !== null), ava = av.length ? Math.round(av.reduce((a, x) => a + x[1], 0) / av.length) : null;
    const days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 6 + i);
        return [d, pct(key(d))];
    });
    const avg = Math.round(days.reduce((a, x) => a + x[1], 0) / 7);
    const cnt = itemsOn(key(new Date())).map(x => [x[1], [...Array(30)].reduce((a, _, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return a + (((D.days[key(d)] || {})[x[0]]) ? 1 : 0);
        }, 0)]).sort((a, b) => b[1] - a[1]);
    const msg = avg >= 80 ? 'Luar biasa! Pertahankan istiqamah Anda.' : avg >= 50 ? 'Bagus. Tingkatkan sedikit demi sedikit.' : 'Mulai dari yang kecil, yang penting konsisten.';
    return `<div class="card"><h3>Capaian 7 hari terakhir</h3><div class="bars">${days.map(x => `<div><i style="height:${x[1]}%"></i>${x[0].toLocaleDateString('id-ID', { weekday: 'short' })}</div>`).join('')}</div></div>
  <div class="card"><h3>Rata-rata ${avg}%</h3><p style="color:var(--mut)">${msg}</p></div>
  <div class="card"><h3>Evaluasi 30 hari</h3><p>✅ Paling konsisten: <b>${cnt[0][1] ? cnt[0][0] : '-'}</b></p><p>⚠️ Perlu ditingkatkan: <b>${cnt[cnt.length - 1][0]}</b> (${cnt[cnt.length - 1][1]}x)</p></div>
  <div class="card"><h3>Ketercapaian agenda 7 hari</h3><div class="bars">${a7.map(x => `<div><i style="height:${x[1] || 0}%"></i>${x[0].toLocaleDateString('id-ID', { weekday: 'short' })}</div>`).join('')}</div><p style="color:var(--mut);font-size:13px;margin-top:6px">${ava === null ? 'Belum ada agenda. Susun agenda harian di tab Agenda.' : 'Rata-rata ' + ava + '% (' + grade(ava) + ') dari ' + av.length + ' hari beragenda.'}</p></div>
  <div class="card"><h3>Peta konsistensi 5 minggu</h3><div class="hm">${[...Array(35)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - 34 + i);
        const p = pct(key(d));
        return `<i title="${key(d)}: ${p}%" style="${p ? `background:var(--gold);opacity:${(.2 + p / 100 * .8).toFixed(2)}` : 'background:var(--bg)'}"></i>`;
    }).join('')}</div></div>
  <div class="card"><h3>Pencapaian</h3><div class="bdg">${BD.map(b => `<div class="${b[2]() ? 'on' : ''}"><span>${b[0]}</span>${b[1]}</div>`).join('')}</div></div>`;
}
// Halaman kalkulator zakat.
function zakV() {
    return `<div class="card"><h3>Zakat Maal</h3><label class="l">Total harta tersimpan 1 tahun (Rp)</label><input id="zh" type="number" inputmode="numeric"><label class="l">Harga emas per gram (Rp)</label><input id="zg" type="number" inputmode="numeric"><button class="btn sm" style="margin-top:10px" onclick="zMaal()">Hitung</button><p id="zr1" style="margin-top:10px;font-weight:600"></p></div>
  <div class="card"><h3>Zakat Fitrah</h3><label class="l">Jumlah jiwa</label><input id="zj" type="number" inputmode="numeric" value="1"><label class="l">Harga beras per kg (Rp)</label><input id="zb" type="number" inputmode="numeric"><button class="btn sm" style="margin-top:10px" onclick="zFitrah()">Hitung</button><p id="zr2" style="margin-top:10px;font-weight:600"></p></div>
  <small style="color:var(--mut)">Perhitungan ini perkiraan. Nisab zakat maal setara 85 gram emas dan kadarnya 2,5%. Fitrah 2,5 kg beras per jiwa. Konsultasikan dengan lembaga zakat setempat untuk ketentuan terbaru.</small>`;
}
// Format angka menjadi rupiah.
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
// Menghitung zakat maal.
function zMaal() {
    const h = +$('#zh').value, g = +$('#zg').value;
    if (!h || !g)
        return toast('Isi semua kolom');
    const n = 85 * g;
    $('#zr1').innerHTML = h >= n ? `Nisab ${rp(n)}. Harta mencapai nisab. Zakat: <span style="color:var(--gold)">${rp(h * .025)}</span>` : `Nisab ${rp(n)}. Harta belum mencapai nisab, belum wajib zakat maal.`;
}
// Menghitung zakat fitrah.
function zFitrah() {
    const j = +$('#zj').value, b = +$('#zb').value;
    if (!j || !b)
        return toast('Isi semua kolom');
    $('#zr2').innerHTML = `${j} jiwa × 2,5 kg = ${j * 2.5} kg beras. Setara <span style="color:var(--gold)">${rp(j * 2.5 * b)}</span>`;
}
// Halaman tasbih digital.
function tasV() {
    const z = ['Subhanallah', 'Alhamdulillah', 'Allahu Akbar'], n = D.tasbih || 0, c = n % 33;
    return `<div class="card" style="text-align:center"><h3>Tasbih Digital</h3><p class="ar" style="font-size:30px;color:var(--gold)">${['سُبْحَانَ اللّٰه', 'اَلْحَمْدُ لِلّٰه', 'اَللّٰهُ أَكْبَر'][Math.floor(n / 33) % 3]}</p><small style="color:var(--mut)">${z[Math.floor(n / 33) % 3]} · putaran ${c}/33 · total ${n}</small>
  <div class="tas" onclick="tas()" role="button" aria-label="Hitung">${c}</div><button class="btn sm" onclick="D.tasbih=0;save();render()">Reset</button></div>`;
}
// Halaman pengingat & notifikasi.
function remV() {
    return `<div class="card"><h3>Notifikasi</h3><button class="btn sm ${D.notif ? 'o' : ''}" onclick="toggleNotif()">${D.notif ? 'Aktif · ketuk untuk matikan' : 'Aktifkan notifikasi'}</button><p style="color:var(--mut);font-size:12px;margin-top:8px">Pengingat berbunyi saat aplikasi terbuka. Waktu sholat ikut diingatkan.</p></div>
  <div class="card"><h3>Pengingat islami</h3><p style="color:var(--mut);font-size:12px;margin-bottom:10px">Dzikir pagi dan petang, adab tidur, dan amalan Jumat tampil di beranda dan ikut berbunyi bila notifikasi aktif.</p><button class="btn sm ${D.ir === 0 ? '' : 'o'}" onclick="togglIr()">${D.ir === 0 ? 'Aktifkan pengingat islami' : 'Aktif · ketuk untuk matikan'}</button></div>
  <div class="card"><h3>Notifikasi push</h3><p style="color:var(--mut);font-size:12px;margin-bottom:10px">Terima pesan TaqwaLife walau aplikasi tertutup, misalnya pengingat dan motivasi dari pengelola.</p><button class="btn sm ${D.push ? 'o' : ''}" onclick="togglePush()">${D.push ? 'Push aktif · ketuk untuk matikan' : 'Aktifkan push'}</button></div>
  <div class="card"><h3>Tambah pengingat</h3><div class="flex"><input id="rt" type="time" style="width:120px"><input id="rl" placeholder="Misal: Sholat Tahajud"></div><button class="btn sm" style="margin-top:10px" onclick="addR()">Simpan</button></div>
  ${D.rm.map((r, i) => `<div class="card flex sp"><b>${r.t} · ${esc(r.l)}</b><button class="del" onclick="delR(${i})">Hapus</button></div>`).join('')}`;
}
// Isi halaman Akun (profil, lokasi, tema, sinkron, cadangan).
function accV() {
    return `<div class="card"><h3>Profil</h3><label class="l">Nama panggilan</label><input id="nm" value="${esc(D.name)}" maxlength="30" autocomplete="nickname"><label class="l">Sapaan</label><select id="sp">${['', 'Akhi', 'Ukhti', 'Ustadz', 'Ustadzah', 'Bapak', 'Ibu'].map(x => `<option value="${x}" ${D.sp === x ? 'selected' : ''}>${x || 'Tanpa sapaan'}</option>`).join('')}</select><button class="btn sm" style="margin-top:10px" onclick="saveName()">Simpan profil</button><small style="color:var(--mut);display:block;margin-top:8px">${CFG && uid !== 'local' ? 'Tersinkron ke akun Firebase Anda' : 'Mode lokal: data hanya di perangkat ini'}</small></div>
  <div class="card"><h3>Lokasi</h3><label class="l">Lokasi jadwal sholat</label><select id="ci"><option value="gps">📍 Gunakan lokasi GPS saya</option>${CITIES.map(c => `<option ${c[0] === D.city ? 'selected' : ''}>${c[0]}</option>`).join('')}</select><button class="btn sm" style="margin-top:10px" onclick="setCity()">Simpan lokasi</button><small style="color:var(--mut);display:block;margin-top:8px">Jadwal dihitung di perangkat (metode Kemenag), perkiraan ±2 menit. Cocokkan dengan jadwal masjid setempat.</small></div>
  ${themeCard()}
  <div class="card"><h3>Sinkronisasi</h3><small style="color:var(--mut)">${syncInfo()}</small><br><button class="btn sm" style="margin-top:10px" onclick="syncNow()">Sinkron sekarang</button></div>
  <div class="card"><h3>Cadangan data</h3><div class="flex"><button class="btn sm" onclick="exp()">Unduh cadangan</button><button class="btn sm o" onclick="$('#imp').click()">Pulihkan</button></div><input type="file" id="imp" accept=".json" hidden onchange="imp(this)"></div>
  ${matchMedia('(display-mode: standalone)').matches ? '' : `<div class="card"><h3>Pasang aplikasi</h3>${inst ? '<button class="btn sm" onclick="pasang()">Pasang di perangkat</button>' : '<small style="color:var(--mut)">Buka menu browser lalu pilih Tambahkan ke layar utama (iPhone: Bagikan, lalu Tambah ke Layar Utama).</small>'}</div>`}
  <button class="btn" onclick="logout()">Keluar</button>`;
}
