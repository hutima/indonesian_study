import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as manifest from '../content/manifest.js';
import { resolveCustomVocabulary } from '../content/vocab/custom-focus.js';
import { itemsForMode } from '../lesson-selection.js';

const SET_PHRASES = [
  'salah satu', 'salah seorang', 'pihak berwenang', 'lepas pantai', 'pemungutan suara',
  'hak suara', 'pengambilan keputusan', 'dengan sendirinya', 'sejauh ini', 'dengan demikian',
  'sementara itu', 'untuk sementara waktu', 'pada saat', 'dalam negeri', 'urusan dalam negeri',
  'hubungan diplomatik', 'keadaan darurat', 'mencapai daratan', 'mengalami resesi',
  'mengalami penurunan', 'mengalami peningkatan', 'menurut laporan', 'berdasarkan laporan',
  'belum dapat dipastikan', 'sudah dipastikan', 'masih merupakan usulan', 'sudah berlaku',
  'mulai berlaku', 'tidak berlaku', 'memiliki wewenang untuk', 'melanggar hak',
  'mengajukan permintaan', 'menolak permintaan', 'mempertimbangkan permintaan',
  'perselisihan hukum', 'rancangan undang-undang', 'menurut ketentuan yang berlaku',
  'sesuai ketentuan yang berlaku', 'menjadi salah satu penyebab', 'tidak terbatas pada',
  'bertujuan untuk', 'berkaitan dengan', 'terkait dengan', 'sebagai bagian dari', 'sejumlah',
  'sedikitnya', 'sekitar', 'lebih dari', 'kurang dari'
];

const DAYS_AND_NUMBERS = [
  'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu',
  'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh',
  'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas',
  'delapan belas', 'sembilan belas', 'dua puluh'
];

test('manifest exposes two selectable vocabulary-only supplemental lessons', () => {
  assert.ok(Array.isArray(manifest.SUPPLEMENTAL_UNITS));
  assert.equal(manifest.SUPPLEMENTAL_UNITS.length, 2);
  assert.ok(Array.isArray(manifest.SELECTABLE_UNITS));
  assert.equal(manifest.SELECTABLE_UNITS.length, manifest.UNITS.length);
  assert.equal(manifest.UNITS.length, manifest.CORE_UNITS.length + 2);
  for (const unit of manifest.SUPPLEMENTAL_UNITS) {
    assert.ok(manifest.SELECTABLE_UNITS.some(candidate => candidate.id === unit.id));
    assert.equal(unit.supplemental, true);
    assert.deepEqual(unit.morphology, []);
    assert.deepEqual(unit.grammar, []);
    assert.deepEqual(unit.readings, []);
    assert.equal(new Set(unit.vocabulary.map(card => card.id)).size, unit.vocabulary.length);
  }
});

test('set phrases supplemental lesson contains the requested 49 forms in order', () => {
  const unit = manifest.SUPPLEMENTAL_UNITS?.find(item => item.id === 'id-supplemental-set-phrases');
  assert.ok(unit);
  assert.deepEqual(unit.vocabulary.map(card => card.form), SET_PHRASES);
  assert.equal(unit.vocabulary.length, 49);
  const focusSejumlah = resolveCustomVocabulary(manifest.CORE_UNITS).find(card => card.form === 'sejumlah');
  assert.ok(focusSejumlah);
  assert.equal(unit.vocabulary.find(card => card.form === 'sejumlah')?.id, focusSejumlah.id);
});

test('days and numbers supplemental lesson contains weekdays and numbers one through twenty', () => {
  const unit = manifest.SUPPLEMENTAL_UNITS?.find(item => item.id === 'id-supplemental-days-numbers');
  assert.ok(unit);
  assert.deepEqual(unit.vocabulary.map(card => card.form), DAYS_AND_NUMBERS);
  assert.equal(unit.vocabulary.length, 27);
});

test('itemsForMode suppresses duplicate card identities across selected lessons', () => {
  const units = [
    { id: 'a', vocabulary: [{ id: 'same', form: 'x' }] },
    { id: 'b', vocabulary: [{ id: 'same', form: 'x' }, { id: 'other', form: 'y' }] }
  ];
  assert.deepEqual(itemsForMode(units, ['a', 'b'], 'vocabulary').map(card => card.id), ['same', 'other']);
});

test('topic selector contains a supplemental practice group', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="supplemental-grid"/);
  assert.match(html, />Supplemental practice</);
  assert.match(html, /src="\.\/supplemental-selector\.js"/);
});
