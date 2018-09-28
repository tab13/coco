import Config from '../config/Config'
import NumberHelper from "./NumberHelper";

export default {
    DEFAULT_STORE_PRECISION: 2,
    DEFAULT_DISPLAY_PRECISION: 2,
    DEFAULT_GROUP_LENGTH: 3,
    DEFAULT_GROUP_SYMBOL: ',',
    currencies: null,
    currencyFormat: {},
    globalCurrencyCode: null,
    baseCurrencyCode: null,
    currentCurrencyCode: null,
    /**
     * Reset currencies, baseCurrencyCode, currentCurrencyCode
     * It can be run when change current currency in POS
     */
    reset() {
        this.currencies = null;
        this.currencyFormat = {};
        this.globalCurrencyCode = null;
        this.baseCurrencyCode = null;
        this.currentCurrencyCode = null;
    },

    /**
     * get all currency object
     *
     * @return {array}
     */
    getAllCurrencies() {
        if (!this.currencies) {
            this.currencies = Config.config.currencies;
        }
        return this.currencies;
    },

    /**
     * Get base currency format
     *
     * @return {*|Array}
     */
    getBaseCurrencyFormat() {
        return this.getCurrencyFormat(this.getBaseCurrencyCode());
    },

    /**
     * Get currencies format
     *
     * @return {Array}
     */
    getCurrencyFormat(currencyCode) {
        if (!currencyCode) {
            currencyCode = this.getCurrentCurrencyCode();
        }
        if (Object.keys(this.currencyFormat).length <= 0) {
            let currencyFormat = {};
            Config.config.price_formats.map(item => currencyFormat[item.currency_code] = item);
            this.currencyFormat = currencyFormat;
        }
        return this.currencyFormat[currencyCode] || {};
    },

    /**
     * Get global currency code
     *
     * @return {string}
     */
    getGlobalCurrencyCode() {
        return this.getBaseCurrencyCode();
        /*if (!this.globalCurrencyCode) {
            this.globalCurrencyCode = Config.config.global_currency_code;
        }
        return this.globalCurrencyCode;*/
    },

    /**
     * Get base currency code
     *
     * @return {string}
     */
    getBaseCurrencyCode() {
        if (!this.baseCurrencyCode) {
            this.baseCurrencyCode = Config.config.base_currency_code;
        }
        return this.currentCurrencyCode;
    },

    /**
     * Get current currency code
     *
     * @return {string}
     */
    getCurrentCurrencyCode() {
        if (!this.currentCurrencyCode) {
            this.currentCurrencyCode = Config.config.current_currency_code;
        }
        return this.currentCurrencyCode;
    },

    /**
     * Get base currency object
     *
     * @return {object}
     */
    getBaseCurrency() {
        return this.getAllCurrencies().find(item => item.code === this.getBaseCurrencyCode());
    },

    /**
     * Get current currency object
     *
     * @return {T[]}
     */
    getCurrentCurrency() {
        return this.getAllCurrencies().find(item => item.code === this.getCurrentCurrencyCode());
    },

    /**
     * Get currency with currency code or currency object
     *
     * @param currency
     * @return {*}
     */
    getCurrency(currency) {
        if (typeof currency === 'string') {
            return this.getAllCurrencies().find(item => item.code === currency) || this.getCurrentCurrency();
        }
        if (currency && typeof currency === 'object' &&
            currency.code && currency.currency_name && currency.currency_rate) {
            return currency;
        }
        return this.getCurrentCurrency();

    },

    /**
     * Convert price from base currency to current currency
     *
     * @param {number} basePrice
     * @param {string || object} currency
     * @return {number}
     */
    convert(basePrice, currency = null) {
        currency = this.getCurrency(currency);
        if (currency.code === this.getBaseCurrencyCode())
            return basePrice;
        return NumberHelper.multipleNumber(basePrice, currency.currency_rate);
    },

    /**
     * Convert price
     *
     * @param {number} price
     * @param {string || object} currency
     * @param {number} precision
     * @return {string}
     */
    convertAndRound(price, currency, precision = this.DEFAULT_STORE_PRECISION) {
        return this.round(this.convert(price, currency), precision);
    },

    /**
     * Convert price
     *
     * @param {number} price
     * @param {string || object} currency
     * @param {number} precision
     * @return {number}
     */
    convertAndRoundToFloat(price, currency, precision = this.DEFAULT_STORE_PRECISION) {
        return this.roundToFloat(this.convert(price, currency), precision);
    },

    /**
     * Format price from float price to locale string price
     *
     * @param {number} price
     * @param {string || object} currency
     * @param {number} precision
     * @return {string}
     */
    format(price, currency, precision = this.DEFAULT_DISPLAY_PRECISION) {
        if (!price) {
            price = 0;
        }
        currency = this.getCurrency(currency);
        let currencyFormat = this.getCurrencyFormat(currency.code);
        if (typeof precision === 'undefined' || precision === null) {
            precision = currencyFormat.precision;
        }
        price = this.round(price, precision).toString();
        let [intPrice, decimalPrice] = price.split('.');
        let isNegative = price < 0;
        intPrice = Math.abs(intPrice ? intPrice : 0).toString();
        intPrice = this.addGroupSymbol(intPrice, currencyFormat.group_length, currencyFormat.group_symbol);
        if (precision) {
            price = intPrice + currencyFormat.decimal_symbol + decimalPrice;
        } else {
            price = intPrice;
        }
        let formatPrice = currencyFormat.pattern.replace('%s', price);
        if (isNegative) {
            formatPrice = "-" + formatPrice;
        }
        return formatPrice;
    },

    /**
     * Convert and format price to current currency
     *
     * @param {number} price
     * @param {string | object} currency
     * @param {number} precision
     * @return {*|string}
     */
    convertAndFormat(price, currency, precision = this.DEFAULT_STORE_PRECISION) {
        if (typeof precision === 'undefined' || precision === null) {
            let currencyFormat = this.getCurrencyFormat(currency);
            precision = currencyFormat.precision;
        }
        return this.format(this.convert(price, currency), currency, precision);
    },

    /**
     * Round price by precision
     *
     * @param {number} price
     * @param {number} precision
     * @return {string}
     */
    round(price = 0, precision = this.DEFAULT_STORE_PRECISION) {
        if (typeof precision === 'undefined' || precision === null) {
            let currencyFormat = this.getCurrencyFormat();
            precision = currencyFormat.precision;
        }
        let multiplicator = Math.pow(10, precision);
        price = parseFloat((price * multiplicator).toFixed(precision));
        return (Math.round(price) / multiplicator).toFixed(precision);
    },

    /**
     * Add group symbol to price string
     *
     * @param {string} string
     * @param {number} groupLength
     * @param {string} groupSymbol
     * @return {string}
     */
    addGroupSymbol(string = '', groupLength = this.DEFAULT_GROUP_LENGTH, groupSymbol = this.DEFAULT_GROUP_SYMBOL) {
        string = string.split(',').join('');
        let i = string.length % groupLength;
        let parts = i ? [string.substr(0, i)] : [];
        for (; i < string.length; i += groupLength) {
            parts.push(string.substr(i, groupLength));
        }
        if (parts.length > 0) {
            return parts.join(groupSymbol);
        }
        return '0';
    },

    /**
     * Round price and parse result to float
     *
     * @param {number} price
     * @param {number} precision
     * @return {number}
     */
    roundToFloat(price, precision = this.DEFAULT_STORE_PRECISION) {
        return parseFloat(this.round(price, precision));
    },

    /**
     * Convert current currency price to base currency price
     *
     * @param {number} price
     * @param {number} currentCurrency
     * @return {number}
     */
    convertToBase(price, currentCurrency) {
        currentCurrency = this.getCurrency(currentCurrency);
        return price / currentCurrency.currency_rate;
    },

    /**
     * Convert and round current currency price to base currency price
     *
     * @param {number} price
     * @param {string|object} currentCurrency
     * @param {number} precision
     * @return {*|string}
     */
    convertAndRoundToBase(price, currentCurrency, precision = this.DEFAULT_STORE_PRECISION) {
        return this.round(this.convertToBase(price, currentCurrency), precision);
    },

    /**
     * Convert and round current currency price to base currency price
     *
     * @param {number} price
     * @param {string|object} currentCurrency
     * @param {number} precision
     * @return {*|string}
     */
    convertAndRoundFloatToBase(price, currentCurrency, precision = this.DEFAULT_STORE_PRECISION) {
        return this.roundToFloat(this.convertToBase(price, currentCurrency), precision);
    },

    /**
     * Convert and format current currency price to base currency price
     *
     * @param {number} price
     * @param {string|object} currentCurrency
     * @param {number} precision
     * @return {*|string}
     */
    convertAndFormatToBase(price, currentCurrency, precision = this.DEFAULT_DISPLAY_PRECISION) {
        let baseCurrencyFormat = this.getCurrencyFormat(this.getBaseCurrencyCode());
        let convertPrice = this.convertToBase(price, currentCurrency);
        return this.format(convertPrice, this.getBaseCurrency(), baseCurrencyFormat.precision);
    },

    /**
     * validate string and convert currency
     * @param {string} price
     * @param {string} currencyCode
     * @returns {string}
     */
    validateAndConvertCurrency(price, currencyCode = null) {
        if (!currencyCode) {
            currencyCode = this.getCurrentCurrencyCode();
        }
        let currencyFormat = this.getCurrencyFormat(currencyCode);
        let regex = new RegExp(currencyFormat.group_symbol, "g");
        let convertPrice = price.toString().replace(/\s/g, "").replace(regex, "");
        return this.round(convertPrice, currencyFormat.precision);
    },

    /**
     * getDecimalSymbol
     * @param currencyCode
     * @return {*}
     */
    getDecimalSymbol(currencyCode) {
        let currency = this.getCurrency(currencyCode || undefined);
        let currencyFormat = this.getCurrencyFormat(currency.code);
        return currencyFormat['decimal_symbol']
    },

    /**
     * Format string to number by current currency
     *
     * @param currencyString
     * @param currencyCode
     * @return {number}
     */
    formatCurrencyStringToNumberString(currencyString, currencyCode) {
        currencyString = currencyString.toString();
        let currencyFormat = this.getCurrencyFormat(currencyCode);
        let [intPrice, decimalPrice] = currencyString.split(currencyFormat.decimal_symbol);
        intPrice = intPrice.split(currencyFormat.group_symbol).join("");
        decimalPrice = decimalPrice ? decimalPrice : "";
        while (decimalPrice.length < currencyFormat.precision) {
            decimalPrice += "0";
        }
        currencyString = intPrice + "." + decimalPrice;
        if (isNaN(currencyString)) {
            return "";
        }
        return currencyString;
    },

    /**
     * format Number String to currency string without currency symbol
     *
     * @param numberString
     * @param currencyCode
     * @param precision
     * @return {*}
     */
    formatNumberStringToCurrencyString(numberString, currencyCode, precision = null) {
        let currencyFormat = this.getCurrencyFormat(currencyCode);
        if (precision === null || typeof precision === 'undefined') {
            precision = currencyFormat.precision;
        }
        let [intPrice, decimalPrice] = this.round(numberString, precision).toString().split('.');
        intPrice = this.addGroupSymbol(intPrice, currencyFormat.group_length, currencyFormat.group_symbol);
        if (decimalPrice) {
            return intPrice + currencyFormat.decimal_symbol + decimalPrice;
        } else {
            return intPrice;
        }
    }


}