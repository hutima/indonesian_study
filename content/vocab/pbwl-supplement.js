// Selected intermediate PBWL roots and lemmas, with original glosses and examples.
// Source: MsFixer, PBWL (2) Root v1.0b, CC BY-NC-SA 4.0.
// https://pulaubahasa.wordpress.com/vocab-builders/pbwl/
const rows = {
  1: [
    [2298, 'berisiko', 'carry a risk', 'verb', 'formal', 'risiko', 'Begadang setiap malam berisiko bagi kesehatan.'],
    [3265, 'mencerna', 'digest; take in information', 'verb', 'neutral', 'cerna', 'Tubuh mencerna makanan secara bertahap.'],
  ],
  2: [
    [2817, 'pertengkaran', 'a quarrel', 'noun', 'neutral', 'tengkar', 'Pertengkaran itu membuat kakak merasa bersalah.'],
    [2817, 'bertengkar', 'argue with one another', 'verb', 'neutral', 'tengkar', 'Mereka bertengkar tentang jadwal keluarga.'],
    [5416, 'pesangon', 'severance pay', 'noun', 'formal', null, 'Pegawai itu menerima pesangon setelah kontraknya berakhir.'],
  ],
  3: [
    [3910, 'merayu', 'persuade or woo', 'verb', 'neutral', 'rayu', 'Ia merayu temannya agar mau datang ke acara itu.'],
    [3910, 'rayuan', 'persuasive or flirtatious words', 'noun', 'neutral', 'rayu', 'Rina tidak percaya pada rayuan yang berlebihan.'],
  ],
  4: [
    [2290, 'persyaratan', 'set of requirements', 'noun', 'formal', 'syarat', 'Persyaratan sewa tertulis dalam dokumen itu.'],
    [2290, 'mensyaratkan', 'require as a condition', 'verb', 'formal', 'syarat', 'Pemilik mensyaratkan pembayaran di muka.'],
    [2324, 'penghuni', 'resident or occupant', 'noun', 'neutral', 'huni', 'Penghuni rumah itu menjaga halaman bersama.'],
    [2324, 'hunian', 'dwelling or housing unit', 'noun', 'formal', 'huni', 'Keluarga itu mencari hunian dekat sekolah.'],
  ],
  5: [
    [6850, 'botani', 'botany', 'noun', 'formal', null, 'Pemandu menjelaskan botani sederhana kepada pengunjung.'],
    [3138, 'melestarikan', 'preserve or conserve', 'verb', 'formal', 'lestari', 'Warga melestarikan kebun buah di desa itu.'],
    [3138, 'pelestarian', 'conservation effort or process', 'noun', 'formal', 'lestari', 'Pelestarian tanaman lokal melibatkan para petani.'],
  ],
  6: [
    [6963, 'etiket', 'social etiquette', 'noun', 'formal', null, 'Pengunjung mengikuti etiket saat menghadiri perayaan.'],
    [6963, 'netiket', 'online etiquette', 'noun', 'formal', null, 'Panitia meminta peserta menjaga netiket dalam grup acara.'],
  ],
  7: [
    [5040, 'trayek', 'public transport route', 'noun', 'formal', null, 'Kereta pada trayek itu berangkat setiap pagi.'],
    [2898, 'telat', 'late', 'adjective', 'informal', null, 'Aku telat karena kereta berhenti terlalu lama.'],
    [2898, 'ketelatan', 'lateness', 'noun', 'informal', 'telat', 'Ketelatan kereta membuat penumpang menunggu di peron.'],
  ],
  8: [
    [4734, 'panorama', 'wide scenic view', 'noun', 'neutral', null, 'Dari bukit, kami melihat panorama pegunungan.'],
  ],
  9: [
    [2570, 'jebakan', 'trap', 'noun', 'neutral', 'jebak', 'Hewan kecil itu menghindari jebakan di tepi jalan.'],
    [2570, 'menjebak', 'trap or trick', 'verb', 'neutral', 'jebak', 'Kondisi jalan yang sempit dapat menjebak pengemudi.'],
  ],
  10: [
    [2392, 'adat', 'custom or tradition', 'noun', 'neutral', null, 'Warga menjelaskan adat setempat kepada tamu festival.'],
    [2392, 'beradat', 'courteous; well mannered', 'adjective', 'formal', 'adat', 'Para tamu berbicara dengan sopan dan beradat.'],
    [2413, 'menghimpun', 'gather or collect', 'verb', 'formal', 'himpun', 'Panitia menghimpun cerita tentang perayaan itu.'],
    [2413, 'himpunan', 'collection or group', 'noun', 'formal', 'himpun', 'Himpunan cerita warga itu disimpan di perpustakaan.'],
  ],
  11: [
    [2594, 'spesies', 'species', 'noun', 'formal', null, 'Spesies itu hidup di hutan yang terlindungi.'],
    [4646, 'memangsa', 'prey on', 'verb', 'neutral', 'mangsa', 'Harimau memangsa hewan kecil di hutan.'],
    [4646, 'pemangsa', 'predator', 'noun', 'neutral', 'mangsa', 'Satwa itu menghindari pemangsa pada malam hari.'],
    [3664, 'kepunahan', 'extinction', 'noun', 'formal', 'punah', 'Perburuan dapat mempercepat kepunahan spesies langka.'],
    [3664, 'memunahkan', 'cause to become extinct', 'verb', 'formal', 'punah', 'Perusakan habitat dapat memunahkan spesies setempat.'],
    [4442, 'menjerat', 'ensnare or entrap', 'verb', 'neutral', 'jerat', 'Tali itu dapat menjerat kaki satwa.'],
  ],
  12: [
    [4492, 'menebang', 'cut down a tree', 'verb', 'neutral', 'tebang', 'Petugas dilarang menebang pohon di kawasan itu.'],
    [4492, 'ditebang', 'be cut down', 'verb', 'neutral', 'tebang', 'Pohon besar itu tidak boleh ditebang.'],
  ],
  13: [
    [3602, 'pascatragedi', 'after a tragedy', 'adjective', 'formal', 'tragedi', 'Laporan pascatragedi itu menjelaskan perubahan di kawasan tersebut.'],
  ],
  14: [
    [2645, 'menyurutkan', 'cause to recede or lessen', 'verb', 'formal', 'surut', 'Saluran baru membantu menyurutkan air di sekitar rumah.'],
    [5338, 'abrasi', 'coastal erosion', 'noun', 'formal', null, 'Akar bakau membantu mengurangi abrasi di pantai.'],
    [5638, 'laguna', 'coastal lagoon', 'noun', 'formal', null, 'Burung-burung berkumpul di laguna dekat hutan bakau.'],
    [4036, 'rayap', 'termite', 'noun', 'neutral', null, 'Rayap merusak kayu pada bangunan tua.'],
  ],
  15: [
    [2370, 'buruh', 'manual laborer', 'noun', 'neutral', null, 'Buruh kebersihan membersihkan taman setelah acara.'],
  ],
};
export const PBWL_SUPPLEMENTS = Object.fromEntries(Object.entries(rows).map(([topic, cards]) => {
  const unitId = `id-textbook-topik-${String(topic).padStart(2, '0')}`;
  return [Number(topic), cards.map(([sourceRootId, form, meaning, pos, register, root, example], index) => ({
    id: `id-pbwl-t${String(topic).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`,
    unitId, sourceRootId, form, meaning, pos, register, kind: root ? 'derived' : 'root',
    ...(root ? { root } : {}), example
  }))];
}));
