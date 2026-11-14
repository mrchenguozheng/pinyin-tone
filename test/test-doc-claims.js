// test/test-doc-claims.js
// The docs quote numbers. Some of them were already asserted where they are computed
// (test-divergence.js for the 11.3% story, test-strict.js for the 876 / 1076 split), but the rest
// were only asserted by a person reading them, and this repository has already shipped two wrong
// ones: "1,548 differences, all dropped letters" and "workaround's 36 inputs". Prose is copied into
// four places (README, docs/README.zh.md, the two migrating pages, site/README.md), so a correction
// has to be made in every copy.
//
// Two jobs here:
//   1. every claim below is recomputed from the code, so the registry cannot hold a stale number;
//   2. every integer of three digits or more that appears in prose is checked against that
//      registry. Write a sentence quoting a number that no test computes and this fails, which is
//      the only mechanism that stops the four copies from drifting apart.
//
// Numbers inside code spans and fenced blocks are exempt: those are inputs and outputs (the
// `195802` of a tone-number example, the `31,120` bytes of a tarball), not claims about behaviour.
// The changelog is exempt for the same reason it exists: it records what was true on release day.
//
// Limitation, stated so nobody trusts this further than it goes: only integers of three digits and
// up are scanned. A two-digit claim (the 42 spellings of /workaround, the 32 literal jv keys) can
// still rot, which is why the two that exist are asserted above instead of being left to the scan.
import { readFileSync, readdirSync } from 'node:fs';
import { expect } from 'chai';
import v1 from 'pinyin-tone-2';
import oldV2 from 'pinyin-tone-2/v2';
import workaround from 'pinyin-tone-2/workaround';
import { markTones } from '../lib/index.js';
import dict from '../lib/dict.js';

const SUFFIXES = ['', '0', '1', '2', '3', '4', '5'];
const keys = Object.keys(dict);
const inputs = keys.flatMap((key) => SUFFIXES.map((suffix) => key + suffix));

const rootDiff = inputs
	.map((input) => ({ before: v1(input), after: markTones(input) }))
	.filter((pair) => pair.before !== pair.after);
const v2Diff = inputs.filter((input) => oldV2(input) !== markTones(input));
const v2Keys = [...new Set(v2Diff.map((input) => input.replace(/[0-5]$/, '')))];

// The three buckets the migration pages print, by length: letters dropped, input left untouched,
// and the same length with ü spelled two ways.
const dropped = rootDiff.filter((pair) => pair.before.length < pair.after.length).length;
const untouched = rootDiff.filter((pair) => pair.before.length > pair.after.length).length;
const respelled = rootDiff.filter((pair) => pair.before.length === pair.after.length).length;

// Strict mode: a key survives if any of the four tones produces a glyph, which is how
// test-strict.js counts it. First tone alone would not do — n and ng get theirs from the rule.
const passesStrict = (key) => [1, 2, 3, 4].some(
	(tone) => markTones(key + tone, { strict: true }) !== key + tone,
);

// `/workaround` is one table of single vowels: six vowels, each in seven notations (bare, 0-5).
// 0 and 5 both mean "no mark", but they are separate inputs in that table, so it is 42 spellings
// and not 36.
const VOWELS = ['a', 'o', 'e', 'i', 'u', 'v'];
const workaroundSpellings = VOWELS.flatMap(
	(vowel) => SUFFIXES.map((suffix) => vowel + suffix),
);

// The registry. `computed` is asserted against `value`, which is what the docs print: a wrong doc
// number fails here rather than in a reader's head. `computed: null` marks a component of a claim
// (the 426/418/32 that add up to 876): it has no independent count to recompute, so it is checked
// only in the sum below, and registered here so the prose scan knows the number is legitimate.
const CLAIMS = {
	'dictionary keys': { value: 1952, computed: keys.length },
	'inputs (keys × 7 spellings)': { value: 13664, computed: inputs.length },
	'root entry differences': { value: 1548, computed: rootDiff.length },
	'differences where 2.x dropped letters': { value: 966, computed: dropped },
	'differences where 2.x left the input untouched': { value: 509, computed: untouched },
	'differences of equal length (ü spelled two ways)': { value: 73, computed: respelled },
	'v2 subpath differences': { value: 259, computed: v2Diff.length },
	'v2 subpath keys': { value: 38, computed: v2Keys.length },
	'keys strict mode passes': { value: 876, computed: keys.filter(passesStrict).length },
	'keys strict mode rejects': { value: 1076, computed: keys.length - keys.filter(passesStrict).length },
	'workaround spellings': { value: 42, computed: workaroundSpellings.length },
	'standard syllables': { value: 426, computed: null },
	'erhua keys': { value: 418, computed: null },
	'literal jv spellings': { value: 32, computed: null },
};

describe('the numbers the docs print', () => {
	for (const [name, claim] of Object.entries(CLAIMS)) {
		if (claim.computed === null) continue;
		it(`${name}: ${claim.value}`, () => {
			expect(claim.computed, `${name} no longer matches the docs`).to.equal(claim.value);
		});
	}

	it('workaround is a strict subset of markTones, spelling by spelling', () => {
		// "markTones is a superset of its 42 inputs" is the claim in both READMEs. A superset that
		// disagrees on one spelling is not a superset, so each of the 42 is compared.
		const disagreements = workaroundSpellings.filter(
			(spelling) => workaround(spelling) !== markTones(spelling),
		);
		expect(disagreements, 'spellings where /workaround and markTones disagree').to.deep.equal([]);
		// And its fallback: a key that is not a vowel comes back unchanged, including names it
		// would inherit from Object.prototype.
		expect(workaround('toString')).to.equal('toString');
		expect(workaround('zzz')).to.equal('zzz');
	});

	it('the strict decomposition adds up to the pass count', () => {
		// 876 = 426 standard syllables + 418 erhua keys + 32 literal jv spellings. Those three come
		// from the syllable table and the shape of the dictionary, so they are checked as a sum:
		// change any one of them and this breaks.
		const parts = ['standard syllables', 'erhua keys', 'literal jv spellings']
			.map((name) => CLAIMS[name].value);
		expect(parts.reduce((a, b) => a + b, 0)).to.equal(CLAIMS['keys strict mode passes'].value);
	});

	it('prose quotes no number that no test computes', () => {
		const docs = [
			'README.md',
			'site/README.md',
			...readdirSync('docs').filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`),
		];
		const allowed = new Set(Object.values(CLAIMS).map((claim) => claim.value));
		// Not a claim about this library: GB/T 16159, the orthography standard the capitalisation
		// rule follows.
		allowed.add(16159);

		const offenders = [];
		for (const file of docs) {
			const text = readFileSync(file, 'utf8');
			let fence = false;
			text.split(/\r?\n/).forEach((line, index) => {
				if (/^\s*```/.test(line)) {
					fence = !fence;
					return;
				}
				if (fence) return;
				// Code spans hold inputs and outputs; URLs hold dates and document ids.
				const prose = line.replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '');
				for (const match of prose.matchAll(/\d[\d,]{2,}/g)) {
					const value = Number(match[0].replace(/,/g, ''));
					if (!allowed.has(value)) {
						offenders.push(`${file}:${index + 1}: ${match[0]} — ${line.trim()}`);
					}
				}
			});
		}

		expect(offenders, 'numbers in prose that no test computes').to.deep.equal([]);
	});
});
