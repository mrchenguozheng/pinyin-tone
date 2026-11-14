// test/test-cases-fixture.js
// The demo page used to carry its own copy of the test table: seventeen rows of input and three
// columns of expected output, written in `site/src/pages/index.astro` and nowhere else. Nothing
// checked them. A table like that survives exactly as long as nobody edits the fixtures — the
// first edit makes two copies, and the second makes them disagree.
//
// So the table lives in `site/src/common/cases.json` now, and this file reads the same bytes the
// page imports. Two things are asserted here:
//
//   * the fixture itself is sound (the rows, the gaps that are deliberate, the v3 expectations
//     still match `lib/index.js`);
//   * the page really uses it, rather than carrying a hand-maintained copy again.
//
// The 2.x columns can only be checked where 2.x is installed, which is the page's build (it pins
// 2.5.2 itself). What this side can check is 3.0 — the generation that ships from this repository.
import { readFileSync } from 'node:fs';
import { expect } from 'chai';
import { markTones } from '../lib/index.js';

const casesUrl = new URL('../site/src/common/cases.json', import.meta.url);
const pageUrl = new URL('../site/src/pages/index.astro', import.meta.url);
const sitePackageUrl = new URL('../site/package.json', import.meta.url);

const cases = JSON.parse(readFileSync(casesUrl, 'utf8'));
const page = readFileSync(pageUrl, 'utf8');
const sitePackage = JSON.parse(readFileSync(sitePackageUrl, 'utf8'));

// Rows 13-17 are the inputs where 3.0 diverges on purpose. They carry a v3 expectation and no
// v1/v2 one: 2.x returns something visibly wrong there, and pinning that wrong output as "expected"
// would turn a bug into a contract.
const DIVERGENT_ROWS = ['13', '14', '15', '16', '17'];

describe('cases.json: the table is sound', () => {
	it('has the seventeen rows, numbered 1..17 in order', () => {
		expect(cases).to.be.an('array');
		expect(cases).to.have.length(17);
		expect(cases.map((row) => row.id)).to.deep.equal(
			Array.from({ length: 17 }, (_, index) => String(index + 1)),
		);
	});

	it('never repeats an input — a repeated row is a row someone forgot to change', () => {
		const inputs = cases.map((row) => row.input);
		expect(new Set(inputs).size).to.equal(inputs.length);
		for (const row of cases) {
			expect(row.input, `row ${row.id} has an empty input`).to.be.a('string').and.not.be.empty;
		}
	});

	it('declares a v3 expectation on every row, and v1/v2 on the rows that should agree', () => {
		for (const row of cases) {
			expect(row.v3, `row ${row.id} is missing v3`).to.be.a('string');
			if (DIVERGENT_ROWS.includes(row.id)) {
				expect(row.v1, `row ${row.id} must not declare v1`).to.be.undefined;
				expect(row.v2, `row ${row.id} must not declare v2`).to.be.undefined;
			} else {
				expect(row.v1, `row ${row.id} is missing v1`).to.be.a('string');
				expect(row.v2, `row ${row.id} is missing v2`).to.be.a('string');
			}
		}
	});

	it('keeps every v3 expectation true against lib/index.js', () => {
		const failures = [];
		for (const row of cases) {
			const actual = markTones(row.input);
			if (actual !== row.v3) {
				failures.push(`#${row.id} ${JSON.stringify(row.input)}: expected ${JSON.stringify(row.v3)}, got ${JSON.stringify(actual)}`);
			}
		}
		// All of them at once, so one run reports every row that broke instead of the first.
		expect(failures, failures.join('\n')).to.have.length(0);
	});
});

describe('cases.json: the page reads it, and only it', () => {
	it('imports the fixture instead of carrying its own table', () => {
		expect(page).to.include('from "../common/cases.json"');
		expect(page).to.not.include('const tests: TestCase[] = [');
	});

	it('holds no literal copy of an input that lives in the fixture', () => {
		// Two inputs that appear nowhere else on the page: not in the examples, the usage blocks,
		// the migration table, or the prose. If one shows up in index.astro, a second copy is back.
		for (const input of ['xun2 yin1 liu2 ge1', 'bong1 tv2 pe3 wir4']) {
			expect(page, `index.astro contains a copy of ${JSON.stringify(input)}`).to.not.include(input);
		}
	});
});

describe('the page runs two pinned releases', () => {
	const dependencies = sitePackage.dependencies ?? {};

	it('pins v1/v2 (pinyin-tone 2.x) to an exact version', () => {
		expect(dependencies['pinyin-tone'], 'site/package.json must pin pinyin-tone').to.match(
			/^\d+\.\d+\.\d+$/,
		);
	});

	it('pins v3 (the aliased 3.x) to an exact version too', () => {
		const spec = dependencies['pinyin-tone-v3'];
		expect(spec, 'site/package.json must pin pinyin-tone-v3').to.be.a('string');
		expect(spec.replace(/^npm:pinyin-tone@/, '')).to.match(/^\d+\.\d+\.\d+$/);
	});

	it('says which versions it runs, so the page is a record and not a mirror of latest', () => {
		// The page prints the pins it reads from site/package.json; if that read ever goes away,
		// the page silently becomes "whatever was installed when it was built".
		expect(page).to.include('site/package.json');
		expect(page).to.include('from "../../package.json"');
	});
});
