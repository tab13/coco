import NumberHelper from "./NumberHelper";
import CurrencyHelper from "./CurrencyHelper";
import ProductTypeConstant from "../view/constant/ProductTypeConstant";

export default {
    /**
     * format order price
     *
     * @param price
     * @param order
     * @return {*|string}
     */
    formatPrice(price, order) {
        return CurrencyHelper.format(price, order ? order.order_currency_code : null, null);
    },

    /**
     * format base order price
     *
     * @param basePrice
     * @param order
     * @return {*|string}
     */
    formatBasePrice(basePrice, order) {
        return CurrencyHelper.format(basePrice, order.base_currency_code);
    },

    /**
     * Convert base price to order currency
     *
     * @param basePrice
     * @param order
     * @return {*|number}
     */
    convert(basePrice, order) {
        return NumberHelper.multipleNumber(basePrice, order.base_to_order_rate);
    },

    /**
     * Convert base price to order currency
     *
     * @param basePrice
     * @param order
     * @return {*|number}
     */
    convertAndRound(basePrice, order) {
        return CurrencyHelper.roundToFloat(NumberHelper.multipleNumber(basePrice, order.base_to_order_rate));
    },

    /**
     * Convert price to base currency of order
     *
     * @param price
     * @param order
     * @return {number}
     */
    convertToBase(price, order) {
        return price / order.base_to_order_rate;
    },

    /**
     * Convert price to base currency of order
     *
     * @param price
     * @param order
     * @return {number}
     */
    convertAndRoundToBase(price, order) {
        return CurrencyHelper.roundToFloat(price / order.base_to_order_rate);
    },

    /**
     * Convert price to current currency
     *
     * @param price
     * @param order
     * @return {*|number}
     */
    convertPriceToCurrentCurrency(price, order) {
        return CurrencyHelper.convert(CurrencyHelper.convertToBase(price, order.order_currency_code));
    },

    /**
     * Convert base price to base currency
     *
     * @param basePrice
     * @param order
     * @return {*|number}
     */
    convertBasePriceToBaseCurrency(basePrice, order) {
        return CurrencyHelper.convertToBase(basePrice, order.base_currency_code);
    },

    /**
     * Convert base price to current currency
     *
     * @param basePrice
     * @param order
     * @return {*|number}
     */
    convertBasePriceToCurrentCurrency(basePrice, order) {
        return CurrencyHelper.convert(CurrencyHelper.convertToBase(basePrice, order.base_currency_code));
    },

    /**
     * Convert current currency price to order currency price
     *
     * @param price
     * @param order
     * @return {*|number}
     */
    convertCurrentCurrencyPriceToOrderCurrencyPrice(price, order) {
        return CurrencyHelper.convert(CurrencyHelper.convertToBase(price), order.order_currency_code);
    },

    /**
     * Convert current currency price to order currency price
     *
     * @param price
     * @param order
     * @return {*|number}
     */
    convertCurrentCurrencyPriceToOrderBaseCurrency(price, order) {
        return CurrencyHelper.convert(CurrencyHelper.convertToBase(price), order.order_currency_code)
            / order.base_to_order_rate;
    },
    
    /**
     * validate string and convert currency
     * @param price
     * @param order
     * @return {*|string}
     */
    validateAndConvertCurrency(price, order) {
        let currencyFormat = CurrencyHelper.getCurrencyFormat(order.order_currency_code);
        let regex = new RegExp(currencyFormat.group_symbol, "g");
        let convertPrice = price.toString().replace(/\s/g, "").replace(regex, "");
        return CurrencyHelper.round(convertPrice, currencyFormat.precision);
    },

    /**
     * strip html tag
     * @param str
     * @returns {string}
     */
    stripHtmlTags(str) {
        if ((str===null) || (str===''))
            return '';
        else
            str = str.toString();
        return str.replace(/<[^>]*>/g, '');
    },
    /**
     * check quote has gift card items
     * @param order
     * @return {boolean}
     */
    hasGiftCardItems(order) {
        let giftCardItem;
        if (order.items) {
            giftCardItem = order.items.find(item => item.product_type === ProductTypeConstant.GIFT_CARD);
        }
        return !!giftCardItem;
    }
}