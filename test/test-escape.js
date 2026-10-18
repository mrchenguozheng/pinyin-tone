// test/test-escape.js
// 转义：片段前紧邻的反斜杠让这一段原样，且只影响这一段。
//
// 用途是同一段输入里既有要标的拼音、又有必须保持原形的拉丁串：
//   'hao3 \M2 货币供应量' -> 'hǎo M2 货币供应量'
//
// 两条边界：
//   1. 只有「真的挡住了一次转换」才消耗反斜杠 —— 否则 `C:\Users`、`\texttt`
//      这类正常含反斜杠的文本会被吃掉一个字符。
//   2. 转义是一次性的：输出里不留标记，所以再跑一遍 M2 会被转。
import { expect } from 'chai';
import {markTones} from '../lib/index.js';

describe('转义：只挡住紧跟的那一段', () => {
    it('同一句里其余片段照转', () => {
        expect(markTones('hao3 \\M2 货币供应量')).to.equal('hǎo M2 货币供应量');
        expect(markTones('\\M2 N3')).to.equal('M2 Ň');
    });

    it('挡住的是整个片段，不只是第一个音节', () => {
        expect(markTones('\\ni3hao3')).to.equal('ni3hao3');
        expect(markTones('\\ju:1')).to.equal('ju:1');
        expect(markTones('\\E^2')).to.equal('E^2');
        expect(markTones('\\U:E1')).to.equal('U:E1');
    });

    it('反斜杠写在片段之后不算', () => {
        expect(markTones('M2\\')).to.equal('Ḿ\\');
        expect(markTones('x\\M2')).to.equal('xM2');
    });

    it('连续两个反斜杠时只有紧邻的那个被吃掉', () => {
        // 源码里写 '\\\\M2' 才是「两个反斜杠 + M2」
        expect(markTones('\\\\M2')).to.equal('\\M2');
    });
});

describe('转义：没挡住转换时原样保留', () => {
    it('后面那段本来就不转，反斜杠不消失', () => {
        expect(markTones('C:\\Users')).to.equal('C:\\Users');
        expect(markTones('\\texttt{x}')).to.equal('\\texttt{x}');
        // a 是音节，但无数字时输出与输入相同 —— 没有拦下任何变化
        expect(markTones('\\a')).to.equal('\\a');
        // 下划线让它本来就不转
        expect(markTones('\\ni3_hao3')).to.equal('\\ni3_hao3');
    });
});

describe('转义：一次性', () => {
    it('输出不带标记，第二遍就挡不住了', () => {
        const once = markTones('\\M2 货币供应量');
        expect(once).to.equal('M2 货币供应量');
        expect(markTones(once)).to.equal('Ḿ 货币供应量');
    });
});
