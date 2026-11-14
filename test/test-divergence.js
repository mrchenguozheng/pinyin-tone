// test/test-divergence.js
// README and docs/migrating.md make a quantitative claim: on the 13,664 inputs formed by every
// dictionary key × its seven tone spellings (no digit, then 0-5), the 2.x root entry and 3.0
// disagree on 1,548 of them — 11.3%. That number is the strongest claim the project makes and the
// only one a reader can't verify by eye. It was measured once; nothing stopped it from rotting.
//
// Here it is measured on every run, from the code. The baseline is 2.5.2 — the last release of the
// 2.x line, and what the `legacy` tag installs. It sits under the alias `pinyin-tone-2`, because
// the package under test is itself called `pinyin-tone`, and the alias is pinned exactly, so the
// baseline cannot drift underneath the assertion. The counts happen to be identical against 2.4.1
// (deprecated, its `/v2` entry sliced the input); what 2.5.x changed lives in that subpath, not in
// the root entry measured here.
//
// The counts are split into buckets because the sentence "all in one direction — the old one drops
// letters" is not what the data says: 966 differences are the old entry dropping a letter, 509 are
// the old entry leaving an input it does not recognise untouched, and 73 are the same length with
// ü spelled two ways. Each bucket is asserted, so a rewrite that quietly moves a case from one
// bucket to another fails here instead of changing the story the docs tell.
import { expect } from 'chai';
import v1 from 'pinyin-tone-2';
import { markTones } from '../lib/index.js';
import dict from '../lib/dict.js';

// Seven spellings per key: the bare syllable, then the tone digit 0 through 5. 0 and 5 both mean
// "no mark" but they are written differently in the input, and 2.x does not treat them the same.
const SUFFIXES = ['', '0', '1', '2', '3', '4', '5'];

const inputs = Object.keys(dict).flatMap((key) => SUFFIXES.map((suffix) => key + suffix));

const differences = [];
for (const input of inputs) {
	const before = v1(input);
	const after = markTones(input);
	if (before !== after) {
		differences.push({ input, before, after });
	}
}

const shorter = differences.filter((d) => d.before.length < d.after.length);
const longer = differences.filter((d) => d.before.length > d.after.length);
const sameLength = differences.filter((d) => d.before.length === d.after.length);

describe('2.5.2 vs 3.0 over the whole dictionary', () => {
	it('covers 1,952 keys × 7 spellings = 13,664 inputs', () => {
		expect(Object.keys(dict)).to.have.length(1952);
		expect(inputs).to.have.length(13664);
	});

	it('disagrees on 1,548 of them, 11.3% — the number the README prints', () => {
		expect(
			differences.length,
			'the published figure (1,548 of 13,664) no longer holds',
		).to.equal(1548);
		expect((differences.length / inputs.length) * 100).to.be.closeTo(11.3, 0.05);
	});

	it('splits into the three buckets the docs describe', () => {
		// The old entry folded a full final into a short one: biou1 -> biū, where 3.0 keeps biōu.
		expect(shorter, 'differences where 2.x dropped a letter').to.have.length(966);
		// The old entry did not convert at all: e^0 comes back as written, where 3.0 gives ê.
		expect(longer, 'differences where 2.x left the input untouched').to.have.length(509);
		// Same length, different spelling of ü: jvn -> jün vs jun.
		expect(sameLength, 'differences of equal length, ü spelled two ways').to.have.length(73);
		// No fourth bucket, and none empty: the three above must account for every difference.
		expect(shorter.length + longer.length + sameLength.length).to.equal(differences.length);
	});

	it('keeps the two examples the docs quote', () => {
		expect(v1('biou1')).to.equal('biū');
		expect(markTones('biou1')).to.equal('biōu');
		expect(v1('jvn')).to.equal('jün');
		expect(markTones('jvn')).to.equal('jun');
	});

	it('is not a one-way door: the aliased baseline really is 2.5.2', () => {
		// A version mismatch here would make every count above meaningless, so the alias is
		// checked against what 2.5.x changed rather than trusting the install: the root entry
		// cannot cut glued input, and the capitalised syllable 2.4.1's /v2 sliced to `ao` now
		// converts in full. Downgrade the alias back to 2.4.1 and this line goes red.
		expect(v1('han4yu3pin1yin1')).to.equal('han4yu3pin1yin1');
		expect(v1('han4 yu3 pin1 yin1')).to.equal('hàn yǔ pīn yīn');
		expect(v1('Hao3')).to.equal('Hao3');
	});
});
