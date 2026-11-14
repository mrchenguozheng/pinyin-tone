// test/test-pack-json.js
// `scripts/check-pack.mjs` is the only guard that looks at the published tarball, and it once died
// in CI with `object is not iterable` because `npm pack --json` changes shape between npm majors:
// npm 11 prints an array of one entry, npm 12 prints an object keyed by package name. The workflow
// installs a newer npm than the CI matrix does, so the guard met a shape it had never been tested
// against. These cases pin both shapes, taken verbatim from the two npm versions.
import { expect } from 'chai';
import { firstPackInfo } from '../scripts/pack-json.mjs';

const entry = {
	name: 'pinyin-tone',
	version: '3.0.1',
	files: [{ path: 'lib/index.js', size: 12 }],
	size: 4096,
	unpackedSize: 8192,
};

describe('npm pack json', () => {
	it('takes the entry out of the array npm 11 prints', () => {
		expect(firstPackInfo([entry])).to.equal(entry);
	});

	it('takes the entry out of the object npm 12 prints', () => {
		// npm 12 keys the object by package name: { "pinyin-tone": { ... } }
		expect(firstPackInfo({ 'pinyin-tone': entry })).to.equal(entry);
	});

	it('refuses a multi-package result instead of guessing', () => {
		expect(() => firstPackInfo([entry, entry])).to.throw(/2 packages/);
		expect(() => firstPackInfo({ a: entry, b: entry })).to.throw(/2 packages/);
	});

	it('refuses an empty result and a non-result', () => {
		expect(() => firstPackInfo([])).to.throw(/0 packages/);
		expect(() => firstPackInfo('pinyin-tone')).to.throw(/expected an array or an object/);
	});
});
