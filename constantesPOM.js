// constantesPOM.js - Constants and translations for Moon Phase Extension
import GLib from 'gi://GLib';

const SYSTEM_LOCALE = GLib.getenv('LANG') || 'en_US.UTF-8';
export const LANGUAGE = SYSTEM_LOCALE.split('.')[0].split('_')[0];

export const TRANSLATIONS = {

    en: {
        MOON_PHASES: {
            NEW_MOON: 'New Moon',
            WAXING_CRESCENT: 'Waxing Crescent',
            FIRST_QUARTER: 'First Quarter',
            WAXING_GIBBOUS: 'Waxing Gibbous',
            FULL_MOON: 'Full Moon',
            WANING_GIBBOUS: 'Waning Gibbous',
            LAST_QUARTER: 'Last Quarter',
            WANING_CRESCENT: 'Waning Crescent'
        },
        LABELS: {
            ILLUMINATION: 'Illumination',
            AGE: 'Age',
            DAYS: 'days',
            IN: 'in',
            AT: 'at',
            TODAY: 'Today',
            TOMORROW: 'Tomorrow',
            ON: ' '
        }
    },

    fr: {
        MOON_PHASES: {
            NEW_MOON: 'Nouvelle Lune',
            WAXING_CRESCENT: 'Premier Croissant',
            FIRST_QUARTER: 'Premier Quartier',
            WAXING_GIBBOUS: 'Gibbeuse Croissante',
            FULL_MOON: 'Pleine Lune',
            WANING_GIBBOUS: 'Gibbeuse Décroissante',
            LAST_QUARTER: 'Dernier Quartier',
            WANING_CRESCENT: 'Dernier Croissant'
        },
        LABELS: {
            ILLUMINATION: 'Illumination',
            AGE: 'Âge',
            DAYS: 'jours',
            IN: 'dans',
            AT: 'à',
            TODAY: 'Aujourd\'hui',
            TOMORROW: 'Demain',
            ON: ' le '
        }
    },

    es: {
        MOON_PHASES: {
            NEW_MOON: 'Luna Nueva',
            WAXING_CRESCENT: 'Luna Creciente',
            FIRST_QUARTER: 'Cuarto Creciente',
            WAXING_GIBBOUS: 'Gibosa Creciente',
            FULL_MOON: 'Luna Llena',
            WANING_GIBBOUS: 'Gibosa Menguante',
            LAST_QUARTER: 'Cuarto Menguante',
            WANING_CRESCENT: 'Luna Menguante'
        },
        LABELS: {
            ILLUMINATION: 'Iluminación',
            AGE: 'Edad',
            DAYS: 'días',
            IN: 'en',
            AT: 'a',
            TODAY: 'Hoy',
            TOMORROW: 'Mañana',
            ON: ' el '
        }
    },

    de: {
        MOON_PHASES: {
            NEW_MOON: 'Neumond',
            WAXING_CRESCENT: 'Zunehmende Sichel',
            FIRST_QUARTER: 'Erstes Viertel',
            WAXING_GIBBOUS: 'Zunehmender Mond',
            FULL_MOON: 'Vollmond',
            WANING_GIBBOUS: 'Abnehmender Mond',
            LAST_QUARTER: 'Letztes Viertel',
            WANING_CRESCENT: 'Abnehmende Sichel'
        },
        LABELS: {
            ILLUMINATION: 'Beleuchtung',
            AGE: 'Alter',
            DAYS: 'Tage',
            IN: 'in',
            AT: 'um',
            TODAY: 'Heute',
            TOMORROW: 'Morgen',
            ON: ' am '
        }
    },

    it: {
        MOON_PHASES: {
            NEW_MOON: 'Luna Nuova',
            WAXING_CRESCENT: 'Luna Crescente',
            FIRST_QUARTER: 'Primo Quarto',
            WAXING_GIBBOUS: 'Gibbosa Crescente',
            FULL_MOON: 'Luna Piena',
            WANING_GIBBOUS: 'Gibbosa Calante',
            LAST_QUARTER: 'Ultimo Quarto',
            WANING_CRESCENT: 'Luna Calante'
        },
        LABELS: {
            ILLUMINATION: 'Illuminazione',
            AGE: 'Età',
            DAYS: 'giorni',
            IN: 'in',
            AT: 'alle',
            TODAY: 'Oggi',
            TOMORROW: 'Domani',
            ON: ' il '
        }
    },

    pt: {
        MOON_PHASES: {
            NEW_MOON: 'Lua Nova',
            WAXING_CRESCENT: 'Lua Crescente',
            FIRST_QUARTER: 'Quarto Crescente',
            WAXING_GIBBOUS: 'Gibosa Crescente',
            FULL_MOON: 'Lua Cheia',
            WANING_GIBBOUS: 'Gibosa Minguante',
            LAST_QUARTER: 'Quarto Minguante',
            WANING_CRESCENT: 'Lua Minguante'
        },
        LABELS: {
            ILLUMINATION: 'Iluminação',
            AGE: 'Idade',
            DAYS: 'dias',
            IN: 'em',
            AT: 'às',
            TODAY: 'Hoje',
            TOMORROW: 'Amanhã',
            ON: ' '
        }
    },

    ru: {
        MOON_PHASES: {
            NEW_MOON: 'Новолуние',
            WAXING_CRESCENT: 'Растущий серп',
            FIRST_QUARTER: 'Первая четверть',
            WAXING_GIBBOUS: 'Растущая луна',
            FULL_MOON: 'Полнолуние',
            WANING_GIBBOUS: 'Убывающая луна',
            LAST_QUARTER: 'Последняя четверть',
            WANING_CRESCENT: 'Убывающий серп'
        },
        LABELS: {
            ILLUMINATION: 'Освещённость',
            AGE: 'Возраст',
            DAYS: 'дней',
            IN: 'через',
            AT: 'в',
            TODAY: 'Сегодня',
            TOMORROW: 'Завтра',
            ON: ' '
        }
    },

    zh: {
        MOON_PHASES: {
            NEW_MOON: '新月',
            WAXING_CRESCENT: '蛾眉月',
            FIRST_QUARTER: '上弦月',
            WAXING_GIBBOUS: '盈凸月',
            FULL_MOON: '满月',
            WANING_GIBBOUS: '亏凸月',
            LAST_QUARTER: '下弦月',
            WANING_CRESCENT: '残月'
        },
        LABELS: {
            ILLUMINATION: '照明',
            AGE: '月龄',
            DAYS: '天',
            IN: '在',
            AT: '于',
            TODAY: '今天',
            TOMORROW: '明天',
            ON: ' '
        }
    },

    ja: {
        MOON_PHASES: {
            NEW_MOON: '新月',
            WAXING_CRESCENT: '三日月',
            FIRST_QUARTER: '上弦の月',
            WAXING_GIBBOUS: '十三夜月',
            FULL_MOON: '満月',
            WANING_GIBBOUS: '十六夜月',
            LAST_QUARTER: '下弦の月',
            WANING_CRESCENT: '有明の月'
        },
        LABELS: {
            ILLUMINATION: '照度',
            AGE: '月齢',
            DAYS: '日',
            IN: 'で',
            AT: 'に',
            TODAY: '今日',
            TOMORROW: '明日',
            ON: ' '
        }
    },

    ko: {
        MOON_PHASES: {
            NEW_MOON: '신월',
            WAXING_CRESCENT: '초승달',
            FIRST_QUARTER: '상현달',
            WAXING_GIBBOUS: '상현망간달',
            FULL_MOON: '보름달',
            WANING_GIBBOUS: '하현망간달',
            LAST_QUARTER: '하현달',
            WANING_CRESCENT: '그믐달'
        },
        LABELS: {
            ILLUMINATION: '조도',
            AGE: '월령',
            DAYS: '일',
            IN: '에서',
            AT: '에',
            TODAY: '오늘',
            TOMORROW: '내일',
            ON: ' '
        }
    },

    ar: {
        MOON_PHASES: {
            NEW_MOON: 'محاق',
            WAXING_CRESCENT: 'هلال أول',
            FIRST_QUARTER: 'تربيع أول',
            WAXING_GIBBOUS: 'أحدب أول',
            FULL_MOON: 'بدر',
            WANING_GIBBOUS: 'أحدب أخير',
            LAST_QUARTER: 'تربيع أخير',
            WANING_CRESCENT: 'هلال أخير'
        },
        LABELS: {
            ILLUMINATION: 'الإضاءة',
            AGE: 'العمر',
            DAYS: 'أيام',
            IN: 'في',
            AT: 'في',
            TODAY: 'اليوم',
            TOMORROW: 'غداً',
            ON: ' '
        }
    },

    hi: {
        MOON_PHASES: {
            NEW_MOON: 'अमावस्या',
            WAXING_CRESCENT: 'बढ़ता चंद्रमा',
            FIRST_QUARTER: 'पहला चौथाई',
            WAXING_GIBBOUS: 'बढ़ता गिबस',
            FULL_MOON: 'पूर्णिमा',
            WANING_GIBBOUS: 'घटता गिबस',
            LAST_QUARTER: 'आखिरी चौथाई',
            WANING_CRESCENT: 'घटता चंद्रमा'
        },
        LABELS: {
            ILLUMINATION: 'रोशनी',
            AGE: 'आयु',
            DAYS: 'दिन',
            IN: 'में',
            AT: 'पर',
            TODAY: 'आज',
            TOMORROW: 'कल',
            ON: ' '
        }
    },

    tr: {
        MOON_PHASES: {
            NEW_MOON: 'Yeni Ay',
            WAXING_CRESCENT: 'Hilal',
            FIRST_QUARTER: 'İlk Dördün',
            WAXING_GIBBOUS: 'Şişkin Ay',
            FULL_MOON: 'Dolunay',
            WANING_GIBBOUS: 'Son Şişkin Ay',
            LAST_QUARTER: 'Son Dördün',
            WANING_CRESCENT: 'Eski Ay'
        },
        LABELS: {
            ILLUMINATION: 'Aydınlanma',
            AGE: 'Yaş',
            DAYS: 'gün',
            IN: 'içinde',
            AT: '',
            TODAY: 'Bugün',
            TOMORROW: 'Yarın',
            ON: ' '
        }
    },

    nl: {
        MOON_PHASES: {
            NEW_MOON: 'Nieuwe Maan',
            WAXING_CRESCENT: 'Wassende Maan',
            FIRST_QUARTER: 'Eerste Kwartier',
            WAXING_GIBBOUS: 'Wassende Maan',
            FULL_MOON: 'Volle Maan',
            WANING_GIBBOUS: 'Afnemende Maan',
            LAST_QUARTER: 'Laatste Kwartier',
            WANING_CRESCENT: 'Afnemende Maan'
        },
        LABELS: {
            ILLUMINATION: 'Verlichting',
            AGE: 'Leeftijd',
            DAYS: 'dagen',
            IN: 'in',
            AT: 'om',
            TODAY: 'Vandaag',
            TOMORROW: 'Morgen',
            ON: ' '
        }
    },

    pl: {
        MOON_PHASES: {
            NEW_MOON: 'Nów',
            WAXING_CRESCENT: 'Rożek przybywający',
            FIRST_QUARTER: 'Pierwsza kwadra',
            WAXING_GIBBOUS: 'Księżyc garbaty przybywający',
            FULL_MOON: 'Pełnia',
            WANING_GIBBOUS: 'Księżyc garbaty ubywający',
            LAST_QUARTER: 'Ostatnia kwadra',
            WANING_CRESCENT: 'Rożek ubywający'
        },
        LABELS: {
            ILLUMINATION: 'Oświetlenie',
            AGE: 'Wiek',
            DAYS: 'dni',
            IN: 'za',
            AT: 'o',
            TODAY: 'Dziś',
            TOMORROW: 'Jutro',
            ON: ' '
        }
    },

    hu: {
        MOON_PHASES: {
            NEW_MOON: 'Újhold',
            WAXING_CRESCENT: 'Növő sarló',
            FIRST_QUARTER: 'Első negyed',
            WAXING_GIBBOUS: 'Növő hold',
            FULL_MOON: 'Telihold',
            WANING_GIBBOUS: 'Fogyó hold',
            LAST_QUARTER: 'Utolsó negyed',
            WANING_CRESCENT: 'Fogyó sarló'
        },
        LABELS: {
            ILLUMINATION: 'Megvilágítás',
            AGE: 'Kor',
            DAYS: 'nap',
            IN: 'Ekkor:',
            AT: 'Ekkor',
            TODAY: 'Ma',
            TOMORROW: 'Holnap',
            ON: ' '
        }
    },

    // === NEW LANGUAGES ADDED ===

    ur: {
        MOON_PHASES: {
            NEW_MOON: 'نیا چاند',
            WAXING_CRESCENT: 'بڑھتا ہلال',
            FIRST_QUARTER: 'پہلا چوتھائی',
            WAXING_GIBBOUS: 'بڑھتا چاند',
            FULL_MOON: 'پورا چاند',
            WANING_GIBBOUS: 'گھٹتا چاند',
            LAST_QUARTER: 'آخری چوتھائی',
            WANING_CRESCENT: 'گھٹتا ہلال'
        },
        LABELS: {
            ILLUMINATION: 'روشنائی',
            AGE: 'عمر',
            DAYS: 'دن',
            IN: 'میں',
            AT: 'پر',
            TODAY: 'آج',
            TOMORROW: 'کل',
            ON: ' '
        }
    },

    tl: {
        MOON_PHASES: {
            NEW_MOON: 'Bagong Buwan',
            WAXING_CRESCENT: 'Lumalagong Gasuklay',
            FIRST_QUARTER: 'Unang Kuwarter',
            WAXING_GIBBOUS: 'Lumalagong Buwan',
            FULL_MOON: 'Kabilugan ng Buwan',
            WANING_GIBBOUS: 'Humuhupang Buwan',
            LAST_QUARTER: 'Huling Kuwarter',
            WANING_CRESCENT: 'Humuhupang Gasuklay'
        },
        LABELS: {
            ILLUMINATION: 'Liwanag',
            AGE: 'Edad',
            DAYS: 'araw',
            IN: 'sa loob ng',
            AT: 'sa',
            TODAY: 'Ngayon',
            TOMORROW: 'Bukas',
            ON: ' '
        }
    },

    uk: {
        MOON_PHASES: {
            NEW_MOON: 'Молодик',
            WAXING_CRESCENT: 'Зростаючий серп',
            FIRST_QUARTER: 'Перша чверть',
            WAXING_GIBBOUS: 'Зростаючий місяць',
            FULL_MOON: 'Повня',
            WANING_GIBBOUS: 'Спадний місяць',
            LAST_QUARTER: 'Остання чверть',
            WANING_CRESCENT: 'Спадний серп'
        },
        LABELS: {
            ILLUMINATION: 'Освітленість',
            AGE: 'Вік',
            DAYS: 'днів',
            IN: 'через',
            AT: 'о',
            TODAY: 'Сьогодні',
            TOMORROW: 'Завтра',
            ON: ' '
        }
    },

    sw: {
        MOON_PHASES: {
            NEW_MOON: 'Mwezi Mpya',
            WAXING_CRESCENT: 'Mwezi Mwandamo',
            FIRST_QUARTER: 'Robo ya Kwanza',
            WAXING_GIBBOUS: 'Mwezi Unaokua',
            FULL_MOON: 'Mwezi Mzima',
            WANING_GIBBOUS: 'Mwezi Unaopungua',
            LAST_QUARTER: 'Robo ya Mwisho',
            WANING_CRESCENT: 'Mwezi Mwembamba Unaopungua'
        },
        LABELS: {
            ILLUMINATION: 'Mwangaza',
            AGE: 'Umri',
            DAYS: 'siku',
            IN: 'ndani ya',
            AT: 'saa',
            TODAY: 'Leo',
            TOMORROW: 'Kesho',
            ON: ' '
        }
    },

    am: {
        MOON_PHASES: {
            NEW_MOON: 'አዲስ ጨረቃ',
            WAXING_CRESCENT: 'የሚያድግ ጨረቃ',
            FIRST_QUARTER: 'መጀመሪያ ሩብ',
            WAXING_GIBBOUS: 'የሚያድግ ጨረቃ',
            FULL_MOON: 'ሙሉ ጨረቃ',
            WANING_GIBBOUS: 'የሚቀንስ ጨረቃ',
            LAST_QUARTER: 'የመጨረሻ ሩብ',
            WANING_CRESCENT: 'የሚቀንስ ጨረቃ'
        },
        LABELS: {
            ILLUMINATION: 'ብርሃን',
            AGE: 'እድሜ',
            DAYS: 'ቀናት',
            IN: 'ውስጥ',
            AT: 'በ',
            TODAY: 'ዛሬ',
            TOMORROW: 'ነገ',
            ON: ' '
        }
    },

    cs: {
        MOON_PHASES: {
            NEW_MOON: 'Nov',
            WAXING_CRESCENT: 'Dorůstající srpek',
            FIRST_QUARTER: 'První čtvrť',
            WAXING_GIBBOUS: 'Dorůstající měsíc',
            FULL_MOON: 'Úplněk',
            WANING_GIBBOUS: 'Ubývající měsíc',
            LAST_QUARTER: 'Poslední čtvrť',
            WANING_CRESCENT: 'Ubývající srpek'
        },
        LABELS: {
            ILLUMINATION: 'Osvětlení',
            AGE: 'Stáří',
            DAYS: 'dní',
            IN: 'za',
            AT: 'v',
            TODAY: 'Dnes',
            TOMORROW: 'Zítra',
            ON: ' '
        }
    },

    sv: {
        MOON_PHASES: {
            NEW_MOON: 'Nymåne',
            WAXING_CRESCENT: 'Tilltagande skära',
            FIRST_QUARTER: 'Första kvarteret',
            WAXING_GIBBOUS: 'Tilltagande måne',
            FULL_MOON: 'Fullmåne',
            WANING_GIBBOUS: 'Avtagande måne',
            LAST_QUARTER: 'Sista kvarteret',
            WANING_CRESCENT: 'Avtagande skära'
        },
        LABELS: {
            ILLUMINATION: 'Belysning',
            AGE: 'Ålder',
            DAYS: 'dagar',
            IN: 'om',
            AT: 'kl.',
            TODAY: 'Idag',
            TOMORROW: 'Imorgon',
            ON: ' '
        }
    }

};

