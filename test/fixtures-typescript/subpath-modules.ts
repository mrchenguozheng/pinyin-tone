// test/fixtures-typescript/subpath-modules.ts
//
// These are the paths a consumer imports, and they are checked twice: by tsconfig.json with
// allowJs on, and by tsconfig.types.json with allowJs off. The second pass is the one that
// matters for the declaration files -- with allowJs on, TypeScript reads the .js
// implementation and never notices that a .d.ts is not a module at all.
import v1 from '../../v1/index.js';
import markSinglePinyinVowel from '../../workaround/index.js';
import v2, { splitUnspacedSyllables, convertUnspacedPinyin } from '../../v2/index.js';

const fromV1: string = v1('ma1');
const fromV2: string = v2('ma1');
const fromWorkaround: string = markSinglePinyinVowel('a1');
const spaced: string = splitUnspacedSyllables('han4yu3');
const unspaced: string = convertUnspacedPinyin('han4yu3pin1yin1');

void [fromV1, fromV2, fromWorkaround, spaced, unspaced];
