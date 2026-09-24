import { unit01 } from './units/unit01.js';
import { unit02 } from './units/unit02.js';
import { unit03 } from './units/unit03.js';
import { unit04 } from './units/unit04.js';
import { unit05 } from './units/unit05.js';
import { topik01 } from './textbook/topik01.js';
import { topik02 } from './textbook/topik02.js';
import { topik03 } from './textbook/topik03.js';
import { topik04 } from './textbook/topik04.js';
import { topik05 } from './textbook/topik05.js';
import { topik06 } from './textbook/topik06.js';
import { topik07 } from './textbook/topik07.js';
import { topik08 } from './textbook/topik08.js';
import { topik09 } from './textbook/topik09.js';
import { topik10 } from './textbook/topik10.js';
import { topik11 } from './textbook/topik11.js';
import { topik12 } from './textbook/topik12.js';
import { topik13 } from './textbook/topik13.js';
import { topik14 } from './textbook/topik14.js';
import { topik15 } from './textbook/topik15.js';
import { PBWL_SUPPLEMENTS } from './vocab/pbwl-supplement.js';

export const FOUNDATION_UNITS = [unit01, unit02, unit03, unit04, unit05];
const textbook = [topik01, topik02, topik03, topik04, topik05, topik06, topik07, topik08, topik09, topik10, topik11, topik12, topik13, topik14, topik15];
export const TEXTBOOK_UNITS = textbook.map(unit => ({ ...unit, vocabulary: [...unit.vocabulary, ...(PBWL_SUPPLEMENTS[unit.bookTopic] || [])] }));
export const UNITS = [...FOUNDATION_UNITS, ...TEXTBOOK_UNITS];
export const UNIT_URLS = [
  './content/vocab/pbwl-supplement.js',
  './content/units/unit01.js',
  './content/units/unit02.js',
  './content/units/unit03.js',
  './content/units/unit04.js',
  './content/units/unit05.js',
  './content/textbook/topik01.js',
  './content/textbook/topik02.js',
  './content/textbook/topik03.js',
  './content/textbook/topik04.js',
  './content/textbook/topik05.js',
  './content/textbook/topik06.js',
  './content/textbook/topik07.js',
  './content/textbook/topik08.js',
  './content/textbook/topik09.js',
  './content/textbook/topik10.js',
  './content/textbook/topik11.js',
  './content/textbook/topik12.js',
  './content/textbook/topik13.js',
  './content/textbook/topik14.js',
  './content/textbook/topik15.js',
];
