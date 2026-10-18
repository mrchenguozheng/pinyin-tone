// 构建产物，不要直接改 —— 源在 lib/，用 `npm run build:cjs` 重新生成。
// 由 scripts/build-cjs.mjs 从 lib/{dict,core,index}.js 逐字包裹而来：
// 逻辑与 ESM 版本同源，只把 import 换成对包裹结果的引用、把 export 挂到 module.exports。

'use strict';

// 每个槽位是那个模块一次求值的结果，顺序与 lib/ 里的依赖顺序一致
const __modules = [];

__modules[0] = (function () {
    let module = {exports: {}};
    // 每个键对应它的无调形式；四个声调由 index.js 里的 applyToneMark 在运行时加上。
    // 只存基底的理由：9760 条输出（1952 键 × 5 个声调）里有 7808 条（80%）是同一基底的
    // 机械变形，「a -> ā/á/ǎ/à」这一步是规则，不是数据。存 1 条基底 + 一条规则，
    // 与存 5 条预生成字符串逐条等价（已对全表 × 5 断言）。
    //
    // 1952 个键里，1877 个的基底就是「键把 v 换成 ü」，其余 75 个例外原样写在值里
    // （74 个键的 v 是辅音字母、e^ 是 ê）。故值仍逐键写出，不做字符串替换推导。
    //
    // 键必须能被输入语法命中：纯小写字母，或 e^（^ 表示 ê 的扬抑符）。
    // 这里原本还有个 'ü' 键，值与 v 完全重复，而 [a-z]+ 永远匹配不到 ü ——
    // 是条打不中的死数据，已删除。test/test-keys.js 逐键验证这条不变量。
    module.exports = {

        // b.js
        ba: 'ba',
        bo: 'bo',
        be: 'be',
        bai: 'bai',
        bei: 'bei',
        bao: 'bao',
        bou: 'bou',
        ban: 'ban',
        ben: 'ben',
        bang: 'bang',
        beng: 'beng',
        bong: 'bong',
        bi: 'bi',
        bia: 'bia',
        bie: 'bie',
        biao: 'biao',
        biou: 'biou',
        biu: 'biu',
        bian: 'bian',
        bin: 'bin',
        biang: 'biang',
        bing: 'bing',
        biong: 'biong',
        bui: 'bui',
        bu: 'bu',
        bua: 'bua',
        buo: 'buo',
        buai: 'buai',
        buei: 'buei',
        buan: 'buan',
        buen: 'buen',
        bun: 'bun',
        buang: 'buang',
        bueng: 'bueng',
        bv: 'bü',
        bve: 'büe',
        bue: 'bue',
        bvan: 'büan',
        bvn: 'bün',

        // br.js
        bar: 'bar',
        bor: 'bor',
        ber: 'ber',
        bair: 'bair',
        beir: 'beir',
        baor: 'baor',
        bour: 'bour',
        banr: 'banr',
        benr: 'benr',
        bangr: 'bangr',
        bengr: 'bengr',
        bongr: 'bongr',
        bir: 'bir',
        biar: 'biar',
        bier: 'bier',
        biaor: 'biaor',
        biour: 'biour',
        biur: 'biur',
        bianr: 'bianr',
        binr: 'binr',
        biangr: 'biangr',
        bingr: 'bingr',
        biongr: 'biongr',
        buir: 'buir',
        bur: 'bur',
        buar: 'buar',
        buor: 'buor',
        buair: 'buair',
        bueir: 'bueir',
        buanr: 'buanr',
        buenr: 'buenr',
        bunr: 'bunr',
        buangr: 'buangr',
        buengr: 'buengr',
        bvr: 'bür',
        bver: 'büer',
        buer: 'buer',
        bvanr: 'büanr',
        bvnr: 'bünr',

        // c.js
        ca: 'ca',
        co: 'co',
        ce: 'ce',
        cai: 'cai',
        cei: 'cei',
        cao: 'cao',
        cou: 'cou',
        can: 'can',
        cen: 'cen',
        cang: 'cang',
        ceng: 'ceng',
        cong: 'cong',
        ci: 'ci',
        cia: 'cia',
        cie: 'cie',
        ciao: 'ciao',
        ciou: 'ciou',
        ciu: 'ciu',
        cian: 'cian',
        cin: 'cin',
        ciang: 'ciang',
        cing: 'cing',
        ciong: 'ciong',
        cui: 'cui',
        cu: 'cu',
        cua: 'cua',
        cuo: 'cuo',
        cuai: 'cuai',
        cuei: 'cuei',
        cuan: 'cuan',
        cuen: 'cuen',
        cun: 'cun',
        cuang: 'cuang',
        cueng: 'cueng',
        cv: 'cü',
        cve: 'cüe',
        cue: 'cue',
        cvan: 'cüan',
        cvn: 'cün',

        // ch.js
        cha: 'cha',
        cho: 'cho',
        che: 'che',
        chai: 'chai',
        chei: 'chei',
        chao: 'chao',
        chou: 'chou',
        chan: 'chan',
        chen: 'chen',
        chang: 'chang',
        cheng: 'cheng',
        chong: 'chong',
        chi: 'chi',
        chia: 'chia',
        chie: 'chie',
        chiao: 'chiao',
        chiou: 'chiou',
        chiu: 'chiu',
        chian: 'chian',
        chin: 'chin',
        chiang: 'chiang',
        ching: 'ching',
        chiong: 'chiong',
        chui: 'chui',
        chu: 'chu',
        chua: 'chua',
        chuo: 'chuo',
        chuai: 'chuai',
        chuei: 'chuei',
        chuan: 'chuan',
        chuen: 'chuen',
        chun: 'chun',
        chuang: 'chuang',
        chueng: 'chueng',
        chv: 'chü',
        chve: 'chüe',
        chue: 'chue',
        chvan: 'chüan',
        chvn: 'chün',

        // chr.js
        char: 'char',
        chor: 'chor',
        cher: 'cher',
        chair: 'chair',
        cheir: 'cheir',
        chaor: 'chaor',
        chour: 'chour',
        chanr: 'chanr',
        chenr: 'chenr',
        changr: 'changr',
        chengr: 'chengr',
        chongr: 'chongr',
        chir: 'chir',
        chiar: 'chiar',
        chier: 'chier',
        chiaor: 'chiaor',
        chiour: 'chiour',
        chiur: 'chiur',
        chianr: 'chianr',
        chinr: 'chinr',
        chiangr: 'chiangr',
        chingr: 'chingr',
        chiongr: 'chiongr',
        chuir: 'chuir',
        chur: 'chur',
        chuar: 'chuar',
        chuor: 'chuor',
        chuair: 'chuair',
        chueir: 'chueir',
        chuanr: 'chuanr',
        chuenr: 'chuenr',
        chunr: 'chunr',
        chuangr: 'chuangr',
        chuengr: 'chuengr',
        chvr: 'chür',
        chver: 'chüer',
        chuer: 'chuer',
        chvanr: 'chüanr',
        chvnr: 'chünr',

        // cr.js
        car: 'car',
        cor: 'cor',
        cer: 'cer',
        cair: 'cair',
        ceir: 'ceir',
        caor: 'caor',
        cour: 'cour',
        canr: 'canr',
        cenr: 'cenr',
        cangr: 'cangr',
        cengr: 'cengr',
        congr: 'congr',
        cir: 'cir',
        ciar: 'ciar',
        cier: 'cier',
        ciaor: 'ciaor',
        ciour: 'ciour',
        ciur: 'ciur',
        cianr: 'cianr',
        cinr: 'cinr',
        ciangr: 'ciangr',
        cingr: 'cingr',
        ciongr: 'ciongr',
        cuir: 'cuir',
        cur: 'cur',
        cuar: 'cuar',
        cuor: 'cuor',
        cuair: 'cuair',
        cueir: 'cueir',
        cuanr: 'cuanr',
        cuenr: 'cuenr',
        cunr: 'cunr',
        cuangr: 'cuangr',
        cuengr: 'cuengr',
        cvr: 'cür',
        cver: 'cüer',
        cuer: 'cuer',
        cvanr: 'cüanr',
        cvnr: 'cünr',

        // d.js
        da: 'da',
        do: 'do',
        de: 'de',
        dai: 'dai',
        dei: 'dei',
        dao: 'dao',
        dou: 'dou',
        dan: 'dan',
        den: 'den',
        dang: 'dang',
        deng: 'deng',
        dong: 'dong',
        di: 'di',
        dia: 'dia',
        die: 'die',
        diao: 'diao',
        diou: 'diou',
        diu: 'diu',
        dian: 'dian',
        din: 'din',
        diang: 'diang',
        ding: 'ding',
        diong: 'diong',
        dui: 'dui',
        du: 'du',
        dua: 'dua',
        duo: 'duo',
        duai: 'duai',
        duei: 'duei',
        duan: 'duan',
        duen: 'duen',
        dun: 'dun',
        duang: 'duang',
        dueng: 'dueng',
        dv: 'dü',
        dve: 'düe',
        due: 'due',
        dvan: 'düan',
        dvn: 'dün',

        // dr.js
        dar: 'dar',
        dor: 'dor',
        der: 'der',
        dair: 'dair',
        deir: 'deir',
        daor: 'daor',
        dour: 'dour',
        danr: 'danr',
        denr: 'denr',
        dangr: 'dangr',
        dengr: 'dengr',
        dongr: 'dongr',
        dir: 'dir',
        diar: 'diar',
        dier: 'dier',
        diaor: 'diaor',
        diour: 'diour',
        diur: 'diur',
        dianr: 'dianr',
        dinr: 'dinr',
        diangr: 'diangr',
        dingr: 'dingr',
        diongr: 'diongr',
        duir: 'duir',
        dur: 'dur',
        duar: 'duar',
        duor: 'duor',
        duair: 'duair',
        dueir: 'dueir',
        duanr: 'duanr',
        duenr: 'duenr',
        dunr: 'dunr',
        duangr: 'duangr',
        duengr: 'duengr',
        dvr: 'dür',
        dver: 'düer',
        duer: 'duer',
        dvanr: 'düanr',
        dvnr: 'dünr',

        // f.js
        fa: 'fa',
        fo: 'fo',
        fe: 'fe',
        fai: 'fai',
        fei: 'fei',
        fao: 'fao',
        fou: 'fou',
        fan: 'fan',
        fen: 'fen',
        fang: 'fang',
        feng: 'feng',
        fong: 'fong',
        fi: 'fi',
        fia: 'fia',
        fie: 'fie',
        fiao: 'fiao',
        fiou: 'fiou',
        fiu: 'fiu',
        fian: 'fian',
        fin: 'fin',
        fiang: 'fiang',
        fing: 'fing',
        fiong: 'fiong',
        fui: 'fui',
        fu: 'fu',
        fua: 'fua',
        fuo: 'fuo',
        fuai: 'fuai',
        fuei: 'fuei',
        fuan: 'fuan',
        fuen: 'fuen',
        fun: 'fun',
        fuang: 'fuang',
        fueng: 'fueng',
        fv: 'fü',
        fve: 'füe',
        fue: 'fue',
        fvan: 'füan',
        fvn: 'fün',

        // fr.js
        far: 'far',
        for: 'for',
        fer: 'fer',
        fair: 'fair',
        feir: 'feir',
        faor: 'faor',
        four: 'four',
        fanr: 'fanr',
        fenr: 'fenr',
        fangr: 'fangr',
        fengr: 'fengr',
        fongr: 'fongr',
        fir: 'fir',
        fiar: 'fiar',
        fier: 'fier',
        fiaor: 'fiaor',
        fiour: 'fiour',
        fiur: 'fiur',
        fianr: 'fianr',
        finr: 'finr',
        fiangr: 'fiangr',
        fingr: 'fingr',
        fiongr: 'fiongr',
        fuir: 'fuir',
        fur: 'fur',
        fuar: 'fuar',
        fuor: 'fuor',
        fuair: 'fuair',
        fueir: 'fueir',
        fuanr: 'fuanr',
        fuenr: 'fuenr',
        funr: 'funr',
        fuangr: 'fuangr',
        fuengr: 'fuengr',
        fvr: 'für',
        fver: 'füer',
        fuer: 'fuer',
        fvanr: 'füanr',
        fvnr: 'fünr',

        // g.js
        ga: 'ga',
        go: 'go',
        ge: 'ge',
        gai: 'gai',
        gei: 'gei',
        gao: 'gao',
        gou: 'gou',
        gan: 'gan',
        gen: 'gen',
        gang: 'gang',
        geng: 'geng',
        gong: 'gong',
        gi: 'gi',
        gia: 'gia',
        gie: 'gie',
        giao: 'giao',
        giou: 'giou',
        giu: 'giu',
        gian: 'gian',
        gin: 'gin',
        giang: 'giang',
        ging: 'ging',
        giong: 'giong',
        gui: 'gui',
        gu: 'gu',
        gua: 'gua',
        guo: 'guo',
        guai: 'guai',
        guei: 'guei',
        guan: 'guan',
        guen: 'guen',
        gun: 'gun',
        guang: 'guang',
        gueng: 'gueng',
        gv: 'gü',
        gve: 'güe',
        gue: 'gue',
        gvan: 'güan',
        gvn: 'gün',

        // gr.js
        gar: 'gar',
        gor: 'gor',
        ger: 'ger',
        gair: 'gair',
        geir: 'geir',
        gaor: 'gaor',
        gour: 'gour',
        ganr: 'ganr',
        genr: 'genr',
        gangr: 'gangr',
        gengr: 'gengr',
        gongr: 'gongr',
        gir: 'gir',
        giar: 'giar',
        gier: 'gier',
        giaor: 'giaor',
        giour: 'giour',
        giur: 'giur',
        gianr: 'gianr',
        ginr: 'ginr',
        giangr: 'giangr',
        gingr: 'gingr',
        giongr: 'giongr',
        guir: 'guir',
        gur: 'gur',
        guar: 'guar',
        guor: 'guor',
        guair: 'guair',
        gueir: 'gueir',
        guanr: 'guanr',
        guenr: 'guenr',
        gunr: 'gunr',
        guangr: 'guangr',
        guengr: 'guengr',
        gvr: 'gür',
        gver: 'güer',
        guer: 'guer',
        gvanr: 'güanr',
        gvnr: 'günr',

        // h.js
        ha: 'ha',
        ho: 'ho',
        he: 'he',
        hai: 'hai',
        hei: 'hei',
        hao: 'hao',
        hou: 'hou',
        han: 'han',
        hen: 'hen',
        hang: 'hang',
        heng: 'heng',
        hong: 'hong',
        hi: 'hi',
        hia: 'hia',
        hie: 'hie',
        hiao: 'hiao',
        hiou: 'hiou',
        hiu: 'hiu',
        hian: 'hian',
        hin: 'hin',
        hiang: 'hiang',
        hing: 'hing',
        hiong: 'hiong',
        hui: 'hui',
        hu: 'hu',
        hua: 'hua',
        huo: 'huo',
        huai: 'huai',
        huei: 'huei',
        huan: 'huan',
        huen: 'huen',
        hun: 'hun',
        huang: 'huang',
        hueng: 'hueng',
        hv: 'hü',
        hve: 'hüe',
        hue: 'hue',
        hvan: 'hüan',
        hvn: 'hün',

        // hr.js
        har: 'har',
        hor: 'hor',
        her: 'her',
        hair: 'hair',
        heir: 'heir',
        haor: 'haor',
        hour: 'hour',
        hanr: 'hanr',
        henr: 'henr',
        hangr: 'hangr',
        hengr: 'hengr',
        hongr: 'hongr',
        hir: 'hir',
        hiar: 'hiar',
        hier: 'hier',
        hiaor: 'hiaor',
        hiour: 'hiour',
        hiur: 'hiur',
        hianr: 'hianr',
        hinr: 'hinr',
        hiangr: 'hiangr',
        hingr: 'hingr',
        hiongr: 'hiongr',
        huir: 'huir',
        hur: 'hur',
        huar: 'huar',
        huor: 'huor',
        huair: 'huair',
        hueir: 'hueir',
        huanr: 'huanr',
        huenr: 'huenr',
        hunr: 'hunr',
        huangr: 'huangr',
        huengr: 'huengr',
        hvr: 'hür',
        hver: 'hüer',
        huer: 'huer',
        hvanr: 'hüanr',
        hvnr: 'hünr',

        // j.js
        ja: 'ja',
        jo: 'jo',
        je: 'je',
        jai: 'jai',
        jei: 'jei',
        jao: 'jao',
        jou: 'jou',
        jan: 'jan',
        jen: 'jen',
        jang: 'jang',
        jeng: 'jeng',
        jong: 'jong',
        ji: 'ji',
        jia: 'jia',
        jie: 'jie',
        jiao: 'jiao',
        jiou: 'jiou',
        jiu: 'jiu',
        jian: 'jian',
        jin: 'jin',
        jiang: 'jiang',
        jing: 'jing',
        jiong: 'jiong',
        jui: 'jui',
        ju: 'ju',
        jua: 'jua',
        juo: 'juo',
        juai: 'juai',
        juei: 'juei',
        juan: 'juan',
        juen: 'juen',
        jun: 'jun',
        juang: 'juang',
        jueng: 'jueng',
        jv: 'jü',
        jve: 'jüe',
        jue: 'jue',
        jvan: 'jüan',
        jvn: 'jün',

        // jr.js
        jar: 'jar',
        jor: 'jor',
        jer: 'jer',
        jair: 'jair',
        jeir: 'jeir',
        jaor: 'jaor',
        jour: 'jour',
        janr: 'janr',
        jenr: 'jenr',
        jangr: 'jangr',
        jengr: 'jengr',
        jongr: 'jongr',
        jir: 'jir',
        jiar: 'jiar',
        jier: 'jier',
        jiaor: 'jiaor',
        jiour: 'jiour',
        jiur: 'jiur',
        jianr: 'jianr',
        jinr: 'jinr',
        jiangr: 'jiangr',
        jingr: 'jingr',
        jiongr: 'jiongr',
        juir: 'juir',
        jur: 'jur',
        juar: 'juar',
        juor: 'juor',
        juair: 'juair',
        jueir: 'jueir',
        juanr: 'juanr',
        juenr: 'juenr',
        junr: 'junr',
        juangr: 'juangr',
        juengr: 'juengr',
        jvr: 'jür',
        jver: 'jüer',
        juer: 'juer',
        jvanr: 'jüanr',
        jvnr: 'jünr',

        // k.js
        ka: 'ka',
        ko: 'ko',
        ke: 'ke',
        kai: 'kai',
        kei: 'kei',
        kao: 'kao',
        kou: 'kou',
        kan: 'kan',
        ken: 'ken',
        kang: 'kang',
        keng: 'keng',
        kong: 'kong',
        ki: 'ki',
        kia: 'kia',
        kie: 'kie',
        kiao: 'kiao',
        kiou: 'kiou',
        kiu: 'kiu',
        kian: 'kian',
        kin: 'kin',
        kiang: 'kiang',
        king: 'king',
        kiong: 'kiong',
        kui: 'kui',
        ku: 'ku',
        kua: 'kua',
        kuo: 'kuo',
        kuai: 'kuai',
        kuei: 'kuei',
        kuan: 'kuan',
        kuen: 'kuen',
        kun: 'kun',
        kuang: 'kuang',
        kueng: 'kueng',
        kv: 'kü',
        kve: 'küe',
        kue: 'kue',
        kvan: 'küan',
        kvn: 'kün',

        // kr.js
        kar: 'kar',
        kor: 'kor',
        ker: 'ker',
        kair: 'kair',
        keir: 'keir',
        kaor: 'kaor',
        kour: 'kour',
        kanr: 'kanr',
        kenr: 'kenr',
        kangr: 'kangr',
        kengr: 'kengr',
        kongr: 'kongr',
        kir: 'kir',
        kiar: 'kiar',
        kier: 'kier',
        kiaor: 'kiaor',
        kiour: 'kiour',
        kiur: 'kiur',
        kianr: 'kianr',
        kinr: 'kinr',
        kiangr: 'kiangr',
        kingr: 'kingr',
        kiongr: 'kiongr',
        kuir: 'kuir',
        kur: 'kur',
        kuar: 'kuar',
        kuor: 'kuor',
        kuair: 'kuair',
        kueir: 'kueir',
        kuanr: 'kuanr',
        kuenr: 'kuenr',
        kunr: 'kunr',
        kuangr: 'kuangr',
        kuengr: 'kuengr',
        kvr: 'kür',
        kver: 'küer',
        kuer: 'kuer',
        kvanr: 'küanr',
        kvnr: 'künr',

        // l.js
        la: 'la',
        lo: 'lo',
        le: 'le',
        lai: 'lai',
        lei: 'lei',
        lao: 'lao',
        lou: 'lou',
        lan: 'lan',
        len: 'len',
        lang: 'lang',
        leng: 'leng',
        long: 'long',
        li: 'li',
        lia: 'lia',
        lie: 'lie',
        liao: 'liao',
        liou: 'liou',
        liu: 'liu',
        lian: 'lian',
        lin: 'lin',
        liang: 'liang',
        ling: 'ling',
        liong: 'liong',
        lui: 'lui',
        lu: 'lu',
        lua: 'lua',
        luo: 'luo',
        luai: 'luai',
        luei: 'luei',
        luan: 'luan',
        luen: 'luen',
        lun: 'lun',
        luang: 'luang',
        lueng: 'lueng',
        lv: 'lü',
        lve: 'lüe',
        lue: 'lue',
        lvan: 'lüan',
        lvn: 'lün',

        // lr.js
        lar: 'lar',
        lor: 'lor',
        ler: 'ler',
        lair: 'lair',
        leir: 'leir',
        laor: 'laor',
        lour: 'lour',
        lanr: 'lanr',
        lenr: 'lenr',
        langr: 'langr',
        lengr: 'lengr',
        longr: 'longr',
        lir: 'lir',
        liar: 'liar',
        lier: 'lier',
        liaor: 'liaor',
        liour: 'liour',
        liur: 'liur',
        lianr: 'lianr',
        linr: 'linr',
        liangr: 'liangr',
        lingr: 'lingr',
        liongr: 'liongr',
        luir: 'luir',
        lur: 'lur',
        luar: 'luar',
        luor: 'luor',
        luair: 'luair',
        lueir: 'lueir',
        luanr: 'luanr',
        luenr: 'luenr',
        lunr: 'lunr',
        luangr: 'luangr',
        luengr: 'luengr',
        lvr: 'lür',
        lver: 'lüer',
        luer: 'luer',
        lvanr: 'lüanr',
        lvnr: 'lünr',

        // m.js
        ma: 'ma',
        mo: 'mo',
        me: 'me',
        mai: 'mai',
        mei: 'mei',
        mao: 'mao',
        mou: 'mou',
        man: 'man',
        men: 'men',
        mang: 'mang',
        meng: 'meng',
        mong: 'mong',
        mi: 'mi',
        mia: 'mia',
        mie: 'mie',
        miao: 'miao',
        miou: 'miou',
        miu: 'miu',
        mian: 'mian',
        min: 'min',
        miang: 'miang',
        ming: 'ming',
        miong: 'miong',
        mui: 'mui',
        mu: 'mu',
        mua: 'mua',
        muo: 'muo',
        muai: 'muai',
        muei: 'muei',
        muan: 'muan',
        muen: 'muen',
        mun: 'mun',
        muang: 'muang',
        mueng: 'mueng',
        mv: 'mü',
        mve: 'müe',
        mue: 'mue',
        mvan: 'müan',
        mvn: 'mün',

        // mr.js
        mar: 'mar',
        mor: 'mor',
        mer: 'mer',
        mair: 'mair',
        meir: 'meir',
        maor: 'maor',
        mour: 'mour',
        manr: 'manr',
        menr: 'menr',
        mangr: 'mangr',
        mengr: 'mengr',
        mongr: 'mongr',
        mir: 'mir',
        miar: 'miar',
        mier: 'mier',
        miaor: 'miaor',
        miour: 'miour',
        miur: 'miur',
        mianr: 'mianr',
        minr: 'minr',
        miangr: 'miangr',
        mingr: 'mingr',
        miongr: 'miongr',
        muir: 'muir',
        mur: 'mur',
        muar: 'muar',
        muor: 'muor',
        muair: 'muair',
        mueir: 'mueir',
        muanr: 'muanr',
        muenr: 'muenr',
        munr: 'munr',
        muangr: 'muangr',
        muengr: 'muengr',
        mvr: 'mür',
        mver: 'müer',
        muer: 'muer',
        mvanr: 'müanr',
        mvnr: 'münr',

        // n.js
        na: 'na',
        no: 'no',
        ne: 'ne',
        nai: 'nai',
        nei: 'nei',
        nao: 'nao',
        nou: 'nou',
        nan: 'nan',
        nen: 'nen',
        nang: 'nang',
        neng: 'neng',
        nong: 'nong',
        ni: 'ni',
        nia: 'nia',
        nie: 'nie',
        niao: 'niao',
        niou: 'niou',
        niu: 'niu',
        nian: 'nian',
        nin: 'nin',
        niang: 'niang',
        ning: 'ning',
        niong: 'niong',
        nui: 'nui',
        nu: 'nu',
        nua: 'nua',
        nuo: 'nuo',
        nuai: 'nuai',
        nuei: 'nuei',
        nuan: 'nuan',
        nuen: 'nuen',
        nun: 'nun',
        nuang: 'nuang',
        nueng: 'nueng',
        nv: 'nü',
        nve: 'nüe',
        nue: 'nue',
        nvan: 'nüan',
        nvn: 'nün',

        // nr.js
        nar: 'nar',
        nor: 'nor',
        ner: 'ner',
        nair: 'nair',
        neir: 'neir',
        naor: 'naor',
        nour: 'nour',
        nanr: 'nanr',
        nenr: 'nenr',
        nangr: 'nangr',
        nengr: 'nengr',
        nongr: 'nongr',
        nir: 'nir',
        niar: 'niar',
        nier: 'nier',
        niaor: 'niaor',
        niour: 'niour',
        niur: 'niur',
        nianr: 'nianr',
        ninr: 'ninr',
        niangr: 'niangr',
        ningr: 'ningr',
        niongr: 'niongr',
        nuir: 'nuir',
        nur: 'nur',
        nuar: 'nuar',
        nuor: 'nuor',
        nuair: 'nuair',
        nueir: 'nueir',
        nuanr: 'nuanr',
        nuenr: 'nuenr',
        nunr: 'nunr',
        nuangr: 'nuangr',
        nuengr: 'nuengr',
        nvr: 'nür',
        nver: 'nüer',
        nuer: 'nuer',
        nvanr: 'nüanr',
        nvnr: 'nünr',

        // p.js
        pa: 'pa',
        po: 'po',
        pe: 'pe',
        pai: 'pai',
        pei: 'pei',
        pao: 'pao',
        pou: 'pou',
        pan: 'pan',
        pen: 'pen',
        pang: 'pang',
        peng: 'peng',
        pong: 'pong',
        pi: 'pi',
        pia: 'pia',
        pie: 'pie',
        piao: 'piao',
        piou: 'piou',
        piu: 'piu',
        pian: 'pian',
        pin: 'pin',
        piang: 'piang',
        ping: 'ping',
        piong: 'piong',
        pui: 'pui',
        pu: 'pu',
        pua: 'pua',
        puo: 'puo',
        puai: 'puai',
        puei: 'puei',
        puan: 'puan',
        puen: 'puen',
        pun: 'pun',
        puang: 'puang',
        pueng: 'pueng',
        pv: 'pü',
        pve: 'püe',
        pue: 'pue',
        pvan: 'püan',
        pvn: 'pün',

        // pr.js
        par: 'par',
        por: 'por',
        per: 'per',
        pair: 'pair',
        peir: 'peir',
        paor: 'paor',
        pour: 'pour',
        panr: 'panr',
        penr: 'penr',
        pangr: 'pangr',
        pengr: 'pengr',
        pongr: 'pongr',
        pir: 'pir',
        piar: 'piar',
        pier: 'pier',
        piaor: 'piaor',
        piour: 'piour',
        piur: 'piur',
        pianr: 'pianr',
        pinr: 'pinr',
        piangr: 'piangr',
        pingr: 'pingr',
        piongr: 'piongr',
        puir: 'puir',
        pur: 'pur',
        puar: 'puar',
        puor: 'puor',
        puair: 'puair',
        pueir: 'pueir',
        puanr: 'puanr',
        puenr: 'puenr',
        punr: 'punr',
        puangr: 'puangr',
        puengr: 'puengr',
        pvr: 'pür',
        pver: 'püer',
        puer: 'puer',
        pvanr: 'püanr',
        pvnr: 'pünr',

        // q.js
        qa: 'qa',
        qo: 'qo',
        qe: 'qe',
        qai: 'qai',
        qei: 'qei',
        qao: 'qao',
        qou: 'qou',
        qan: 'qan',
        qen: 'qen',
        qang: 'qang',
        qeng: 'qeng',
        qong: 'qong',
        qi: 'qi',
        qia: 'qia',
        qie: 'qie',
        qiao: 'qiao',
        qiou: 'qiou',
        qiu: 'qiu',
        qian: 'qian',
        qin: 'qin',
        qiang: 'qiang',
        qing: 'qing',
        qiong: 'qiong',
        qui: 'qui',
        qu: 'qu',
        qua: 'qua',
        quo: 'quo',
        quai: 'quai',
        quei: 'quei',
        quan: 'quan',
        quen: 'quen',
        qun: 'qun',
        quang: 'quang',
        queng: 'queng',
        qv: 'qü',
        qve: 'qüe',
        que: 'que',
        qvan: 'qüan',
        qvn: 'qün',

        // qr.js
        qar: 'qar',
        qor: 'qor',
        qer: 'qer',
        qair: 'qair',
        qeir: 'qeir',
        qaor: 'qaor',
        qour: 'qour',
        qanr: 'qanr',
        qenr: 'qenr',
        qangr: 'qangr',
        qengr: 'qengr',
        qongr: 'qongr',
        qir: 'qir',
        qiar: 'qiar',
        qier: 'qier',
        qiaor: 'qiaor',
        qiour: 'qiour',
        qiur: 'qiur',
        qianr: 'qianr',
        qinr: 'qinr',
        qiangr: 'qiangr',
        qingr: 'qingr',
        qiongr: 'qiongr',
        quir: 'quir',
        qur: 'qur',
        quar: 'quar',
        quor: 'quor',
        quair: 'quair',
        queir: 'queir',
        quanr: 'quanr',
        quenr: 'quenr',
        qunr: 'qunr',
        quangr: 'quangr',
        quengr: 'quengr',
        qvr: 'qür',
        qver: 'qüer',
        quer: 'quer',
        qvanr: 'qüanr',
        qvnr: 'qünr',

        // r.js
        ra: 'ra',
        ro: 'ro',
        re: 're',
        rai: 'rai',
        rei: 'rei',
        rao: 'rao',
        rou: 'rou',
        ran: 'ran',
        ren: 'ren',
        rang: 'rang',
        reng: 'reng',
        rong: 'rong',
        ri: 'ri',
        ria: 'ria',
        rie: 'rie',
        riao: 'riao',
        riou: 'riou',
        riu: 'riu',
        rian: 'rian',
        rin: 'rin',
        riang: 'riang',
        ring: 'ring',
        riong: 'riong',
        rui: 'rui',
        ru: 'ru',
        rua: 'rua',
        ruo: 'ruo',
        ruai: 'ruai',
        ruei: 'ruei',
        ruan: 'ruan',
        ruen: 'ruen',
        run: 'run',
        ruang: 'ruang',
        rueng: 'rueng',
        rv: 'rü',
        rve: 'rüe',
        rue: 'rue',
        rvan: 'rüan',
        rvn: 'rün',

        // rr.js
        rar: 'rar',
        ror: 'ror',
        rer: 'rer',
        rair: 'rair',
        reir: 'reir',
        raor: 'raor',
        rour: 'rour',
        ranr: 'ranr',
        renr: 'renr',
        rangr: 'rangr',
        rengr: 'rengr',
        rongr: 'rongr',
        rir: 'rir',
        riar: 'riar',
        rier: 'rier',
        riaor: 'riaor',
        riour: 'riour',
        riur: 'riur',
        rianr: 'rianr',
        rinr: 'rinr',
        riangr: 'riangr',
        ringr: 'ringr',
        riongr: 'riongr',
        ruir: 'ruir',
        rur: 'rur',
        ruar: 'ruar',
        ruor: 'ruor',
        ruair: 'ruair',
        rueir: 'rueir',
        ruanr: 'ruanr',
        ruenr: 'ruenr',
        runr: 'runr',
        ruangr: 'ruangr',
        ruengr: 'ruengr',
        rvr: 'rür',
        rver: 'rüer',
        ruer: 'ruer',
        rvanr: 'rüanr',
        rvnr: 'rünr',

        // s.js
        sa: 'sa',
        so: 'so',
        se: 'se',
        sai: 'sai',
        sei: 'sei',
        sao: 'sao',
        sou: 'sou',
        san: 'san',
        sen: 'sen',
        sang: 'sang',
        seng: 'seng',
        song: 'song',
        si: 'si',
        sia: 'sia',
        sie: 'sie',
        siao: 'siao',
        siou: 'siou',
        siu: 'siu',
        sian: 'sian',
        sin: 'sin',
        siang: 'siang',
        sing: 'sing',
        siong: 'siong',
        sui: 'sui',
        su: 'su',
        sua: 'sua',
        suo: 'suo',
        suai: 'suai',
        suei: 'suei',
        suan: 'suan',
        suen: 'suen',
        sun: 'sun',
        suang: 'suang',
        sueng: 'sueng',
        sv: 'sü',
        sve: 'süe',
        sue: 'sue',
        svan: 'süan',
        svn: 'sün',

        // sr.js
        sar: 'sar',
        sor: 'sor',
        ser: 'ser',
        sair: 'sair',
        seir: 'seir',
        saor: 'saor',
        sour: 'sour',
        sanr: 'sanr',
        senr: 'senr',
        sangr: 'sangr',
        sengr: 'sengr',
        songr: 'songr',
        sir: 'sir',
        siar: 'siar',
        sier: 'sier',
        siaor: 'siaor',
        siour: 'siour',
        siur: 'siur',
        sianr: 'sianr',
        sinr: 'sinr',
        siangr: 'siangr',
        singr: 'singr',
        siongr: 'siongr',
        suir: 'suir',
        sur: 'sur',
        suar: 'suar',
        suor: 'suor',
        suair: 'suair',
        sueir: 'sueir',
        suanr: 'suanr',
        suenr: 'suenr',
        sunr: 'sunr',
        suangr: 'suangr',
        suengr: 'suengr',
        svr: 'sür',
        sver: 'süer',
        suer: 'suer',
        svanr: 'süanr',
        svnr: 'sünr',

        // sh.js
        sha: 'sha',
        sho: 'sho',
        she: 'she',
        shai: 'shai',
        shei: 'shei',
        shao: 'shao',
        shou: 'shou',
        shan: 'shan',
        shen: 'shen',
        shang: 'shang',
        sheng: 'sheng',
        shong: 'shong',
        shi: 'shi',
        shia: 'shia',
        shie: 'shie',
        shiao: 'shiao',
        shiou: 'shiou',
        shiu: 'shiu',
        shian: 'shian',
        shin: 'shin',
        shiang: 'shiang',
        shing: 'shing',
        shiong: 'shiong',
        shui: 'shui',
        shu: 'shu',
        shua: 'shua',
        shuo: 'shuo',
        shuai: 'shuai',
        shuei: 'shuei',
        shuan: 'shuan',
        shuen: 'shuen',
        shun: 'shun',
        shuang: 'shuang',
        shueng: 'shueng',
        shv: 'shü',
        shve: 'shüe',
        shue: 'shue',
        shvan: 'shüan',
        shvn: 'shün',

        // shr.js
        shar: 'shar',
        shor: 'shor',
        sher: 'sher',
        shair: 'shair',
        sheir: 'sheir',
        shaor: 'shaor',
        shour: 'shour',
        shanr: 'shanr',
        shenr: 'shenr',
        shangr: 'shangr',
        shengr: 'shengr',
        shongr: 'shongr',
        shir: 'shir',
        shiar: 'shiar',
        shier: 'shier',
        shiaor: 'shiaor',
        shiour: 'shiour',
        shiur: 'shiur',
        shianr: 'shianr',
        shinr: 'shinr',
        shiangr: 'shiangr',
        shingr: 'shingr',
        shiongr: 'shiongr',
        shuir: 'shuir',
        shur: 'shur',
        shuar: 'shuar',
        shuor: 'shuor',
        shuair: 'shuair',
        shueir: 'shueir',
        shuanr: 'shuanr',
        shuenr: 'shuenr',
        shunr: 'shunr',
        shuangr: 'shuangr',
        shuengr: 'shuengr',
        shvr: 'shür',
        shver: 'shüer',
        shuer: 'shuer',
        shvanr: 'shüanr',
        shvnr: 'shünr',

        // special.js
        'e^': 'ê',
        ng: 'ng',

        // t.js
        ta: 'ta',
        to: 'to',
        te: 'te',
        tai: 'tai',
        tei: 'tei',
        tao: 'tao',
        tou: 'tou',
        tan: 'tan',
        ten: 'ten',
        tang: 'tang',
        teng: 'teng',
        tong: 'tong',
        ti: 'ti',
        tia: 'tia',
        tie: 'tie',
        tiao: 'tiao',
        tiou: 'tiou',
        tiu: 'tiu',
        tian: 'tian',
        tin: 'tin',
        tiang: 'tiang',
        ting: 'ting',
        tiong: 'tiong',
        tui: 'tui',
        tu: 'tu',
        tua: 'tua',
        tuo: 'tuo',
        tuai: 'tuai',
        tuei: 'tuei',
        tuan: 'tuan',
        tuen: 'tuen',
        tun: 'tun',
        tuang: 'tuang',
        tueng: 'tueng',
        tv: 'tü',
        tve: 'tüe',
        tue: 'tue',
        tvan: 'tüan',
        tvn: 'tün',

        // tr.js
        tar: 'tar',
        tor: 'tor',
        ter: 'ter',
        tair: 'tair',
        teir: 'teir',
        taor: 'taor',
        tour: 'tour',
        tanr: 'tanr',
        tenr: 'tenr',
        tangr: 'tangr',
        tengr: 'tengr',
        tongr: 'tongr',
        tir: 'tir',
        tiar: 'tiar',
        tier: 'tier',
        tiaor: 'tiaor',
        tiour: 'tiour',
        tiur: 'tiur',
        tianr: 'tianr',
        tinr: 'tinr',
        tiangr: 'tiangr',
        tingr: 'tingr',
        tiongr: 'tiongr',
        tuir: 'tuir',
        tur: 'tur',
        tuar: 'tuar',
        tuor: 'tuor',
        tuair: 'tuair',
        tueir: 'tueir',
        tuanr: 'tuanr',
        tuenr: 'tuenr',
        tunr: 'tunr',
        tuangr: 'tuangr',
        tuengr: 'tuengr',
        tvr: 'tür',
        tver: 'tüer',
        tuer: 'tuer',
        tvanr: 'tüanr',
        tvnr: 'tünr',

        // v.js
        va: 'va',
        vo: 'vo',
        ve: 'üe',  // 覆盖: v.js -> yunmu.js
        vai: 'vai',
        vei: 'vei',
        vao: 'vao',
        vou: 'vou',
        van: 'üan',  // 覆盖: v.js -> yunmu.js
        ven: 'ven',
        vang: 'vang',
        veng: 'veng',
        vong: 'vong',
        vi: 'vi',
        via: 'via',
        vie: 'vie',
        viao: 'viao',
        viou: 'viou',
        viu: 'viu',
        vian: 'vian',
        vin: 'vin',
        viang: 'viang',
        ving: 'ving',
        viong: 'viong',
        vui: 'vui',
        vu: 'vu',
        vua: 'vua',
        vuo: 'vuo',
        vuai: 'vuai',
        vuei: 'vuei',
        vuan: 'vuan',
        vuen: 'vuen',
        vun: 'vun',
        vuang: 'vuang',
        vueng: 'vueng',
        vv: 'vü',
        vve: 'vüe',
        vue: 'vue',
        vvan: 'vüan',
        vvn: 'vün',

        // vr.js
        var: 'var',
        vor: 'vor',
        ver: 'üer',  // 覆盖: vr.js -> yunmur.js
        vair: 'vair',
        veir: 'veir',
        vaor: 'vaor',
        vour: 'vour',
        vanr: 'üanr',  // 覆盖: vr.js -> yunmur.js
        venr: 'venr',
        vangr: 'vangr',
        vengr: 'vengr',
        vongr: 'vongr',
        vir: 'vir',
        viar: 'viar',
        vier: 'vier',
        viaor: 'viaor',
        viour: 'viour',
        viur: 'viur',
        vianr: 'vianr',
        vinr: 'vinr',
        viangr: 'viangr',
        vingr: 'vingr',
        viongr: 'viongr',
        vuir: 'vuir',
        vur: 'vur',
        vuar: 'vuar',
        vuor: 'vuor',
        vuair: 'vuair',
        vueir: 'vueir',
        vuanr: 'vuanr',
        vuenr: 'vuenr',
        vunr: 'vunr',
        vuangr: 'vuangr',
        vuengr: 'vuengr',
        vvr: 'vür',
        vver: 'vüer',
        vuer: 'vuer',
        vvanr: 'vüanr',
        vvnr: 'vünr',

        // w.js
        wa: 'wa',
        wo: 'wo',
        we: 'we',
        wai: 'wai',
        wei: 'wei',
        wao: 'wao',
        wou: 'wou',
        wan: 'wan',
        wen: 'wen',
        wang: 'wang',
        weng: 'weng',
        wong: 'wong',
        wi: 'wi',
        wia: 'wia',
        wie: 'wie',
        wiao: 'wiao',
        wiou: 'wiou',
        wiu: 'wiu',
        wian: 'wian',
        win: 'win',
        wiang: 'wiang',
        wing: 'wing',
        wiong: 'wiong',
        wui: 'wui',
        wu: 'wu',
        wua: 'wua',
        wuo: 'wuo',
        wuai: 'wuai',
        wuei: 'wuei',
        wuan: 'wuan',
        wuen: 'wuen',
        wun: 'wun',
        wuang: 'wuang',
        wueng: 'wueng',
        wv: 'wü',
        wve: 'wüe',
        wue: 'wue',
        wvan: 'wüan',
        wvn: 'wün',

        // wr.js
        war: 'war',
        wor: 'wor',
        wer: 'wer',
        wair: 'wair',
        weir: 'weir',
        waor: 'waor',
        wour: 'wour',
        wanr: 'wanr',
        wenr: 'wenr',
        wangr: 'wangr',
        wengr: 'wengr',
        wongr: 'wongr',
        wir: 'wir',
        wiar: 'wiar',
        wier: 'wier',
        wiaor: 'wiaor',
        wiour: 'wiour',
        wiur: 'wiur',
        wianr: 'wianr',
        winr: 'winr',
        wiangr: 'wiangr',
        wingr: 'wingr',
        wiongr: 'wiongr',
        wuir: 'wuir',
        wur: 'wur',
        wuar: 'wuar',
        wuor: 'wuor',
        wuair: 'wuair',
        wueir: 'wueir',
        wuanr: 'wuanr',
        wuenr: 'wuenr',
        wunr: 'wunr',
        wuangr: 'wuangr',
        wuengr: 'wuengr',
        wvr: 'wür',
        wver: 'wüer',
        wuer: 'wuer',
        wvanr: 'wüanr',
        wvnr: 'wünr',

        // x.js
        xa: 'xa',
        xo: 'xo',
        xe: 'xe',
        xai: 'xai',
        xei: 'xei',
        xao: 'xao',
        xou: 'xou',
        xan: 'xan',
        xen: 'xen',
        xang: 'xang',
        xeng: 'xeng',
        xong: 'xong',
        xi: 'xi',
        xia: 'xia',
        xie: 'xie',
        xiao: 'xiao',
        xiou: 'xiou',
        xiu: 'xiu',
        xian: 'xian',
        xin: 'xin',
        xiang: 'xiang',
        xing: 'xing',
        xiong: 'xiong',
        xui: 'xui',
        xu: 'xu',
        xua: 'xua',
        xuo: 'xuo',
        xuai: 'xuai',
        xuei: 'xuei',
        xuan: 'xuan',
        xuen: 'xuen',
        xun: 'xun',
        xuang: 'xuang',
        xueng: 'xueng',
        xv: 'xü',
        xve: 'xüe',
        xue: 'xue',
        xvan: 'xüan',
        xvn: 'xün',

        // xr.js
        xar: 'xar',
        xor: 'xor',
        xer: 'xer',
        xair: 'xair',
        xeir: 'xeir',
        xaor: 'xaor',
        xour: 'xour',
        xanr: 'xanr',
        xenr: 'xenr',
        xangr: 'xangr',
        xengr: 'xengr',
        xongr: 'xongr',
        xir: 'xir',
        xiar: 'xiar',
        xier: 'xier',
        xiaor: 'xiaor',
        xiour: 'xiour',
        xiur: 'xiur',
        xianr: 'xianr',
        xinr: 'xinr',
        xiangr: 'xiangr',
        xingr: 'xingr',
        xiongr: 'xiongr',
        xuir: 'xuir',
        xur: 'xur',
        xuar: 'xuar',
        xuor: 'xuor',
        xuair: 'xuair',
        xueir: 'xueir',
        xuanr: 'xuanr',
        xuenr: 'xuenr',
        xunr: 'xunr',
        xuangr: 'xuangr',
        xuengr: 'xuengr',
        xvr: 'xür',
        xver: 'xüer',
        xuer: 'xuer',
        xvanr: 'xüanr',
        xvnr: 'xünr',

        // y.js
        ya: 'ya',
        yo: 'yo',
        ye: 'ye',
        yai: 'yai',
        yei: 'yei',
        yao: 'yao',
        you: 'you',
        yan: 'yan',
        yen: 'yen',
        yang: 'yang',
        yeng: 'yeng',
        yong: 'yong',
        yi: 'yi',
        yia: 'yia',
        yie: 'yie',
        yiao: 'yiao',
        yiou: 'yiou',
        yiu: 'yiu',
        yian: 'yian',
        yin: 'yin',
        yiang: 'yiang',
        ying: 'ying',
        yiong: 'yiong',
        yui: 'yui',
        yu: 'yu',
        yua: 'yua',
        yuo: 'yuo',
        yuai: 'yuai',
        yuei: 'yuei',
        yuan: 'yuan',
        yuen: 'yuen',
        yun: 'yun',
        yuang: 'yuang',
        yueng: 'yueng',
        yv: 'yü',
        yve: 'yüe',
        yue: 'yue',
        yvan: 'yüan',
        yvn: 'yün',

        // yr.js
        yar: 'yar',
        yor: 'yor',
        yer: 'yer',
        yair: 'yair',
        yeir: 'yeir',
        yaor: 'yaor',
        your: 'your',
        yanr: 'yanr',
        yenr: 'yenr',
        yangr: 'yangr',
        yengr: 'yengr',
        yongr: 'yongr',
        yir: 'yir',
        yiar: 'yiar',
        yier: 'yier',
        yiaor: 'yiaor',
        yiour: 'yiour',
        yiur: 'yiur',
        yianr: 'yianr',
        yinr: 'yinr',
        yiangr: 'yiangr',
        yingr: 'yingr',
        yiongr: 'yiongr',
        yuir: 'yuir',
        yur: 'yur',
        yuar: 'yuar',
        yuor: 'yuor',
        yuair: 'yuair',
        yueir: 'yueir',
        yuanr: 'yuanr',
        yuenr: 'yuenr',
        yunr: 'yunr',
        yuangr: 'yuangr',
        yuengr: 'yuengr',
        yvr: 'yür',
        yver: 'yüer',
        yuer: 'yuer',
        yvanr: 'yüanr',
        yvnr: 'yünr',

        // yunmu.js
        a: 'a',
        o: 'o',
        e: 'e',
        ai: 'ai',
        ei: 'ei',
        ao: 'ao',
        ou: 'ou',
        an: 'an',
        en: 'en',
        ang: 'ang',
        eng: 'eng',
        ong: 'ong',
        i: 'i',
        ia: 'ia',
        ie: 'ie',
        iao: 'iao',
        iou: 'iou',
        iu: 'iu',
        ian: 'ian',
        in: 'in',
        iang: 'iang',
        ing: 'ing',
        iong: 'iong',
        ui: 'ui',
        u: 'u',
        ua: 'ua',
        uo: 'uo',
        uai: 'uai',
        uei: 'uei',
        uan: 'uan',
        uen: 'uen',
        un: 'un',
        uang: 'uang',
        ueng: 'ueng',
        v: 'ü',
        ue: 'ue',
        vn: 'ün',

        // yunmur.js
        ar: 'ar',
        or: 'or',
        er: 'er',
        air: 'air',
        eir: 'eir',
        aor: 'aor',
        our: 'our',
        anr: 'anr',
        enr: 'enr',
        angr: 'angr',
        engr: 'engr',
        ongr: 'ongr',
        ir: 'ir',
        iar: 'iar',
        ier: 'ier',
        iaor: 'iaor',
        iour: 'iour',
        iur: 'iur',
        ianr: 'ianr',
        inr: 'inr',
        iangr: 'iangr',
        ingr: 'ingr',
        iongr: 'iongr',
        uir: 'uir',
        ur: 'ur',
        uar: 'uar',
        uor: 'uor',
        uair: 'uair',
        ueir: 'ueir',
        uanr: 'uanr',
        uenr: 'uenr',
        unr: 'unr',
        uangr: 'uangr',
        uengr: 'uengr',
        vr: 'ür',
        uer: 'uer',
        vnr: 'ünr',

        // z.js
        za: 'za',
        zo: 'zo',
        ze: 'ze',
        zai: 'zai',
        zei: 'zei',
        zao: 'zao',
        zou: 'zou',
        zan: 'zan',
        zen: 'zen',
        zang: 'zang',
        zeng: 'zeng',
        zong: 'zong',
        zi: 'zi',
        zia: 'zia',
        zie: 'zie',
        ziao: 'ziao',
        ziou: 'ziou',
        ziu: 'ziu',
        zian: 'zian',
        zin: 'zin',
        ziang: 'ziang',
        zing: 'zing',
        ziong: 'ziong',
        zui: 'zui',
        zu: 'zu',
        zua: 'zua',
        zuo: 'zuo',
        zuai: 'zuai',
        zuei: 'zuei',
        zuan: 'zuan',
        zuen: 'zuen',
        zun: 'zun',
        zuang: 'zuang',
        zueng: 'zueng',
        zv: 'zü',
        zve: 'züe',
        zue: 'zue',
        zvan: 'züan',
        zvn: 'zün',

        // zh.js
        zha: 'zha',
        zho: 'zho',
        zhe: 'zhe',
        zhai: 'zhai',
        zhei: 'zhei',
        zhao: 'zhao',
        zhou: 'zhou',
        zhan: 'zhan',
        zhen: 'zhen',
        zhang: 'zhang',
        zheng: 'zheng',
        zhong: 'zhong',
        zhi: 'zhi',
        zhia: 'zhia',
        zhie: 'zhie',
        zhiao: 'zhiao',
        zhiou: 'zhiou',
        zhiu: 'zhiu',
        zhian: 'zhian',
        zhin: 'zhin',
        zhiang: 'zhiang',
        zhing: 'zhing',
        zhiong: 'zhiong',
        zhui: 'zhui',
        zhu: 'zhu',
        zhua: 'zhua',
        zhuo: 'zhuo',
        zhuai: 'zhuai',
        zhuei: 'zhuei',
        zhuan: 'zhuan',
        zhuen: 'zhuen',
        zhun: 'zhun',
        zhuang: 'zhuang',
        zhueng: 'zhueng',
        zhv: 'zhü',
        zhve: 'zhüe',
        zhue: 'zhue',
        zhvan: 'zhüan',
        zhvn: 'zhün',

        // zhr.js
        zhar: 'zhar',
        zhor: 'zhor',
        zher: 'zher',
        zhair: 'zhair',
        zheir: 'zheir',
        zhaor: 'zhaor',
        zhour: 'zhour',
        zhanr: 'zhanr',
        zhenr: 'zhenr',
        zhangr: 'zhangr',
        zhengr: 'zhengr',
        zhongr: 'zhongr',
        zhir: 'zhir',
        zhiar: 'zhiar',
        zhier: 'zhier',
        zhiaor: 'zhiaor',
        zhiour: 'zhiour',
        zhiur: 'zhiur',
        zhianr: 'zhianr',
        zhinr: 'zhinr',
        zhiangr: 'zhiangr',
        zhingr: 'zhingr',
        zhiongr: 'zhiongr',
        zhuir: 'zhuir',
        zhur: 'zhur',
        zhuar: 'zhuar',
        zhuor: 'zhuor',
        zhuair: 'zhuair',
        zhueir: 'zhueir',
        zhuanr: 'zhuanr',
        zhuenr: 'zhuenr',
        zhunr: 'zhunr',
        zhuangr: 'zhuangr',
        zhuengr: 'zhuengr',
        zhvr: 'zhür',
        zhver: 'zhüer',
        zhuer: 'zhuer',
        zhvanr: 'zhüanr',
        zhvnr: 'zhünr',

        // zr.js
        zar: 'zar',
        zor: 'zor',
        zer: 'zer',
        zair: 'zair',
        zeir: 'zeir',
        zaor: 'zaor',
        zour: 'zour',
        zanr: 'zanr',
        zenr: 'zenr',
        zangr: 'zangr',
        zengr: 'zengr',
        zongr: 'zongr',
        zir: 'zir',
        ziar: 'ziar',
        zier: 'zier',
        ziaor: 'ziaor',
        ziour: 'ziour',
        ziur: 'ziur',
        zianr: 'zianr',
        zinr: 'zinr',
        ziangr: 'ziangr',
        zingr: 'zingr',
        ziongr: 'ziongr',
        zuir: 'zuir',
        zur: 'zur',
        zuar: 'zuar',
        zuor: 'zuor',
        zuair: 'zuair',
        zueir: 'zueir',
        zuanr: 'zuanr',
        zuenr: 'zuenr',
        zunr: 'zunr',
        zuangr: 'zuangr',
        zuengr: 'zuengr',
        zvr: 'zür',
        zver: 'züer',
        zuer: 'zuer',
        zvanr: 'züanr',
        zvnr: 'zünr',

        // 叹词音节：不是「声母 + 韵母」的组合，词典单列。它们没有元音，
        // 声调由 index.js 的 applyToneMark 兜底标在 m / n 上（ḿ ń ň ǹ）。
        // ng 在上面的零声母组里已经有了，这里只补缺的四个。
        m: 'm',
        n: 'n',
        hm: 'hm',
        hng: 'hng',
    };

    // 注：以上 4 条在合并前被后出现的文件覆盖（取决于 Object.assign 的实参顺序），
    // 这里只保留最终生效的值，行尾标出了原本的冲突来源。
    return module.exports;
})();
__modules[1] = (function () {
    let module = {exports: {}};
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
    module.exports = new Set(
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
    return module.exports;
})();
__modules[2] = (function () {
    let module = {exports: {}};
    'use strict';
    const pinyinDict = __modules[0];
    const coreSyllables = __modules[1];

    // 单个音节必须整串匹配：纯字母（大小写都收）+ 可选的一个带符标记（^ 或 :）+
    // 可选声调数字。不加锚点会静默截断输入（"ma6" -> "ma"）；旧版只认小写又没有
    // 锚点，于是 "Hao3" 从 H 后面开始匹配，输出 "ǎo"。
    const regex = /^(?<abc>[A-Za-z]+)(?<hat>\^?)(?<mark>:?)(?<num>[0-5]?)$/;

    // 连写分词用：一个 token 里可以有若干段「字母 + 可选扬抑符 + 可选冒号 + 可选后续字母
    // + 可选声调」。
    // 贪婪的 [A-Za-z]+ 靠声调数字断开，"ni3hao3" 于是自然切成 ni3 | hao3 ——
    // 声调数字本来就是拼音连写里唯一可靠的分隔符，不需要音节层面的歧义消解。
    //
    // 冒号后面的字母（after）属于同一段：冒号只是「这个 u 带两点」的标记，
    // 不是音节边界。"lu:e4" 因此读作 lü e + 第四声 = lüè，而不是 lü + é。
    const segment = /(?<abc>[A-Za-z]+)(?<hat>\^?)(?<mark>:?)(?<after>[A-Za-z]*)(?<num>[0-5]?)/g;

    // 音节之间只允许 ASCII 标点 / 空白。一旦间隙里出现字母、数字或汉字，
    // 说明这个 token 不是「拼音串 + 标点」（英文单词、大小写混排、非法声调、
    // 汉字混排都在此列），宁可整体原样，也不猜着往下切。
    const foreign = /[A-Za-z0-9]|\p{Script=Han}/u;

    // u: 里的冒号代表 ü 上面的两点：ju:1 读作 jü + 第一声，输出 jǖ。
    // 这是给美式键盘准备的 —— 不离开 ASCII 就能写出保留两点的形式。
    // 冒号前的 u 与 v 等价：jv:1 同义（v 本来就是 ü 的 ASCII 写法）。
    //
    // e^ 里的 ^ 是同一套办法的另一个用法：它表示 ê 头上那个扬抑符（circumflex）。
    // ê 是唯一带扬抑符的拼音字母（欸 / 诶 读 ê），所以 ^ 只认 e ——
    // be^2、x^2 一律整串原样，不做「把 ^ 挪到某个字母上」的猜测。
    // ê 里没有 u，冒号无处可落，因此 ^ 与 : 互斥（e^:1 不成立）。

    // ---------------------------------------------------------------- ü 的两种写法
    //
    // 同一个音节在「j/q/x/y + ü」上有两种拼写：
    //   规范（国标）  ju  jue  juan  jun   ← j/q/x/y 与 ü 相拼时省两点
    //   字面（保留）  jv  jve  jvan  jvn   ← 词表里用 v 表示 ü（ASCII 输入约定）
    // 二者是同一音位的两种写法，不是两个音节，因此可以互相投影而不丢信息。
    //
    // 只对 j/q/x/y 成立：这四个声母后的 u 永远不是真正的 u（互补分布）。
    // n/l 后的 u 与 ü 是对立音位（nǔ 努 / nǚ 女、lù 路 / lǜ 绿），不能投影。
    const UMLAUT_HEADS = 'jqxy';

    // 可省的韵母：ü / üe / üan / ün，及其儿化变体。必须穷举成闭集，
    // 不能用 /^u/ 之类的前缀匹配 —— 词表里还有 jui/jua/juo/juai/juei/juen/
    // juang/jueng 这类笛卡尔积产生的假音节，前缀匹配会把它们误转成 jüí/jüá。
    const UMLAUT_FINALS = new Set(['u', 'ue', 'uan', 'un', 'ur', 'uer', 'uanr', 'unr']);

    /**
     * 字面写法 -> 规范写法（jv -> ju）。仅在白名单内生效。
     * @param {string} abbr
     * @returns {string}
     */
    function toCanonicalSpelling(abbr) {
        if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'v'
            && UMLAUT_FINALS.has('u' + abbr.slice(2))) {
            return abbr[0] + 'u' + abbr.slice(2);
        }
        return abbr;
    }

    /**
     * 规范写法 -> 字面写法（ju -> jv）。仅在白名单内生效。
     * @param {string} abbr
     * @returns {string}
     */
    function toLiteralSpelling(abbr) {
        if (abbr.length >= 2 && UMLAUT_HEADS.includes(abbr[0]) && abbr[1] === 'u'
            && UMLAUT_FINALS.has(abbr.slice(1))) {
            return abbr[0] + 'v' + abbr.slice(2);
        }
        return abbr;
    }

    /**
     * 这个词表键在严格模式下认不认。
     *
     * 词表为了宽容收了 1952 个键，其中 1110 条是「声母 × 韵母」笛卡尔积的产物
     * （jui、juang、juei、biong），严格模式只认普通话的 426 个音节。
     * 儿化不单独列：huar 的合法性完全由 hua 决定，去掉尾字母 r 再查一次即可，
     * 418 条儿化音节因此一条都不用写进 core.js。
     * @param {string} key
     * @returns {boolean}
     */
    function isCoreSyllable(key) {
        if (coreSyllables.has(key)) return true;

        // 字面拼写（jv / jve / jvan / jvn）与规范拼写是同一音位，core 只收规范那条。
        // 投影后再判儿化，jver 才能按 juer -> jue + r 走通。
        const canonical = toCanonicalSpelling(key);
        if (coreSyllables.has(canonical)) return true;

        return canonical.length > 1 && canonical.endsWith('r')
            && coreSyllables.has(canonical.slice(0, -1));
    }

    /**
     * 查表取某个音节的**无调形式**。先按请求的拼写查，查不到再用另一种拼写兜底：
     * j/q/x/y 后的 ü 在词表里两种键都有，投影是安全的；兜底则是为了将来
     * 清掉冗余的 jv 键时不至于让字面形式直接失效。
     *
     * strict 时，两种拼写都要过 core 白名单才能查 —— 否则 jv1 走兜底绕过严格模式。
     * @param {string} abbr
     * @param {boolean} literal true 取字面拼写（jü），false 取规范拼写（ju）
     * @param {boolean} strict 只认普通话的 426 个音节
     * @returns {string|undefined}
     */
    function lookupBase(abbr, literal, strict) {
        const keys = literal
            ? [toLiteralSpelling(abbr), toCanonicalSpelling(abbr)]
            : [toCanonicalSpelling(abbr), toLiteralSpelling(abbr)];

        for (const key of keys) {
            if (strict && !isCoreSyllable(key)) continue;

            const base = pinyinDict[key];
            if (base !== undefined) return base;
        }
        return undefined;
    }

    /**
     * 空 / 0 / 5 都表示轻声，对应不加调号
     * @param {string} num
     * @returns {number}
     */
    function toneIndex(num) {
        return num === '' || num === '0' || num === '5' ? 0 : Number(num);
    }

    // 一声到四声的调号。轻声不加，所以从 1 开始用。
    // m / n 两行只给没有元音的叹词音节兜底用 —— 它们标在鼻音本身（ḿ、hńg）。
    // 用数组而不是字符串做索引：m̄ / m̌ / m̀ / n̄ 是「字母 + 组合符」两个码位，
    // 按字符串下标取会取到半个字符。
    const TONE_MARKS = {
        a: ['ā', 'á', 'ǎ', 'à'],
        o: ['ō', 'ó', 'ǒ', 'ò'],
        e: ['ē', 'é', 'ě', 'è'],
        i: ['ī', 'í', 'ǐ', 'ì'],
        u: ['ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
        // ê 自带扬抑符，调号叠在它上面。二声与四声有预组合字符（ế U+1EBF / ề U+1EC1），
        // 一声与三声没有，只能写成「ê + 组合符」两个码位。
        'ê': ['ê\u0304', 'ế', 'ê\u030c', 'ề'],
        m: ['m\u0304', 'ḿ', 'm\u030c', 'm\u0300'],
        n: ['n\u0304', 'ń', 'ň', 'ǹ'],
    };

    // 主元音的优先级：a > o > e。iu 标 u、ui 标 i 由「取最后一个」自动满足。
    // ê 必须单列一条 —— 它不是 e，indexOf('e') 在「ê」里找不到任何东西。
    // 排最后是安全的：含 ê 的音节只有 ê 本身，不会与 a / o / e 同现。
    const MAIN_VOWELS = ['a', 'o', 'e', 'ê'];

    // 除 a/o/e/ê 之外的元音。iu 标 u、ui 标 i 由「取最后一个」自动满足。
    const CLOSING_VOWELS = 'iuü';

    // 叹词音节的落调位置：倒数第一个 m 或 n（m -> ḿ、hng -> hńg、ng -> ńg）。
    const NASALS = 'mn';

    // 叹词音节里，词典（pypinyin 的 pinyin_dict，注音取自《现代汉语词典》一系）
    // 真实出现过的组合。字形逐条抄自该表：
    //   m   m̄ 嘸 / ḿ 呒呣唔嘸 / m̀ 呣      —— 没有第三声
    //   n   ń 咹哽唔嗯 / ň 㕶嗯 / ǹ 哏嗯   —— 没有第一声
    //   ng  ńg 哽唔嗯 / ňg 㕶嗯 / ǹg 嗯   —— 没有第一声
    //   hm  噷                            —— 只有无调
    //   hng 哼                            —— 只有无调
    //
    // 这张表是**优先表**，不是闭集：查得到就用这里的字形，查不到按「标在最后一个
    // 鼻音上」的规则生成。所以 m3、n1、ng1 以及 hm / hng 的四声照样能转换 ——
    // `m3` 得到 `m̌`、`hng2` 得到 `hńg`。这 11 个形式是外推，词典里没有；
    // 它们和上面 9 个有依据的形式走同一个出口，输出上不作区分。
    //
    // 表里这 9 个值目前与规则算出来的结果逐条相同（所以删掉整张表，测试也不会红）。
    // 留着它是为了让「有依据的那几格」不随规则一起漂：将来若改落调位置或改码位写法，
    // 这 9 个字形仍按词典的写法输出，而不是被规则顺手改写。
    // m̄ / m̀ 是「字母 + 组合符」两个码位，写在这里比在别处拼接更不容易出错。
    const NASAL_TONES = {
        m: {1: 'm\u0304', 2: 'ḿ', 4: 'm\u0300'},
        n: {2: 'ń', 3: 'ň', 4: 'ǹ'},
        ng: {2: 'ńg', 3: 'ňg', 4: 'ǹg'},
        hm: {},
        hng: {},
    };

    /**
     * 给无调音节加声调符号：有 a 标 a，无 a 有 o 标 o，无 a/o 有 e 标 e（ê 同 e，
     * 只是它自带扬抑符，要单独查），否则标最后一个元音（iu -> u、ui -> i）。
     * 儿化尾 r 不是元音，不影响判断。
     *
     * 一个元音都没有的音节（m、n、ng、hm、hng）先查 NASAL_TONES：词典里收过这个
     * 声调就用表里的字形；没收录的按同一规则生成 —— 标在倒数第一个 m 或 n 上
     * （m3 -> m̌、hng2 -> hńg）。查表在前是为了让 m̄ / m̀ 这类「字母 + 组合符」的
     * 码位固定下来，规则算出来的结果与之一致。
     *
     * 词表只存无调形式，四个声调在这里生成 —— 它们是同一条规则的展开，
     * 存 4 条预生成字符串和存 1 条再算，结果逐条相同（全表 1952 × 5 已验证）。
     * 轻声（tone 0）不加调。
     * @param {string} base
     * @param {number} tone 0-4
     * @returns {string|null} null 表示这个音节加不上调（不是已知的叹词音节）
     */
    function applyToneMark(base, tone) {
        if (tone === 0) return base;

        let at = -1;
        for (const vowel of MAIN_VOWELS) {
            at = base.indexOf(vowel);
            if (at !== -1) break;
        }

        if (at === -1) {
            for (let i = base.length - 1; i >= 0; i -= 1) {
                if (CLOSING_VOWELS.includes(base[i])) {
                    at = i;
                    break;
                }
            }
        }

        if (at === -1) {
            const closed = NASAL_TONES[base];
            if (closed && closed[tone]) return closed[tone];

            for (let i = base.length - 1; i >= 0; i -= 1) {
                if (NASALS.includes(base[i])) {
                    const nasalMarks = TONE_MARKS[base[i]];
                    return nasalMarks
                        ? base.slice(0, i) + nasalMarks[tone - 1] + base.slice(i + 1)
                        : null;
                }
            }
            return null;
        }

        const marks = TONE_MARKS[base[at]];
        return marks ? base.slice(0, at) + marks[tone - 1] + base.slice(at + 1) : base;
    }

    /**
     * 查表取无调形式，再加声调。不成词时返回 null，由调用方决定回退成什么。
     * 默认输出规范拼写：j/q/x/y 后的 ü 一律省两点（jv1 -> jū），
     * 这是《汉语拼音方案》的要求，字面拼写（jǖ）只在写了冒号时出现。
     * @param {string} abc
     * @param {string} num
     * @param {boolean} literal
     * @param {boolean} strict
     * @returns {string|null}
     */
    function renderSyllable(abc, num, literal, strict) {
        const base = lookupBase(abc, literal, strict);
        if (base === undefined) return null;
        return applyToneMark(base, toneIndex(num));
    }

    /**
     * 把冒号所在的字母还原成 ü：u -> v（词表用 v 表示 ü）。
     *   ju:1   -> jv      juan:1 -> jvan      nu:3 -> nv
     *   gu:1   -> gv      u:1    -> v         u:e1 -> ve
     *
     * 冒号应当写在 u 上 —— u 就是那个要带两点的字母。`jv:` 里的 v 已经是 ü 的
     * ASCII 写法，再写冒号是把同一件事说了两遍，但意思并没有歧义，所以照 `ju:`
     * 处理，不当错误：jv:1 与 ju:1 同义，都是 jǖ。
     *
     * 不按声母筛：冒号是用户明确写下的，写在哪里就是要哪里的 ü。`gu:1` 得到 `gǖ`、
     * `u:e1` 得到 `üē` 这类不合规范的音节，正是这个包存在的理由之一 —— 它既要输出
     * 规范拼写，也要输出不规范的拼写。要不要用由调用方决定，转换器不替它判断。
     *
     * 音节里没有 u / v 时无处可落（ma:1、ji:1），返回 null，调用方原样返回。
     * @param {string} abc
     * @returns {string|null}
     */
    function dottedKey(abc) {
        const i = abc.search(/[uv]/);
        if (i === -1) return null;

        // v 已经是词表里的写法，直接用；只有 u 需要换成 v
        return abc[i] === 'v' ? abc : abc.slice(0, i) + 'v' + abc.slice(i + 1);
    }

    // ---------------------------------------------------------------- 大小写
    //
    // 《汉语拼音方案》只规定字母表（每个字母有大写、小写两种字形），大小写怎么用
    // 是《汉语拼音正词法基本规则》(GB/T 16159—2012) §6.3 的事：句子开头与诗歌
    // 每行行首、专名的首字母、多词专名的每个词首字母，以及「某些场合专名可以
    // 全部大写」（BĚIJĪNG、LǏ HUÁ）。§6.5 的标调规则没有为大写开口子，所以
    // 这些场合的调号照标在大写元音上 —— Ě Ī Ǎ Ǔ Ǚ Ế 都不是生造的字形。
    //
    // 因此这里认三种形态：全小写、首字母大写、全大写。音节内部混用（hAo3、HaO3）
    // 不是标准里的写法，当认不全处理，整串原样返回。形态按**音节**判定而不是按
    // token：Zhong1guo2 的第二个音节仍算全小写，输出 Zhōngguó。
    const LOWER = 0;
    const TITLE = 1;
    const UPPER = 2;

    /**
     * 读出一个音节的字母形态。
     * @param {string} letters 音节里的全部字母（abc + after）
     * @returns {number} LOWER / TITLE / UPPER；-1 表示大小写混用
     */
    function readCase(letters) {
        if (letters === letters.toLowerCase()) return LOWER;
        if (letters === letters.toUpperCase()) return UPPER;
        if (letters[0] === letters[0].toUpperCase()
            && letters.slice(1) === letters.slice(1).toLowerCase()) return TITLE;
        return -1;
    }

    /**
     * 把形态贴回渲染结果。调号已经在元音上（Ǎ、Ǚ、Ế），所以全大写直接
     * toUpperCase 就够了；首字母大写只动第一个字符，其余保持小写。
     * @param {string} syllable
     * @param {number} form
     * @returns {string}
     */
    function applyCase(syllable, form) {
        if (form === LOWER) return syllable;
        if (form === UPPER) return syllable.toUpperCase();
        return syllable[0].toUpperCase() + syllable.slice(1);
    }

    /**
     * 冒号标记优先于默认拼写：写了 ju:1 就是要 jǖ，与上下文无关
     * （jv:1 同义，v 就是 ü 的 ASCII 写法）。
     * 冒号后面的字母属于同一音节（lu:e4 -> lüè），先拼回完整韵母再投影。
     * 位置只有两个是合法的：紧跟承载两点的那一位，或缀在音节末尾（jvan:1）。
     * 写在别处（j:van1、jva:n1）当写错，不猜。
     *
     * 冒号落在 v 上时（vv:1、vai:1、vu:1）：v 本来就是 ü 的 ASCII 写法，
     * 这个冒号不提供任何新信息。若这一格的值里第一个字母仍是辅音 v，
     * 照常输出即可 —— 「视作没写冒号」，vv:1 与 vv1 逐字相同。
     *
     * 冒号落在 u 上时（uang:1、shui:3）：u 换成 v 后词表这一格把 v 当辅音
     * （uang -> vang -> vāng），输出里会冒出用户没写过的辅音字母 v。
     * 这是落空，不是转换，调用方拿回原串。
     *
     * 扬抑符标记（e^）是另一回事：它不挑韵母，而是把 e 本身换成 ê。
     * ê 里没有 u 可标，所以它与冒号互斥；写在别的字母后面也不成立。
     *
     * 输出拼写只由 token 自己决定：裸写一律规范形式，只有冒号要字面形式。
     * 没有「整串切成字面」的开关，所以 literal 不再沿调用链传递 ——
     * 唯一需要字面形式的那个分支把 true 写死，调用方无从改变它。
     *
     * 大小写不影响查表，只影响输出形态：先按小写取词，渲染完再贴回原形态。
     * @param {string} abc
     * @param {string} hat `^` 或空串
     * @param {string} mark
     * @param {string} after 冒号之后、声调数字之前的字母
     * @param {string} num
     * @param {boolean} strict
     * @returns {string|null}
     */
    function renderToken(abc, hat, mark, after, num, strict) {
        const form = readCase(abc + after);
        if (form === -1) return null;

        // 词表的键与值都是小写，查表一律用小写
        const lower = abc.toLowerCase();
        const rest = after.toLowerCase();

        if (hat === '^') {
            if (lower !== 'e' || rest !== '' || mark === ':') return null;
            const syllable = renderSyllable('e^', num, false, strict);
            return syllable === null ? null : applyCase(syllable, form);
        }

        if (mark !== ':') {
            const syllable = renderSyllable(lower, num, false, strict);
            return syllable === null ? null : applyCase(syllable, form);
        }

        const raw = lower + rest;
        const key = dottedKey(raw);
        if (key === null) return null;

        // 冒号只有两个合法位置：紧跟承载两点的那一位（u 或 v），或者缀在整个音节末尾。
        // 前者说明「这两点属于这个字母」（ju:an1 / jv:an1 / lu:e4），
        // 后者是缩写形式（juan:1 / jv:1）。位置随意的话，j:van1、jva:n1 这类
        // 明显错位的串也会拿到 jüān —— 那不是宽容，是没在读用户写的东西。
        if (rest !== '' && lower.length !== raw.search(/[uv]/) + 1) return null;

        const syllable = renderSyllable(key, num, true, strict);
        if (syllable === null) return null;

        // dottedKey 只在把 u 换成 v 时才改串，所以 key === raw 等价于「落点是 v」。
        // 落点是 v：冒号重复声明同一件事，即使这一格把 v 当辅音也照常输出。
        // 落点是 u：必须真的产出 ü；还剩 ASCII v 说明这一格没把 u 当 ü，落空。
        const landedOnV = key === raw;

        if (!landedOnV && syllable.includes('v')) return null;

        return applyCase(syllable, form);
    }

    /**
     * 把一个 token 转成拼音。三种情况，其余一律原样返回：
     *
     *   1. 单个音节            ni3          -> nǐ
     *   2. 若干音节连写        ni3hao3      -> nǐhǎo
     *   3. 拼音 + ASCII 标点   ni3,hao3     -> nǐ,hǎo
     *
     * 输出保持输入的分隔方式：连写的音节之间不补空格，写了空格的地方空格还在，
     * 标点原样留在原位。转换只改字母和声调，不替调用方决定排版。
     *
     * 认不全就整串原样（"a1b2c3"、"hua1r"、"ma6"）：宁可少转一个 token，
     * 也不要输出半截结果 —— 半截结果比不转更难发现。
     * @param {string} str
     * @param {boolean} strict
     * @returns {string}
     */
    function convertToken(str, strict) {
        const single = regex.exec(str);

        // 单音节快路径：绝大多数输入走这里
        if (single) {
            const { abc, hat, mark, num } = single.groups;
            return renderToken(abc, hat, mark, '', num, strict) ?? str;
        }

        let out = '';
        let pos = 0;
        let count = 0;

        for (const part of str.matchAll(segment)) {
            const gap = str.slice(pos, part.index);
            if (foreign.test(gap)) return str;

            const { abc, hat, mark, after, num } = part.groups;
            const piece = renderToken(abc, hat, mark, after, num, strict);
            if (piece === null) return str;

            out += gap + piece;

            pos = part.index + part[0].length;
            count += 1;
        }

        const tail = str.slice(pos);
        if (count === 0 || foreign.test(tail)) return str;

        return out + tail;
    }

    /**
     * 公开入口的选项只认 strict 与 skip 两个字段，其余一律忽略 —— 传了错的东西不该换算法。
     * @param {{strict?: boolean}|undefined} options
     * @returns {boolean}
     */
    function readStrict(options) {
        return Boolean(options && options.strict);
    }

    /**
     * 把 skip 的写法统一成「这个片段要不要保持原样」。
     *
     * 只收字符串与字符串数组，比的是**整个片段**、区分大小写。看起来粗，但规则能
     * 打中的只有「与声明一字不差」的片段：`skip: 'M2'` 碰不到 `M20`，也碰不到 `m2`。
     * 也正因为如此，输入里不需要任何标记字符 —— 想保住的东西全在选项里说，
     * 正文中的反斜杠、花括号对这里只是普通文本。
     *
     * 传了不认识的东西就当没传：与 readStrict 一样，选项不该改变算法。
     * @param {{skip?: unknown}|undefined} options
     * @returns {((run: string) => boolean)|null}
     */
    function readSkip(options) {
        const spec = options === null || options === undefined ? undefined : options.skip;

        if (typeof spec === 'string') return (run) => run === spec;

        if (Array.isArray(spec)) {
            const exact = new Set(spec.filter((item) => typeof item === 'string'));
            // 空数组（或全是垃圾值）等于没传，省掉每次转换的一次函数调用
            if (exact.size === 0) return null;
            return (run) => exact.has(run);
        }

        return null;
    }

    /**
     * 候选片段：连续的字母（大小写都算）/ 冒号 / 扬抑符 / 声调数字。
     * 前后必须是非 ASCII 字母数字下划线（中文、标点、空白都算边界）。
     * 没有边界的话，"abcju1" 这种英文单词内部会被切开当成拼音；
     * 下划线也算词字符，所以 `ni3_hao3` 这种标识符样子的串整体不动。
     *
     * 先按片段整体取出、再交给 convertToken，而不是逐音节匹配：
     * 这样 "ni3hao3" 也能切开，而 "ju1abc" 仍然整体不动。
     */
    // ^ 写在字符类末尾是字面量（不在首位就不表示取反）。
    const inlineRun = /[A-Za-z:0-5^]+/g;
    const wordChar = /[A-Za-z0-9_]/;

    /**
     * 给用 ASCII 写成的拼音标上调号：`hao3` -> `hǎo`。
     * 混在中文里的也认：`今天ni3hao3` -> `今天nǐhǎo`。
     *
     * 名字说的是动作 —— 调号字形本来就存在（词表只存无调形式，四个声调由
     * applyToneMark 现算），这一步做的是把数字换成那个字形，不是「汉字转拼音」，
     * 也不是「按声调给音节分类」。也不猜声调：没有声调数字就没有调号可标，
     * 只按规范拼写输出（`jv` -> `jū`、`ma` -> `ma`）。
     *
     * 分词不靠空格：先在整段里取出候选片段，片段内部再按声调数字切音节，
     * 所以 `ni3hao3` 与 `ni3 hao3` 都成立，而粘在单词上的 `abcju1` / `ju1abc`
     * 不动。非拼音字符（汉字、标点、空白）逐字保留，首尾空白也不替调用方裁掉 ——
     * 转换只改字母和声调，不接管排版。
     *
     * 大写照收，形态原样带到输出：`Zhong1guo2` -> `Zhōngguó`、
     * `BEI3JING1` -> `BĚIJĪNG`。音节内部混用大小写（`hAo3`）不是标准里的写法，
     * 整串原样返回。
     *
     * 不想转的片段写进 `skip` 选项（见该选项的说明）—— 输入里不带任何标记字符，
     * 这样含反斜杠或花括号的正文（路径、LaTeX、模板）一个字都不会被吃掉。
     * @param {string} text
     * @param {{strict?: boolean, skip?: unknown}} [options]
     * @returns {string}
     */
    function markTones(text, options) {
        const strict = readStrict(options);
        const skip = readSkip(options);

        return text.replace(inlineRun, (run, offset) => {
            const before = offset > 0 ? text[offset - 1] : '';
            const after = offset + run.length < text.length ? text[offset + run.length] : '';

            // 片段粘在字母数字下划线旁边 -> 是英文单词的一部分，本来就不转
            const converted = wordChar.test(before) || wordChar.test(after)
                ? run
                : convertToken(run, strict);

            // 只对本该转换的片段询问规则：已经原样返回的片段没有东西可挡
            if (skip !== null && converted !== run && skip(run)) return run;

            return converted;
        });
    }

    module.exports = {markTones};
    return module.exports;
})();

module.exports = {markTones: __modules[2].markTones};
