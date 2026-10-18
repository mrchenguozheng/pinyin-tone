// 严格模式（strict: true）认的音节表：普通话 426 个音节。
//
// 来源：pypinyin 0.55.0 的 pinyin_dict（1549 条带调音节）去调、去重后得到 425 条，
// 与 lib/dict.js 的键取交集得 421 条，再补上词表原先缺的 4 个叹词音节
// （pypinyin 里 n / ng 注「唵」、hm 注「噷」、hng 注「哼」，m 只有 m̄ / ḿ / m̀ 三个带调形式）。
// 去调这一步不能省 —— 该表里混有无调条目（biang、bong、din），只保留音节本身。
//
// 另加一条 ê：它在上表里写作 ê，而词表的键是 e^（^ 表示扬抑符），
// 两边对不上不是它不存在，是写法不同。这里按词表的键写，才能被输入语法命中。
//
// 注意 hm 与 hng：它们在这张表里（是音节，词典收了噷与哼），但只有无调形式 ——
// 四声在词典里一个都没有，所以严格模式下立得住，却出不了带调字形。
// 带调形式的优先表在 index.js 的 NASAL_TONES 里，那才是该查的地方。
//
// 为什么需要这张表：词表（dict.js）为了宽容收了 1952 个键，其中 1110 条是
// 「声母 × 韵母」笛卡尔积的产物（jui、juang、juei、biong），另有 duang、biu
// 这类非标准但在用的口语音。默认模式全部放行，严格模式只认这张表。
//
// 儿化不单独列：huar 的合法性完全由基底 hua 决定，判定时去掉尾字母 r 再查一次
// 即可，所以 418 条儿化音节在这里一条都不用写。
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
