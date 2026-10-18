// The syllable table that `strict: true` accepts: the 426 syllables of Standard Mandarin.
//
// Where it comes from: pypinyin 0.55.0's pinyin_dict (1,549 toned syllables), stripped of
// tones and deduplicated, which leaves 425; intersecting that with the keys of lib/dict.js
// gives 421, and four interjection syllables the dictionary was missing are added back
// (pypinyin glosses n / ng as 唵, hm as 噷, hng as 哼, and gives m only m̄ / ḿ / m̀).
// Stripping tones is not optional — that table also carries toneless entries (biang, bong,
// din); only the syllable itself is kept.
//
// ê is written ê there, while the dictionary key is e^ (^ stands for the circumflex). The
// two do not line up because the spellings differ, not because ê is absent. The key is used
// here so that the input syntax can reach it.
//
// Note hm and hng: they are in the table (they are syllables — the dictionary has 噷 and 哼),
// but only in toneless form. The dictionary has no tones for either, so they pass in strict
// mode and still cannot produce a marked glyph. The table of preferred toned forms is
// NASAL_TONES in index.js — that is where to look.
//
// Why the table is needed at all: dict.js carries 1,952 keys so that input is forgiven, and
// 1,110 of those are the cartesian product of initials and finals (jui, juang, juei, biong);
// duang and biu are non-standard but spoken. The default mode accepts all of them; strict
// mode accepts only this table.
//
// Erhua is not listed: whether huar is legal follows entirely from hua, so the check just
// drops the trailing r and looks again. None of the 418 erhua syllables need a line here.
export default new Set(
    `a ai an ang ao ba bai ban bang bao bei ben beng bi bian biang biao bie bin
bing bo bong bu ca cai can cang cao ce cei cen ceng cha chai chan chang
chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun
chuo ci cong cou cu cuan cui cun cuo da dai dan dang dao de dei den deng
di dia dian diao die din ding diu dong dou du duan dui dun duo e e^ ei en eng
er fa fan fang fei fen feng fiao fo fou fu ga gai gan gang gao ge gei gen
geng gong gou gu gua guai guan guang gui gun guo ha hai han hang hao he
hei hen heng hm hng hong hou hu hua huai huan huang hui hun huo ji jia
jian jiang jiao jie jin jing jiong jiu ju juan jue jun ka kai kan kang kao
ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo la lai lan
lang lao le lei len leng li lia lian liang liao lie lin ling liu lo long
lou lu luan lun luo lv lve m ma mai man mang mao me mei men meng mi mian
miao mie min ming miu mo mou mu n na nai nan nang nao ne nei nen neng ng
ni nia nian niang niao nie nin ning niu nong nou nu nuan nun nuo nv nve o
ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu qi
qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ran rang rao re
ren reng ri rong rou ru rua ruan rui run ruo sa sai san sang sao se sen
seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai
shuan shuang shui shun shuo si song sou su suan sui sun suo ta tai tan
tang tao te tei teng ti tian tiao tie ting tong tou tu tuan tui tun tuo wa
wai wan wang wei wen weng wo wong wu xi xia xian xiang xiao xie xin xing
xiong xiu xu xuan xue xun ya yan yang yao ye yi yin ying yo yong you yu
yuan yue yun za zai zan zang zao ze zei zen zeng zha zhai zhan zhang zhao
zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun
zhuo zi zong zou zu zuan zui zun zuo`.trim().split(/\s+/),
);