const LANG = TRANSLATIONS[LANGUAGE] || TRANSLATIONS.en;

export const MOON_PHASES = Object.freeze(LANG.MOON_PHASES);
export const LABELS = Object.freeze(LANG.LABELS);

export const PHASE_ICONS = Object.freeze({
    'New Moon': 'New-moon-symbolic',
    'Waxing Crescent': 'Waxing-crescent-symbolic',
    'First Quarter': 'First-quarter-symbolic',
    'Waxing Gibbous': 'Waxing-gibbous-symbolic',
    'Full Moon': 'Full-moon-symbolic',
    'Waning Gibbous': 'Waning-gibbous-symbolic',
    'Last Quarter': 'Last-quarter-symbolic',
    'Waning Crescent': 'Waning-crescent-symbolic'
});

export const PHASE_NAMES = Object.values(MOON_PHASES);

export const PHASE_TRANSLATION_MAP = {};
Object.keys(TRANSLATIONS.en.MOON_PHASES).forEach(key => {
    PHASE_TRANSLATION_MAP[TRANSLATIONS.en.MOON_PHASES[key]] = MOON_PHASES[key];
});

export const UPDATE_INTERVAL_SECONDS = 3600;
export const ICON_SIZE = 18;
export const POPUP_ICON_SIZE = 100;

export const STARWALK_URL_TEMPLATE =
    'https://starwalk.space/assets/moon-calendar/phases/moon-phase-london-uk-{year}-{month}-{day}-m.png';

export const STARWALK_CALENDAR_URL =
    'https://starwalk.space/en/moon-calendar';
