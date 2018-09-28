import LocalStorageHelper from "../helper/LocalStorageHelper";

export const TranslateConfig = {
    LOCALSTORAGE_KEY: 'i18nextLng',
    LANGUAGES: {
        EN: 'en',
        VI: 'vi',
    },
    changeLanguage,
};

/**
 * change language
 * @param language
 */
function changeLanguage(language) {
    LocalStorageHelper.set(TranslateConfig.LOCALSTORAGE_KEY, language);
}
