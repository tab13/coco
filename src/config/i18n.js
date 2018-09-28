import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {reactI18nextModule} from 'react-i18next';
import Config from "./Config"

let path = window.location.pathname;
path = path.split(Config.basename);
path = path[0] ? path[0] : '/';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(reactI18nextModule)
    .init({
        fallbackLng: false,
        lng: 'en',

        // have a common namespace used around the full app
        ns: ['translations'],
        defaultNS: 'translations',
        nsSeparator: false,
        keySeparator: false,

        debug: false,

        interpolation: {
            escapeValue: false, // not needed for react!!
        },

        backend: {
            loadPath: path + Config.basename + '/locales/{{lng}}/{{ns}}.json'
        },

        react: {
            wait: true,
            withRef: false,
            bindI18n: 'languageChanged loaded',
            bindStore: 'added removed',
            nsMode: 'default'
        }
    });


export default i18n;
