// `npm pack --json` does not have one shape.
//
// Measured: npm 11.21.2 prints an array of one entry; npm 12.2.2 prints an object keyed by package
// name. Both describe the same single package, so the guard normalises either form instead of
// unpacking with `const [info] = ...`, which throws `object is not iterable` under npm 12 — that is
// exactly how the first Publish run died (the workflow installs a newer npm than CI does).
//
// Node built-ins only, no dependencies: this runs right after `npm ci`.

export function firstPackInfo(parsed) {
    if (Array.isArray(parsed)) {
        if (parsed.length !== 1) {
            throw new TypeError(`npm pack described ${parsed.length} packages, expected one`);
        }
        return parsed[0];
    }
    if (parsed && typeof parsed === 'object') {
        const entries = Object.values(parsed);
        if (entries.length !== 1) {
            throw new TypeError(`npm pack described ${entries.length} packages, expected one`);
        }
        return entries[0];
    }
    throw new TypeError(`npm pack printed ${typeof parsed}, expected an array or an object`);
}
