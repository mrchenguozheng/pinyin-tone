'use strict';
import b from './b.js';
import br from './br.js';
import c from './c.js';
import ch from './ch.js';
import chr from './chr.js';
import cr from './cr.js';
import d from './d.js';
import dr from './dr.js';
import f from './f.js';
import fr from './fr.js';
import g from './g.js';
import gr from './gr.js';
import h from './h.js';
import hr from './hr.js';
import j from './j.js';
import jr from './jr.js';
import k from './k.js';
import kr from './kr.js';
import l from './l.js';
import lr from './lr.js';
import m from './m.js';
import mr from './mr.js';
import n from './n.js';
import nr from './nr.js';
import p from './p.js';
import pr from './pr.js';
import q from './q.js';
import qr from './qr.js';
import r from './r.js';
import rr from './rr.js';
import s from './s.js';
import sh from './sh.js';
import shr from './shr.js';
import special from './special.js';
import sr from './sr.js';
import t from './t.js';
import tr from './tr.js';
import v from './v.js';
import vr from './vr.js';
import w from './w.js';
import wr from './wr.js';
import x from './x.js';
import xr from './xr.js';
import y from './y.js';
import yr from './yr.js';
import yunmu from './yunmu.js';
import yunmur from './yunmur.js';
import z from './z.js';
import zh from './zh.js';
import zhr from './zhr.js';
import zr from './zr.js';

const pinyin_dict_v2 = Object.assign({}, b, br, c, ch, chr, cr, d, dr, f, fr, g, gr, h, hr, j, jr, k, kr, l, lr, m, mr, n, nr, p, pr, q, qr, r, rr, s, sr, sh, shr, special, t, tr, v, vr, w, wr, x, xr, y, yr, yunmu, yunmur, z, zh, zhr, zr);

// The whole piece has to be a syllable. Without the anchors this matched a slice of the
// text and threw the rest away: 'Hao3' became 'ǎo', 'aX1' became 'a'.
// Upper case is part of the match so that 'Hao3' converts instead of being cut at 'H'.
//
// '^' used to be accepted as a tone and then dropped, because parseInt('^') is NaN and the
// fallback read that as the neutral tone: 'e^' came back as 'e' where v1 gives 'ê'. This
// table has no ê entries, so the marker is not accepted at all and 'e^' stays as written.
const regex = /^(?<abc>[A-Za-z]+)(?<num>[012345]?)$/;

// How a syllable was capitalised. A syllable is written all lower case, or with its first
// letter capitalised, or all caps. Anything else ('hAo3', 'HaO3') is not a spelling anyone
// writes, and guessing which letter the writer meant would be inventing a rule.
const LOWER = 0;
const TITLE = 1;
const UPPER = 2;
const MIXED = -1;

function readCase(abc) {
    if (abc === abc.toLowerCase()) {
        return LOWER;
    }
    if (abc === abc.toUpperCase()) {
        return UPPER;
    }
    if (abc[0].toUpperCase() + abc.slice(1).toLowerCase() === abc) {
        return TITLE;
    }
    return MIXED;
}

function applyCase(toned, shape) {
    if (shape === UPPER) {
        return toned.toUpperCase();
    }
    if (shape === TITLE) {
        return toned[0].toUpperCase() + toned.slice(1);
    }
    return toned;
}

// One warning per spelling, so that a caller looping over a thousand lines gets one line of
// console noise and not a thousand. Only syllables are ever added, so the set cannot grow
// past the dictionary no matter how much text goes through. Warnings are advisory: the
// return value is the same either way, and nothing here throws.
//
// Exported for tests only, as a way to reset the memory between cases; it is not part of
// the package's declared surface, so nothing should depend on it staying here.
const warned = new Set();

function warnOnce(abc) {
    if (warned.has(abc)) {
        return;
    }
    warned.add(abc);
    console.warn(
        'pinyin-tone: "' + abc + '" was left as is. A syllable is written all lower case, ' +
        'with its first letter capitalised, or in all caps; anything else was not converted.'
    );
}

// 0 and 5 both mean the neutral tone, and the table keeps it at index 0. Any other digit
// was rejected by the pattern already, so it cannot arrive here.
function readTone(num) {
    const tone = parseInt(num, 10);
    return tone >= 1 && tone <= 4 ? tone : 0;
}

/**
 *
 * @param {string} longString
 * @return {string}
 */
function toPinyinTones(longString) {
    // Hand anything that is not a string back untouched, the way v1 does. Without this,
    // toPinyinTones(null) and toPinyinTones() throw, so a caller who passes an optional
    // variable has to guard the call instead of just getting the input back.
    if (typeof longString !== 'string') {
        return longString;
    }

    // Split on whitespace and keep the separators, so the text comes back the shape it went
    // in: '  ma1  ' keeps its spaces, and 'ma1\nma2' converts both lines. Splitting on a
    // single space and trimming meant a leading space was dropped and a line break anywhere
    // left the whole input untouched.
    return longString.split(/(\s+)/).map((str) => {
        if (str === '' || /^\s+$/.test(str)) {
            return str;
        }

        const match = regex.exec(str);
        if (!match) {
            return str; // is NOT pinyin
        }

        // The table is keyed by lower case syllables, so case is a property of the input
        // rather than of the key: read which shape the piece was written in, look up the
        // lower case form, then put the shape back on the result.
        const abc = match.groups.abc;
        const entry = pinyin_dict_v2[abc.toLowerCase()];
        const shape = readCase(abc);

        if (shape === MIXED) {
            // A syllable has three spellings and this is none of them, so leave it alone.
            // Say so only if the lower case form is a syllable at all: 'hAo3' is a mistyped
            // 'hao3', while 'iPhone' and 'JavaScript' are ordinary words, and warning on
            // every mixed-case word in the input makes the warning worthless.
            if (Array.isArray(entry)) {
                warnOnce(abc);
            }
            return str; // is NOT pinyin
        }
        if (!Array.isArray(entry)) {
            // An ordinary word ('hello', 'constructor'). Saying anything here would warn on
            // most of the input a caller feeds in, so it stays quiet.
            return str; // is NOT pinyin
        }

        return applyCase(entry[readTone(match.groups.num)], shape);
    }).join('');
}

/**
 * split syllables string by number
 * @param {string} text
 * @returns {string}
 */
function splitUnspacedSyllables(text){
    if (typeof text !== 'string') {
        return text;
    }

    // insert a separator between each number
    return text.replace(/(\d)/g, '$1 ') // add space after each number
    .replace(/\s+/g, ' ') // remove multiple spaces
    .trim() // remove leading and trailing spaces
}

/**
 * output pinyin string without space like "hànyǔpīnyīn"
 * @param {string} unspacedSyllables unspaced pinyin string like "han4yu3pin1yin1"
 * @returns {string}
 */
function convertUnspacedPinyin(unspacedSyllables){
    if (typeof unspacedSyllables !== 'string') {
        return unspacedSyllables;
    }

    return toPinyinTones(splitUnspacedSyllables(unspacedSyllables)).split(' ').join('')
}

export default toPinyinTones;
export {splitUnspacedSyllables};
export {convertUnspacedPinyin};
export {warned as __warnedSpellings}; // tests only, see the comment on `warned`
