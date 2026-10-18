import toPinyinTonesV1, { v2 as toPinyinTonesV2 } from '../../index.js';
import toPinyinTonesV2Default, { splitUnspacedSyllables, convertUnspacedPinyin } from '../../v2/index.js';

toPinyinTonesV1('chu1 yin1 wei4 lai2');
toPinyinTonesV2('chu1 yin1 wei4 lai2');

// v2's declarations must name what v2/index.js actually exports. They used to declare
// `unspacedPinyinSplit`, a name that does not exist at run time, so the import would
// type-check and then fail on the call.
toPinyinTonesV2Default('chu1 yin1 wei4 lai2');
const spaced: string = splitUnspacedSyllables('han4yu3');
const converted: string = convertUnspacedPinyin('han4yu3pin1yin1');
void spaced;
void converted;

// The old, wrong name must stay gone: the declaration says it is not exported, and the
// next line fails to compile if anyone adds it back.
// @ts-expect-error — not exported by v2/index.js
import { unspacedPinyinSplit } from '../../v2/index.js';
void unspacedPinyinSplit;
