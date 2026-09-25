import { EXTRA_ROWS_01_05 } from './expanded-01-05.js';
import { EXTRA_ROWS_06_10 } from './expanded-06-10.js';
import { EXTRA_ROWS_11_15 } from './expanded-11-15.js';

// PBWL supplies the listed forms and root identifiers. Meanings and examples
// are newly written for this non-commercial personal study companion.
const groups = [EXTRA_ROWS_01_05, EXTRA_ROWS_06_10, EXTRA_ROWS_11_15];
const slug = form => form.toLocaleLowerCase('id').normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

export const EXPANDED_VOCABULARY = Object.fromEntries(groups.flatMap(group =>
  Object.entries(group).map(([number, rows]) => {
    const topic = Number(number);
    const unitId = `id-textbook-topik-${String(topic).padStart(2, '0')}`;
    return [topic, rows.map(({ sourceRootId, form, meaning, pos, register, kind, root, example, section, irregular }) => ({
      id: `id-pbwl2-t${String(topic).padStart(2, '0')}-r${sourceRootId}-${slug(form)}`,
      unitId, sourceRootId, form, meaning, pos, register, kind, example, section,
      ...(kind === 'derived' ? { root } : {}), ...(irregular ? { irregular: true } : {})
    }))];
  })
));
