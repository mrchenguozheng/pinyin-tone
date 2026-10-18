// Generated file — do not edit. The source is in lib/; rebuild with `npm run build:cjs`.
// scripts/build-cjs.mjs wraps lib/{dict,core,index}.js verbatim: the logic is the same as
// the ESM build, with imports turned into references to the wrapped results and exports
// attached to module.exports.

'use strict';

// Each slot holds the result of evaluating that module once, in dependency order.
const __modules = [];

__modules[0] = (function () {
    let module = {exports: {}};
    // Each key maps to its toneless form; the four tones are added at run time by
    // applyToneMark in index.js.
    // Why only the base is stored: of the 9,760 possible outputs (1,952 keys x 5 tones), 7,808
    // (80%) are a mechanical transform of the same base. "a -> ā/á/ǎ/à" is a rule, not data.
    // One base plus one rule is equivalent, entry for entry, to five pre-generated strings
    // (asserted over the whole table x 5).
    //
    // Of the 1,952 keys, 1,877 have a base that is just the key with v read as ü; the other 75
    // exceptions are written out literally in their values (74 keys where v is a consonant
    // letter, plus e^ for ê). So values stay spelled out key by key, with no substitution rule.
    //
    // A key has to be reachable by the input syntax: lowercase letters only, or e^ (^ standing
    // for the circumflex on ê). There used to be a 'ü' key whose value duplicated v exactly,
    // while /[a-z]+/ can never match ü — dead data that could not be hit. It was removed, and
    // test/test-keys.js checks this invariant key by key.
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
        ve: 'üe',  // overrides: v.js -> yunmu.js
        vai: 'vai',
        vei: 'vei',
        vao: 'vao',
        vou: 'vou',
        van: 'üan',  // overrides: v.js -> yunmu.js
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
        ver: 'üer',  // overrides: vr.js -> yunmur.js
        vair: 'vair',
        veir: 'veir',
        vaor: 'vaor',
        vour: 'vour',
        vanr: 'üanr',  // overrides: vr.js -> yunmur.js
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

        // Interjection syllables: not an initial-plus-final combination, so the dictionary
        // lists them separately. They have no vowel, and applyToneMark in index.js falls back
        // to marking the m / n instead (ḿ ń ň ǹ). ng is already in the zero-initial group
        // above; only the four missing ones are added here.
        m: 'm',
        n: 'n',
        hm: 'hm',
        hng: 'hng',
    };

    // Note: before the merge, these four were overwritten by later files (depending on the
    // argument order of Object.assign). Only the values that ended up in effect are kept here,
    // with the original conflict noted at the end of each line.
    return module.exports;
})();
__modules[1] = (function () {
    let module = {exports: {}};
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

    // A single syllable has to match the whole string: letters (either case), at most one
    // diacritic marker (^ or :), then an optional tone digit. Without the anchors the input is
    // silently truncated ("ma6" -> "ma"); the old version also accepted only lowercase and had
    // no anchors, so "Hao3" matched from after the H and produced "ǎo".
    const regex = /^(?<abc>[A-Za-z]+)(?<hat>\^?)(?<mark>:?)(?<num>[0-5]?)$/;

    // Splitting a run into syllables: a token is one or more pieces of "letters, optional
    // circumflex, optional colon, optional trailing letters, optional tone".
    // The greedy [A-Za-z]+ stops at a tone digit, so "ni3hao3" naturally splits into
    // ni3 | hao3 — a tone digit is the only reliable separator in unspaced pinyin, and no
    // syllable-level disambiguation is needed.
    //
    // Letters after the colon (after) belong to the same piece: the colon only says "this u
    // carries two dots", it is not a syllable boundary. "lu:e4" therefore reads
    // lü + e + fourth tone = lüè, not lü + é.
    const segment = /(?<abc>[A-Za-z]+)(?<hat>\^?)(?<mark>:?)(?<after>[A-Za-z]*)(?<num>[0-5]?)/g;

    // Between syllables only ASCII punctuation and whitespace are allowed. As soon as a gap
    // holds a letter, a digit or a Han character, this token is not "pinyin plus punctuation"
    // (English words, mixed case, an illegal tone, text interleaved with Chinese all land
    // here). The whole token is left as written rather than guessed at and cut up.
    const foreign = /[A-Za-z0-9]|\p{Script=Han}/u;

    // The colon in "u:" stands for the two dots over ü: ju:1 reads jü + first tone and gives
    // jǖ. It exists for US keyboards — a way to write the two dots without leaving ASCII.
    // Before the colon u and v are equivalent: jv:1 means the same thing (v already is the
    // ASCII writing of ü).
    //
    // The ^ in "e^" is the same idea applied differently: it stands for the circumflex over ê.
    // ê is the only pinyin letter that carries a circumflex (欸 and 诶 are read ê), so ^ is
    // accepted only on e — be^2 and x^2 come back as written, with no guessing that "moves ^
    // onto some letter". ê has no u in it, so the colon has nowhere to land and ^ and : are
    // mutually exclusive (e^:1 does not exist).

    // ------------------------------------------------------- the two spellings of ü
    //
    // After j/q/x/y a syllable has two spellings:
    //   standard (GB)    ju  jue  juan  jun   <- the two dots are dropped, as the standard says
    //   literal (kept)   jv  jve  jvan  jvn   <- the dictionary writes ü as v (ASCII input)
    // Both spell the same phoneme, not two different syllables, so converting between them
    // loses nothing.
    //
    // This holds only after j/q/x/y: after those four initials a u is never a real u (they are
    // in complementary distribution). After n/l, u and ü contrast (nǔ 努 / nǚ 女, lù 路 /
    // lǜ 绿) and must not be converted.
    const UMLAUT_HEADS = 'jqxy';

    // The finals that drop the dots: ü / üe / üan / ün, plus their erhua forms. This has to be
    // an explicit closed set — a prefix test like /^u/ would also match jui/jua/juo/juai/juei/
    // juen/juang/jueng, the impossible syllables the cartesian product leaves in the
    // dictionary, and turn them into jüí/jüá.
    const UMLAUT_FINALS = new Set(['u', 'ue', 'uan', 'un', 'ur', 'uer', 'uanr', 'unr']);

    /**
     * Literal spelling -> standard spelling (jv -> ju). Only inside the whitelist.
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
     * Standard spelling -> literal spelling (ju -> jv). Only inside the whitelist.
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
     * Does strict mode accept this dictionary key?
     *
     * The dictionary carries 1,952 keys so that input is forgiven; 1,110 of them come from the
     * cartesian product of initials and finals (jui, juang, juei, biong), while strict mode
     * accepts only the 426 syllables of Standard Mandarin.
     * Erhua is not listed separately: whether huar is legal follows entirely from hua, so the
     * check drops the trailing r and looks again — none of the 418 erhua syllables needs a line
     * in core.js.
     * @param {string} key
     * @returns {boolean}
     */
    function isCoreSyllable(key) {
        if (coreSyllables.has(key)) return true;

        // The literal spellings (jv / jve / jvan / jvn) are the same phoneme as the standard
        // ones and core.js lists only the standard form. Converting first and then testing for
        // erhua is what lets jver go through juer -> jue + r.
        const canonical = toCanonicalSpelling(key);
        if (coreSyllables.has(canonical)) return true;

        return canonical.length > 1 && canonical.endsWith('r')
            && coreSyllables.has(canonical.slice(0, -1));
    }

    /**
     * Look up the **toneless form** of a syllable. The spelling asked for is tried first, then
     * the other spelling as a fallback: after j/q/x/y the dictionary has keys in both spellings,
     * so converting is safe, and the fallback means that clearing the redundant jv keys later
     * will not break the literal form outright.
     *
     * Under strict, both spellings have to pass the core whitelist before the lookup — otherwise
     * jv1 would slip past strict mode through the fallback.
     * @param {string} abbr
     * @param {boolean} literal true for the literal spelling (jü), false for standard (ju)
     * @param {boolean} strict accept only the 426 syllables of Standard Mandarin
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
     * Empty, 0 and 5 all mean the neutral tone, which takes no mark.
     * @param {string} num
     * @returns {number}
     */
    function toneIndex(num) {
        return num === '' || num === '0' || num === '5' ? 0 : Number(num);
    }

    // Tone marks for tones 1 to 4. The neutral tone adds nothing, hence the 1-based index.
    // The m and n rows are the fallback for interjection syllables with no vowel — the mark
    // goes on the nasal itself (ḿ, hńg).
    // An array is used instead of a string for indexing: m̄ / m̌ / m̀ / n̄ are two code points
    // ("letter + combining mark"), and indexing a string would return half a character.
    const TONE_MARKS = {
        a: ['ā', 'á', 'ǎ', 'à'],
        o: ['ō', 'ó', 'ǒ', 'ò'],
        e: ['ē', 'é', 'ě', 'è'],
        i: ['ī', 'í', 'ǐ', 'ì'],
        u: ['ū', 'ú', 'ǔ', 'ù'],
        'ü': ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
        // ê already carries a circumflex and the tone mark stacks on top. Tones 2 and 4 have
        // precomposed characters (ế U+1EBF / ề U+1EC1); tones 1 and 3 do not, so they can only
        // be written as two code points, "ê + combining mark".
        'ê': ['ê\u0304', 'ế', 'ê\u030c', 'ề'],
        m: ['m\u0304', 'ḿ', 'm\u030c', 'm\u0300'],
        n: ['n\u0304', 'ń', 'ň', 'ǹ'],
    };

    // Priority among main vowels: a > o > e. Marking u in iu and i in ui falls out of "take the
    // last one" for free.
    // ê needs its own entry — it is not e, and indexOf('e') finds nothing in "ê".
    // Putting it last is safe: the only syllable containing ê is ê itself, which never occurs
    // alongside a / o / e.
    const MAIN_VOWELS = ['a', 'o', 'e', 'ê'];

    // The vowels other than a/o/e/ê. Marking u in iu and i in ui falls out of "take the last
    // one" for free.
    const CLOSING_VOWELS = 'iuü';

    // Where the tone lands in an interjection syllable: the last m or n (m -> ḿ, hng -> hńg,
    // ng -> ńg).
    const NASALS = 'mn';

    // The combinations that actually occur for interjection syllables in the dictionary
    // (pypinyin's pinyin_dict, whose readings follow 现代汉语词典). The glyphs are copied
    // entry by entry from that table:
    //   m    m̄ 嘸 / ḿ 呒呣唔嘸 / m̀ 呣      -- no third tone
    //   n    ń 咹哽唔嗯 / ň 㕶嗯 / ǹ 哏嗯   -- no first tone
    //   ng   ńg 哽唔嗯 / ňg 㕶嗯 / ǹg 嗯   -- no first tone
    //   hm   噷                            -- toneless only
    //   hng  哼                            -- toneless only
    //
    // This table is a **preference list**, not a closed set: a glyph listed here is used as
    // written, and anything else is generated by the rule "mark the last nasal". So m3, n1, ng1
    // and the four tones of hm / hng still convert — `m3` gives `m̌`, `hng2` gives `hńg`. Those
    // 11 forms are extrapolated and are not in the dictionary; they leave through the same exit
    // as the 9 attested forms above, with no difference in the output.
    //
    // The 9 values here currently agree with what the rule computes, entry for entry (so the
    // tests would still pass with this table deleted). It is kept so that the attested cells do
    // not drift with the rule: if the landing position or the code-point spelling changes later,
    // these 9 glyphs still come out the way the dictionary writes them instead of being quietly
    // rewritten by the rule.
    // m̄ / m̀ are two code points ("letter + combining mark"); writing them here is less
    // error-prone than assembling them elsewhere.
    const NASAL_TONES = {
        m: {1: 'm\u0304', 2: 'ḿ', 4: 'm\u0300'},
        n: {2: 'ń', 3: 'ň', 4: 'ǹ'},
        ng: {2: 'ńg', 3: 'ňg', 4: 'ǹg'},
        hm: {},
        hng: {},
    };

    /**
     * Put a tone mark on a toneless syllable: mark a if there is one, else o, else e (ê counts
     * as e, except that it already has a circumflex and needs its own lookup), else the last
     * vowel (iu -> u, ui -> i). A trailing erhua r is not a vowel and does not affect the choice.
     *
     * A syllable with no vowel at all (m, n, ng, hm, hng) is looked up in NASAL_TONES first: if
     * the dictionary has that tone, its glyph is used; otherwise the same rule generates one,
     * marking the last m or n (m3 -> m̌, hng2 -> hńg). The table is checked first so that the
     * code points of "letter + combining mark" forms such as m̄ / m̀ stay fixed — the rule
     * computes the same result.
     *
     * The dictionary stores only toneless forms and the four tones are generated here. They are
     * the same rule unrolled, so four pre-generated strings and one computed value agree entry
     * for entry (verified over the whole table, 1,952 x 5). The neutral tone (tone 0) adds
     * nothing.
     * @param {string} base
     * @param {number} tone 0-4
     * @returns {string|null} null when no mark can be added (not a known interjection syllable)
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
     * Look up the toneless form and add the tone. Returns null when the syllable is not
     * recognised, leaving the fallback to the caller.
     * The default output is the standard spelling: after j/q/x/y, ü always drops the dots
     * (jv1 -> jū), as 汉语拼音方案 requires; the literal spelling (jǖ) appears only when a colon
     * was written.
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
     * Turn the letter the colon sits on back into ü: u -> v (the dictionary writes ü as v).
     *   ju:1   -> jv      juan:1 -> jvan      nu:3 -> nv
     *   gu:1   -> gv      u:1    -> v         u:e1 -> ve
     *
     * The colon belongs on the u — u is the letter that takes the two dots. The v in `jv:` is
     * already the ASCII writing of ü, so the colon says the same thing twice, but it is not
     * ambiguous and is therefore handled exactly like `ju:` rather than treated as an error:
     * jv:1 and ju:1 both mean jǖ.
     *
     * The initial is not filtered: the colon is something the caller wrote explicitly, and it
     * asks for ü wherever it lands. `gu:1` giving `gǖ` and `u:e1` giving `üē` — syllables that
     * are not standard — is one of the reasons this package exists: it has to produce non-standard
     * spellings as well as standard ones. Whether to use them is the caller's decision, not the
     * converter's.
     *
     * With no u or v in the syllable there is nowhere to land (ma:1, ji:1), so this returns null
     * and the caller returns the token unchanged.
     * @param {string} abc
     * @returns {string|null}
     */
    function dottedKey(abc) {
        const i = abc.search(/[uv]/);
        if (i === -1) return null;

        // v is already the dictionary's spelling; only u has to become v
        return abc[i] === 'v' ? abc : abc.slice(0, i) + 'v' + abc.slice(i + 1);
    }

    // ------------------------------------------------------------------- letter case
    //
    // 汉语拼音方案 only defines the alphabet (each letter has an uppercase and a lowercase
    // form). How case is used belongs to 汉语拼音正词法基本规则 (GB/T 16159—2012) §6.3: the
    // start of a sentence and of each line of verse, the first letter of a proper name, the
    // first letter of every word in a multi-word name, and "in some contexts proper names may
    // be written entirely in capitals" (BĚIJĪNG, LǏ HUÁ). The tone rules in §6.5 make no
    // exception for capitals, so tone marks go on the capital vowels in those contexts —
    // Ě Ī Ǎ Ǔ Ǚ Ế are not invented glyphs.
    //
    // Three forms are therefore accepted: all lowercase, initial capital, all capitals. Mixing
    // case inside a syllable (hAo3, HaO3) is not something the standard writes, so it counts as
    // unrecognised and the whole run comes back as written. The form is decided per **syllable**,
    // not per token: the second syllable of Zhong1guo2 is still all lowercase, giving Zhōngguó.
    const LOWER = 0;
    const TITLE = 1;
    const UPPER = 2;

    /**
     * Read the letter case of one syllable.
     * @param {string} letters every letter of the syllable (abc + after)
     * @returns {number} LOWER / TITLE / UPPER; -1 when the case is mixed
     */
    function readCase(letters) {
        if (letters === letters.toLowerCase()) return LOWER;
        if (letters === letters.toUpperCase()) return UPPER;
        if (letters[0] === letters[0].toUpperCase()
            && letters.slice(1) === letters.slice(1).toLowerCase()) return TITLE;
        return -1;
    }

    /**
     * Put the case back on the rendered result. The tone mark is already on the vowel (Ǎ, Ǚ, Ế),
     * so all capitals is just toUpperCase; initial capital only touches the first character and
     * leaves the rest lowercase.
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
     * The colon marker wins over the default spelling: writing ju:1 asks for jǖ regardless of
     * context (jv:1 means the same; v is the ASCII writing of ü).
     * Letters after the colon belong to the same syllable (lu:e4 -> lüè), so the full final is
     * assembled first and then converted.
     * There are only two legal positions: right after the letter carrying the two dots, or at the
     * end of the syllable (jvan:1). Anywhere else (j:van1, jva:n1) is a mistake and is not guessed
     * at.
     *
     * When the colon lands on v (vv:1, vai:1, vu:1): v already is the ASCII writing of ü, so the
     * colon adds no information. If the first letter of that entry is still a consonant v, the
     * output goes through as usual — it is treated as "no colon written", and vv:1 comes out
     * identical to vv1.
     *
     * When the colon lands on u (uang:1, shui:3): after u becomes v, the dictionary reads v in
     * that entry as a consonant (uang -> vang -> vāng), so the output would contain a consonant v
     * the caller never wrote. That is a miss, not a conversion, and the caller gets the run back.
     *
     * The circumflex marker (e^) is a different thing: it does not pick a final, it turns e into
     * ê. ê has no u to carry the dots, so it excludes the colon; and it does not work after any
     * other letter either.
     *
     * The output spelling is decided by the token alone: a bare syllable is always standard, and
     * only a colon asks for the literal form. There is no "convert the whole run to literal"
     * switch, so literal is never threaded down the call chain — the one branch that needs the
     * literal form hardcodes true and the caller cannot change it.
     *
     * Letter case does not affect the lookup, only the output form: the dictionary is read in
     * lowercase and the original case is put back after rendering.
     * @param {string} abc
     * @param {string} hat `^` or an empty string
     * @param {string} mark
     * @param {string} after letters between the colon and the tone digit
     * @param {string} num
     * @param {boolean} strict
     * @returns {string|null}
     */
    function renderToken(abc, hat, mark, after, num, strict) {
        const form = readCase(abc + after);
        if (form === -1) return null;

        // Both keys and values in the dictionary are lowercase; look up in lowercase always
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

        // The colon has only two legal positions: right after the letter carrying the two dots
        // (u or v), or at the very end of the syllable. The first says "these dots belong to this
        // letter" (ju:an1 / jv:an1 / lu:e4); the second is the short form (juan:1 / jv:1). Allow
        // any position and obviously misplaced runs like j:van1 and jva:n1 would also get jüān —
        // that is not leniency, it is failing to read what was written.
        if (rest !== '' && lower.length !== raw.search(/[uv]/) + 1) return null;

        const syllable = renderSyllable(key, num, true, strict);
        if (syllable === null) return null;

        // dottedKey only changes the string when it turns a u into v, so key === raw means the
        // colon landed on v. Landed on v: the colon restates the same thing, so the output goes
        // through even if that entry treats v as a consonant. Landed on u: it has to produce a
        // real ü; an ASCII v left in the result means that entry did not read the u as ü, so the
        // colon missed.
        const landedOnV = key === raw;

        if (!landedOnV && syllable.includes('v')) return null;

        return applyCase(syllable, form);
    }

    /**
     * Convert one token to pinyin. Three cases; everything else comes back as written:
     *
     *   1. a single syllable          ni3          -> nǐ
     *   2. several syllables, joined  ni3hao3      -> nǐhǎo
     *   3. pinyin + ASCII punctuation ni3,hao3     -> nǐ,hǎo
     *
     * The output keeps the input's separators: no spaces are added between joined syllables, the
     * spaces that were written are still there, and punctuation stays where it was. Conversion
     * touches letters and tones only; layout is not the converter's call.
     *
     * If any part is unrecognised the whole run is returned as written ("a1b2c3", "hua1r", "ma6"):
     * better to leave a token unconverted than to emit half a result — half a result is harder to
     * notice than no result.
     * @param {string} str
     * @param {boolean} strict
     * @returns {string}
     */
    function convertToken(str, strict) {
        const single = regex.exec(str);

        // Single-syllable fast path: almost every input takes this branch
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
     * The public options accept only strict and skip; everything else is ignored — passing the
     * wrong thing should not change the algorithm.
     * @param {{strict?: boolean}|undefined} options
     * @returns {boolean}
     */
    function readStrict(options) {
        return Boolean(options && options.strict);
    }

    /**
     * Turn the skip option into "should this run be left alone?".
     *
     * Only a string or an array of strings is accepted; the comparison is against the **whole
     * run** and is case-sensitive. That looks blunt, but the rule can only ever match a run whose
     * text equals an entry exactly: `skip: 'M2'` cannot touch `M20`, and cannot touch `m2`.
     * That is also why the input needs no marker characters — everything to be kept is declared
     * in the options, and a backslash or a brace in the text is just text here.
     *
     * Anything unrecognised counts as not passed: like readStrict, an option should not change the
     * algorithm.
     * @param {{skip?: unknown}|undefined} options
     * @returns {((run: string) => boolean)|null}
     */
    function readSkip(options) {
        const spec = options === null || options === undefined ? undefined : options.skip;

        if (typeof spec === 'string') return (run) => run === spec;

        if (Array.isArray(spec)) {
            const exact = new Set(spec.filter((item) => typeof item === 'string'));
            // An empty array (or one full of junk) counts as not passed, saving a function call
            // on every conversion
            if (exact.size === 0) return null;
            return (run) => exact.has(run);
        }

        return null;
    }

    /**
     * Candidate runs: consecutive letters (either case), colons, circumflexes, tone digits.
     * The neighbours must not be ASCII letters, digits or underscores (Chinese, punctuation and
     * whitespace all count as boundaries). Without that requirement the inside of an English word
     * like "abcju1" would be cut out and treated as pinyin; an underscore is a word character
     * too, so an identifier-looking run such as `ni3_hao3` stays whole.
     *
     * The run is taken whole and then handed to convertToken rather than matched syllable by
     * syllable: that way "ni3hao3" still splits, while "ju1abc" still stays whole.
     */
    // ^ at the end of a character class is a literal (it only negates when it comes first).
    const inlineRun = /[A-Za-z:0-5^]+/g;
    const wordChar = /[A-Za-z0-9_]/;

    /**
     * Mark pinyin written in ASCII with tone marks: `hao3` -> `hǎo`.
     * Pinyin mixed into Chinese is recognised too: `今天ni3hao3` -> `今天nǐhǎo`.
     *
     * The name says what the call does. The tone-mark glyphs already exist (the dictionary stores
     * only toneless forms and applyToneMark computes the four tones on the fly); this step puts
     * that glyph in place of the digit. It is not "Chinese characters to pinyin", and not
     * "classify a syllable by tone" either. Nor does it guess a tone: with no tone digit there is
     * no mark to apply, so the syllable comes out in the standard spelling (`jv` -> `jū`,
     * `ma` -> `ma`).
     *
     * Splitting does not rely on spaces: candidate runs are taken from the text first and then
     * cut into syllables at their tone digits, so both `ni3hao3` and `ni3 hao3` work, while
     * `abcju1` and `ju1abc`, glued to a word, stay as written. Non-pinyin characters (Chinese,
     * punctuation, whitespace) are copied through, and leading or trailing whitespace is not
     * trimmed for the caller — conversion touches letters and tones only, and does not take over
     * layout.
     *
     * Capitals are accepted and their form carried into the output: `Zhong1guo2` -> `Zhōngguó`,
     * `BEI3JING1` -> `BĚIJĪNG`. Mixing case inside a syllable (`hAo3`) is not something the
     * standard writes, so the run comes back as written.
     *
     * Runs that should not be converted go into the `skip` option (see its notes) — the input
     * carries no marker characters, so text containing a backslash or a brace (paths, LaTeX,
     * templates) loses nothing.
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

            // Run glued to a letter, digit or underscore -> part of a word, never converted
            const converted = wordChar.test(before) || wordChar.test(after)
                ? run
                : convertToken(run, strict);

            // Only ask the rule about runs that would convert: a run already left as written has
            // nothing to keep
            if (skip !== null && converted !== run && skip(run)) return run;

            return converted;
        });
    }

    module.exports = {markTones};
    return module.exports;
})();

module.exports = {markTones: __modules[2].markTones};
