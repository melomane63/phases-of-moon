/* constantesPOM.js - Constantes et traductions pour Moon Phase Extension */
import GLib from 'gi://GLib';

// Locale detection
const SYSTEM_LOCALE = GLib.getenv('LANG') || 'en_US.UTF-8';
export const LANGUAGE = SYSTEM_LOCALE.split('.')[0].split('_')[0];

// Translations
export const TRANSLATIONS = {
    en: { // English
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
            IN: 'in'
        }
    },
    fr: { // French
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
            IN: 'dans'
        }
    },
    es: { // Spanish
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
            IN: 'en'
        }
    },
    de: { // German
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
            IN: 'in'
        }
    },
    it: { // Italian
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
            IN: 'in'
        }
    },
    pt: { // Portuguese
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
            IN: 'em'
        }
    },
    ru: { // Russian
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
            IN: 'через'
        }
    },
    zh: { // Chinese
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
            IN: '在'
        }
    },
    ja: { // Japanese
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
            IN: 'で'
        }
    },
    ko: { // Korean
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
            IN: '에서'
        }
    },
    ar: { // Arabic
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
            IN: 'في'
        }
    },
    hi: { // Hindi
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
            IN: 'में'
        }
    },
    tr: { // Turkish
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
            IN: 'içinde'
        }
    },
    nl: { // Dutch
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
            IN: 'in'
        }
    },
    pl: { // Polish
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
            IN: 'za'
        }
    }
};

// Use detected language or English as default
const LANG = TRANSLATIONS[LANGUAGE] || TRANSLATIONS.en;

export const MOON_PHASES = Object.freeze(LANG.MOON_PHASES);
export const LABELS = Object.freeze(LANG.LABELS);

// PHASE_ICONS must use original (English) keys for mapping
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

// Mapping from English phases to translated phases
export const PHASE_TRANSLATION_MAP = {};
Object.keys(TRANSLATIONS.en.MOON_PHASES).forEach(key => {
    PHASE_TRANSLATION_MAP[TRANSLATIONS.en.MOON_PHASES[key]] = MOON_PHASES[key];
});

// Configuration constants
export const UPDATE_INTERVAL_SECONDS = 3600;
export const ICON_SIZE = 18;
export const POPUP_ICON_SIZE = 100; 

// StarWalk URLs
export const STARWALK_URL_TEMPLATE = 'https://starwalk.space/assets/moon-calendar/phases/moon-phase-london-uk-{year}-{month}-{day}-m.png';
export const STARWALK_CALENDAR_URL = 'https://starwalk.space/en/moon-calendar';
