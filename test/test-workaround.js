import _ from '../workaround/index.js'; // 使用 ES 模块导入
import { expect } from 'chai'; // 导入 Chai 的 expect

describe('markTheVowel', () => {

    it('should convert vowels (with/without numbers) to pinyin with tones', () => {
        // a
        expect(_('a')).to.eq('a')
        expect(_('a0')).to.eq('a')
        expect(_('a1')).to.eq('ā')
        expect(_('a2')).to.eq('á')
        expect(_('a3')).to.eq('ǎ')
        expect(_('a4')).to.eq('à')

        expect(_('o')).to.eq('o')
        expect(_('o0')).to.eq('o')
        expect(_('o1')).to.eq('ō')
        expect(_('o2')).to.eq('ó')
        expect(_('o3')).to.eq('ǒ')
        expect(_('o4')).to.eq('ò')

        expect(_('e')).to.eq('e')
        expect(_('e0')).to.eq('e')
        expect(_('e1')).to.eq('ē')
        expect(_('e2')).to.eq('é')
        expect(_('e3')).to.eq('ě')
        expect(_('e4')).to.eq('è')
        // expect(_('e5')).to.eq('ê')

        expect(_('i')).to.eq('i')
        expect(_('i0')).to.eq('i')
        expect(_('i1')).to.eq('ī')
        expect(_('i2')).to.eq('í')
        expect(_('i3')).to.eq('ǐ')
        expect(_('i4')).to.eq('ì')

        expect(_('u')).to.eq('u')
        expect(_('u0')).to.eq('u')
        expect(_('u1')).to.eq('ū')
        expect(_('u2')).to.eq('ú')
        expect(_('u3')).to.eq('ǔ')
        expect(_('u4')).to.eq('ù')

        expect(_('v')).to.eq('ü')
        expect(_('v0')).to.eq('ü')
        expect(_('v1')).to.eq('ǖ')
        expect(_('v2')).to.eq('ǘ')
        expect(_('v3')).to.eq('ǚ')
        expect(_('v4')).to.eq('ǜ')
    });

});