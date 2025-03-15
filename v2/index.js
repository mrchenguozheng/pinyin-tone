'use strict';
const b = require('./b');
const br = require('./br');
const c = require('./c');
const ch = require('./ch');
const chr = require('./chr');
const cr = require('./cr');
const d = require('./d');
const dr = require('./dr');
const f = require('./f');
const fr = require('./fr');
const g = require('./g');
const gr = require('./gr');
const h = require('./h');
const hr = require('./hr');
const j = require('./j');
const jr = require('./jr');
const k = require('./k');
const kr = require('./kr');
const l = require('./l');
const lr = require('./lr');
const m = require('./m');
const mr = require('./mr');
const n = require('./n');
const nr = require('./nr');
const p = require('./p');
const pr = require('./pr');
const q = require('./q');
const qr = require('./qr');
const r = require('./r');
const rr = require('./rr');
const s = require('./s');
const sh = require('./sh');
const shr = require('./shr');
const special = require('./special')
const sr = require('./sr');
const t = require('./t');
const tr = require('./tr');
const v = require('./v');
const vr = require('./vr');
const w = require('./w');
const wr = require('./wr');
const x = require('./x');
const xr = require('./xr');
const y = require('./y');
const yr = require('./yr');
const yunmu = require('./yunmu');
const yunmur = require('./yunmur');
const z = require('./z');
const zh = require('./zh');
const zhr = require('./zhr');
const zr = require('./zr');

const pinyin_dict_v2 = Object.assign({}, b, br, c, ch, chr, cr, d, dr, f, fr, g, gr, h, hr, j, jr, k, kr, l, lr, m, mr, n, nr, p, pr, q, qr, r, rr, s, sr, sh, shr, special, sr, t, tr, v, vr, w, wr, x, xr, y, yr, yunmu, yunmur, z, zh, zhr, zr);

// console.log(pinyin_dict_v2)

const regex = /(?<abc>[a-z]+)(?<num>[01234^]?)/;

/**
 * 
 * @longStr {string} longString
 * @return {string}
 */
function toPinyinTones(longString) {
    const stringArray = longString.trim().split(' ');

    return stringArray.map((str) => {
        const match = regex.exec(str);
        // if match and not undefined
        if (match && pinyin_dict_v2[match.groups.abc]) {
            return pinyin_dict_v2[match.groups.abc][parseInt(match.groups.num) || 0]; // is pinyin
        }
        return str; // is NOT pinyin
    }).join(' ');
}

module.exports = toPinyinTones;