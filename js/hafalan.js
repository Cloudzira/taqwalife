/* ==========================================================================
 * TaqwaLife - Hafalan Al-Qur'an
 * Pencatatan hafalan dan pengingat murajaah.
 * ========================================================================== */

// Daftar nama surah (untuk saran pengisian).
const SUR = "Al-Fatihah,Al-Baqarah,Ali 'Imran,An-Nisa',Al-Ma'idah,Al-An'am,Al-A'raf,Al-Anfal,At-Taubah,Yunus,Hud,Yusuf,Ar-Ra'd,Ibrahim,Al-Hijr,An-Nahl,Al-Isra',Al-Kahf,Maryam,Ta Ha,Al-Anbiya',Al-Hajj,Al-Mu'minun,An-Nur,Al-Furqan,Asy-Syu'ara',An-Naml,Al-Qashash,Al-'Ankabut,Ar-Rum,Luqman,As-Sajdah,Al-Ahzab,Saba',Fathir,Ya Sin,Ash-Shaffat,Shad,Az-Zumar,Ghafir,Fushshilat,Asy-Syura,Az-Zukhruf,Ad-Dukhan,Al-Jatsiyah,Al-Ahqaf,Muhammad,Al-Fath,Al-Hujurat,Qaf,Adz-Dzariyat,Ath-Thur,An-Najm,Al-Qamar,Ar-Rahman,Al-Waqi'ah,Al-Hadid,Al-Mujadilah,Al-Hasyr,Al-Mumtahanah,Ash-Shaff,Al-Jumu'ah,Al-Munafiqun,At-Taghabun,Ath-Thalaq,At-Tahrim,Al-Mulk,Al-Qalam,Al-Haqqah,Al-Ma'arij,Nuh,Al-Jinn,Al-Muzzammil,Al-Muddatstsir,Al-Qiyamah,Al-Insan,Al-Mursalat,An-Naba',An-Nazi'at,'Abasa,At-Takwir,Al-Infithar,Al-Muthaffifin,Al-Insyiqaq,Al-Buruj,Ath-Thariq,Al-A'la,Al-Ghasyiyah,Al-Fajr,Al-Balad,Asy-Syams,Al-Lail,Adh-Dhuha,Asy-Syarh,At-Tin,Al-'Alaq,Al-Qadr,Al-Bayyinah,Az-Zalzalah,Al-'Adiyat,Al-Qari'ah,At-Takatsur,Al-'Ashr,Al-Humazah,Al-Fil,Quraisy,Al-Ma'un,Al-Kautsar,Al-Kafirun,An-Nashr,Al-Lahab,Al-Ikhlash,Al-Falaq,An-Nas".split(',');
// Menghitung apakah hafalan perlu murajaah.
const dueOf = h => {
    const b = h.r || h.d, ago = Math.floor((new Date(key(new Date())) - new Date(b)) / 864e5);
    return { ago, due: ago >= (h.st === 0 ? 3 : 7) };
};
// Kartu pengingat hafalan yang perlu murajaah.
function hafDue() {
    const n = D.hf.filter(h => dueOf(h).due).length;
    return n ? `<div class="card flex sp"><b>📖 ${n} hafalan perlu murajaah</b><button class="btn sm" onclick="sub='haf';go('more')">Buka</button></div>` : '';
}
// Halaman hafalan.
function hafV() {
    const T = ['Baru', 'Murajaah', 'Mutqin'], cnt = [0, 1, 2].map(i => D.hf.filter(h => h.st === i).length);
    return `<div class="card"><h3>Catat hafalan</h3><input id="hs" list="sl" placeholder="Nama surah, misal: Al-Mulk"><datalist id="sl">${SUR.map(x => `<option value="${x}">`).join('')}</datalist><input id="ha" placeholder="Ayat, misal 1-30" style="margin-top:8px"><button class="btn sm" style="margin-top:10px" onclick="addH()">Simpan hafalan</button></div>
  <div class="card"><h3>Ringkasan</h3><div class="flex" style="flex-wrap:wrap"><span class="chip pc">Baru ${cnt[0]}</span><span class="chip pc">Murajaah ${cnt[1]}</span><span class="chip pc">Mutqin ${cnt[2]}</span></div><small style="color:var(--mut);display:block;margin-top:8px">Ketuk status untuk menaikkan: Baru, Murajaah, lalu Mutqin (lancar). Murajaah diingatkan tiap 3 hari untuk hafalan baru dan 7 hari untuk yang sudah lancar.</small></div>
  ${D.hf.length ? D.hf.map((h, i) => {
        const x = dueOf(h);
        return `<div class="card"><div class="flex sp"><b>${esc(h.s)} · ${esc(h.a)}</b><button class="del" onclick="delH(${i})">Hapus</button></div><small style="color:var(--mut)">Murajaah terakhir: ${h.r ? (x.ago === 0 ? 'hari ini' : x.ago + ' hari lalu') : 'belum pernah'}</small>${x.due ? '<small style="color:var(--gold);font-weight:700;display:block">Saatnya murajaah</small>' : ''}<div class="flex" style="margin-top:8px"><button class="btn sm ${h.st === 2 ? '' : 'o'}" onclick="stH(${i})">${T[h.st]}</button><button class="btn sm o" onclick="rvH(${i})">Murajaah hari ini</button></div></div>`;
    }).join('') : '<div class="card" style="text-align:center;color:var(--mut)">Belum ada hafalan tercatat.</div>'}`;
}
// Mencatat hafalan baru.
function addH() {
    const s = $('#hs').value.trim().slice(0, 100), a = $('#ha').value.trim().slice(0, 100);
    if (!s)
        return toast('Isi nama surah');
    if (D.hf.length >= 300)
        return toast('Maksimal 300 catatan hafalan');
    D.hf.unshift({
        s,
        a: a || '-',
        st: 0,
        r: null,
        d: key(new Date())
    });
    save();
    render();
    toast('Hafalan dicatat');
}
// Mengganti status hafalan (Baru > Murajaah > Mutqin).
function stH(i) {
    D.hf[i].st = (D.hf[i].st + 1) % 3;
    save();
    render();
}
// Menandai murajaah hari ini.
function rvH(i) {
    D.hf[i].r = key(new Date());
    save();
    render();
    toast('Barakallahu fiik, murajaah tercatat');
}
// Menghapus catatan hafalan.
function delH(i) {
    if (confirm('Hapus catatan hafalan ini?')) {
        D.hf.splice(i, 1);
        save();
        render();
    }
}
