/* ==========================================================================
 * TaqwaLife - Catatan kajian
 * Mencatat kajian, pertanyaan untuk ustadz, dan isi catatan.
 * ========================================================================== */

// kjE = id kajian yang sedang diubah; kjO = id kajian yang sedang terbuka.
let kjE = null, kjO = null;
// Mencari kajian berdasarkan id.
const kjFind = id => D.kj.find(x => x.id === id);
// Format tanggal kajian.
const kjDate = k => new Date(k.d + 'T00:00').toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});
// Halaman catatan kajian.
function kajianV() {
    const tk = key(new Date());
    const L = D.kj.slice().sort((a, b) => {
        const ua = a.d >= tk, ub = b.d >= tk;
        if (ua !== ub)
            return ua ? -1 : 1;
        const x = a.d + (a.w || ''), y = b.d + (b.w || '');
        return ua ? x.localeCompare(y) : y.localeCompare(x);
    });
    return `<div class="card"><h3>${kjE ? 'Ubah kajian' : 'Tambah catatan kajian'}</h3>
  <label class="l">Tema kajian</label><input id="kjt" placeholder="Misal: Adab menuntut ilmu" maxlength="100">
  <label class="l">Pembicara</label><input id="kjs" placeholder="Nama ustadz / pemateri" maxlength="80">
  <div class="flex"><div style="flex:1"><label class="l">Tanggal</label><input id="kjd" type="date" value="${tk}"></div><div style="flex:1"><label class="l">Waktu</label><input id="kjw" type="time"></div></div>
  <label class="l">Tempat</label><input id="kjp" placeholder="Masjid, lokasi, atau tautan kajian online" maxlength="100">
  <label class="l">Catatan kajian</label><textarea id="kjn" rows="4" placeholder="Poin-poin penting, dalil, faedah, dan amalan yang akan dilakukan" maxlength="1500"></textarea>
  ${kjE ? '' : '<label class="l">Siapkan pertanyaan</label><textarea id="kjq" rows="3" placeholder="Satu pertanyaan per baris (maksimal 10)"></textarea>'}
  <div class="flex" style="margin-top:12px"><button class="btn sm" onclick="saveK()">${kjE ? 'Simpan perubahan' : 'Simpan kajian'}</button>${kjE ? '<button class="btn sm o" onclick="kjE=null;render()">Batal</button>' : ''}</div></div>
  ${L.length ? L.map(k => {
        const st = k.d === tk ? 'Hari ini' : k.d > tk ? 'Akan datang' : 'Selesai', q = k.q || [];
        return `<div class="card"><details ${kjO === k.id ? 'open' : ''} ontoggle="kjO=this.open?'${k.id}':(kjO==='${k.id}'?null:kjO)"><summary><div><b>${esc(k.t)}</b><br><small style="color:var(--mut);font-weight:500">${kjDate(k)}${k.w ? ' · ' + k.w : ''}</small></div><span class="chip pc" style="flex:none;align-self:flex-start">${st}</span></summary>
  <div class="kv"><small>Pembicara</small><span>${esc(k.s || '-')}</span></div><div class="kv"><small>Tempat</small><span>${esc(k.p || '-')}</span></div>
  <div class="h" style="margin:14px 0 4px">Pertanyaan untuk ustadz</div>
  ${q.length ? q.map((x, i) => `<div class="row ${x.a ? 'on' : ''}"><button class="ck" onclick="tgQ('${k.id}',${i})" aria-label="Tandai sudah ditanyakan">${x.a ? '✓' : ''}</button><span class="t">${esc(x.x)}<small>${x.a ? 'Sudah ditanyakan' : 'Belum ditanyakan'}</small></span><button class="icb" onclick="delQ('${k.id}',${i})" aria-label="Hapus pertanyaan" style="color:var(--bad)">×</button></div>`).join('') : '<small style="color:var(--mut)">Belum ada pertanyaan.</small>'}
  <div class="flex" style="margin-top:8px"><input id="kq_${k.id}" placeholder="Tambah pertanyaan" maxlength="150"><button class="btn sm" onclick="addQ('${k.id}')">Tambah</button></div>
  <div class="h" style="margin:14px 0 4px">Catatan kajian</div>
  <textarea id="kn_${k.id}" rows="5" placeholder="Poin-poin penting, dalil, faedah, dan amalan yang akan dilakukan">${esc(k.n || '')}</textarea>
  <div class="flex" style="margin-top:10px;flex-wrap:wrap"><button class="btn sm" onclick="saveN('${k.id}')">Simpan catatan</button><button class="btn sm o" onclick="editK('${k.id}')">Ubah kajian</button><button class="del" onclick="delK('${k.id}')">Hapus</button></div></details></div>`;
    }).join('') : '<div class="card" style="text-align:center;color:var(--mut)">Belum ada catatan kajian. Tambahkan kajian pertama Anda di atas.</div>'}`;
}
// Menyimpan kajian baru/perubahan.
function saveK() {
    const t = $('#kjt').value.trim(), d = $('#kjd').value;
    if (!t)
        return toast('Isi tema kajian');
    if (!d)
        return toast('Pilih tanggal kajian');
    const o = {
        t,
        d,
        w: $('#kjw').value,
        p: $('#kjp').value.trim(),
        s: $('#kjs').value.trim(),
        n: ($('#kjn').value || '').trim().slice(0, 1500)
    };
    if (kjE) {
        Object.assign(kjFind(kjE), o);
        kjO = kjE;
        kjE = null;
    } else {
        if (D.kj.length >= 80)
            return toast('Maksimal 80 catatan kajian. Hapus yang lama dulu.');
        o.id = 'k' + Date.now().toString(36) + Math.floor(Math.random() * 999);
        o.q = ($('#kjq').value || '').split('\n').map(x => x.trim().slice(0, 150)).filter(Boolean).slice(0, 10).map(x => ({ x, a: 0 }));
        D.kj.push(o);
        kjO = o.id;
    }
    save();
    render();
    toast('Kajian tersimpan di daftar catatan kajian');
    setTimeout(() => {
        const e = document.querySelector('details[open]');
        if (e && e.scrollIntoView)
            e.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
}
// Mengisi form untuk mengubah kajian.
function editK(id) {
    const k = kjFind(id);
    kjE = id;
    render();
    $('#kjt').value = k.t;
    $('#kjs').value = k.s || '';
    $('#kjd').value = k.d;
    $('#kjw').value = k.w || '';
    $('#kjp').value = k.p || '';
    $('#kjn').value = k.n || '';
    $('#kjt').scrollIntoView({ block: 'center' });
    $('#kjt').focus();
}
// Menjaga isi catatan yang sedang diketik sebelum layar digambar ulang.
function kjKeep(id) {
    const t = $('#kn_' + id);
    if (t && typeof t.value === 'string' && kjFind(id))
        kjFind(id).n = t.value.slice(0, 1500);
}
// Menambah pertanyaan untuk ustadz.
function addQ(id) {
    kjKeep(id);
    const k = kjFind(id), v = ($('#kq_' + id).value || '').trim().slice(0, 150);
    if (!v)
        return toast('Tulis pertanyaannya dulu');
    k.q = k.q || [];
    if (k.q.length >= 10)
        return toast('Maksimal 10 pertanyaan');
    k.q.push({ x: v, a: 0 });
    kjO = id;
    save();
    render();
}
// Menandai pertanyaan sudah ditanyakan.
function tgQ(id, i) {
    kjKeep(id);
    const k = kjFind(id);
    k.q[i].a = k.q[i].a ? 0 : 1;
    kjO = id;
    save();
    render();
}
// Menghapus pertanyaan.
function delQ(id, i) {
    kjKeep(id);
    kjFind(id).q.splice(i, 1);
    kjO = id;
    save();
    render();
}
// Menyimpan catatan isi kajian.
function saveN(id) {
    kjKeep(id);
    save();
    toast('Catatan kajian tersimpan');
}
// Menghapus kajian.
function delK(id) {
    if (!confirm('Hapus catatan kajian ini?'))
        return;
    D.kj = D.kj.filter(x => x.id !== id);
    if (kjO === id)
        kjO = null;
    save();
    render();
}
// Kartu kajian hari ini di beranda.
function kjHome() {
    const tk = key(new Date()), x = D.kj.filter(k => k.d === tk);
    return x.map(k => `<div class="card flex sp"><div><b>📖 Kajian hari ini${k.w ? ' · ' + k.w : ''}</b><br><small style="color:var(--mut)">${esc(k.t)}${k.s ? ' · ' + esc(k.s) : ''}</small></div><button class="btn sm o" onclick="sub='kjn';kjO='${k.id}';go('more')">Buka</button></div>`).join('');
}
