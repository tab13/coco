import Config from "../config/Config";
import ConfigHelper from "./ConfigHelper";
import ConfigConstant from "../view/constant/tax/ConfigConstant";

export default {
    /**
     * Flag which notify what we need use shipping prices exclude tax for calculations
     *
     * @var {bool}
     */
    _needUseShippingExcludeTax: false,

    getAllTaxRules() {
        return Config.config.tax_rules || [];
    },

    getAllTaxRates() {
        return Config.config.tax_rates || [];
    },

    /**
     * Get defined tax calculation algorithm
     *
     * @return {string}
     */
    getAlgorithm() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_ALGORITHM);
    },

    /**
     * Get tax class id specified for shipping tax estimation
     *
     * @return {number}
     */
    getShippingTaxClass() {
        return parseFloat(ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_SHIPPING_TAX_CLASS));
    },

    /**
     * Check if shipping prices include tax
     *
     * @return {boolean}
     */
    shippingPriceIncludesTax() {
        return !!parseFloat(ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_SHIPPING_INCLUDES_TAX));
    },

    /**
     * Check if prices of product in catalog include tax
     *
     * @return {boolean}
     */
    priceIncludesTax() {
        return ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_PRICE_INCLUDES_TAX) === '1';
    },

    /**
     * Check what taxes should be applied after discount
     *
     * @return {*|null}
     */
    applyTaxAfterDiscount() {
        return ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_APPLY_AFTER_DISCOUNT) === '1';
    },

    /**
     * Get product price display type
     *  1 - Excluding tax
     *  2 - Including tax
     *  3 - Both
     * @return {number}
     */
    getPriceDisplayType() {
        return parseFloat(ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_PRICE_DISPLAY_TYPE));
    },

    /**
     * @return {boolean}
     */
    displayCartPricesBoth() {
        return parseFloat(ConfigHelper.getConfig(ConfigConstant.XML_PATH_DISPLAY_CART_PRICE))
            === ConfigConstant.DISPLAY_TYPE_BOTH;
    },

    /**
     * Get flag what we need use shipping price exclude tax
     *
     * @return {bool} $flag
     */
    getNeedUseShippingExcludeTax() {
        return this._needUseShippingExcludeTax;
    },

    /**
     * Return the config value enable cross border trade
     *
     * @return {boolean}
     */
    crossBorderTradeEnabled() {
        return !!Number(ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_CROSS_BORDER_TRADE_ENABLED));
    },

    /**
     * Check if necessary do product price conversion
     * If it necessary will be returned conversion type (minus or plus)
     *;
     * @return bool
     */
    needPriceConversion() {
        let response = false;
        let priceInclTax = this.priceIncludesTax() || this.getNeedUseShippingExcludeTax();
        if (priceInclTax) {
            switch (this.getPriceDisplayType()) {
                case ConfigConstant.DISPLAY_TYPE_EXCLUDING_TAX:
                case ConfigConstant.DISPLAY_TYPE_BOTH:
                    return ConfigConstant.PRICE_CONVERSION_MINUS;
                case ConfigConstant.DISPLAY_TYPE_INCLUDING_TAX:
                    response = true;
                    break;
                default:
                    break
            }
        } else {
            switch (this.getPriceDisplayType()) {
                case ConfigConstant.DISPLAY_TYPE_INCLUDING_TAX:
                case ConfigConstant.DISPLAY_TYPE_BOTH:
                    return ConfigConstant.PRICE_CONVERSION_PLUS;
                case ConfigConstant.DISPLAY_TYPE_EXCLUDING_TAX:
                    response = false;
                    break;
                default:
                    break;
            }
        }

        if (response === false) {
            response = this.displayCartPricesBoth();
        }

        return response;
    },

    /**
     * Get configuration setting "Apply Discount On Prices Including Tax" value
     *
     * @return {boolean}
     */
    discountTax() {
        return +ConfigHelper.getConfig(ConfigConstant.CONFIG_XML_PATH_DISCOUNT_TAX) === 1;
    },

    /**
     * Return configuration setting product list "Display Prices" value include tax
     *
     * @return {boolean}
     */
    productListDisplayPriceIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_PRODUCT_LIST_DISPLAY_PRICE);
    },
    /**
     * Return configuration setting "Display shipping price" value include tax
     *
     * @return {boolean}
     */
    shippingPriceDisplayIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_DISPLAY_SHIPPING_PRICE);
    },

    /**
     * Return configuration setting shopping cart "Display Prices" value include tax
     *
     * @return {boolean}
     */
    shoppingCartDisplayPriceIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_SHOPPING_CART_DISPLAY_PRICE);
    },

    /**
     * Return configuration setting shopping cart "Display Subtotal" value include tax
     *
     * @return {boolean}
     */
    shoppingCartDisplaySubtotalIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_SHOPPING_CART_DISPLAY_SUBTOTAL);
    },

    /**
     * Return configuration setting shopping cart "Display Shipping" value include tax
     *
     * @return {boolean}
     */
    shoppingCartDisplayShippingIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_SHOPPING_CART_DISPLAY_SHIPPING_AMOUNT);
    },

    /**
     * Return configuration setting "Display Full Tax Summary" value
     *
     * @return {boolean}
     */
    displayFullTaxSummary() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_DISPLAY_FULL_TAX_SUMMARY);
    },

    /**
     * Return configuration setting "Display Full Tax Summary" value
     *
     * @return {boolean}
     */
    displayZeroSubtotal() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_DISPLAY_ZERO_SUBTOTAL);
    },

    /**
     * Return configuration setting order "Display Prices" value include tax
     *
     * @return {boolean}
     */
    orderDisplayPriceIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_ORDER_DISPLAY_PRICE);
    },

    /**
     * Return configuration setting order "Display Subtotal" value include tax
     *
     * @return {boolean}
     */
    orderDisplaySubtotalIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_ORDER_DISPLAY_SUBTOTAL);
    },

    /**
     * Return configuration setting order "Display Shipping Amount" value include tax
     *
     * @return {boolean}
     */
    orderDisplayShippingAmountIncludeTax() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_ORDER_DISPLAY_SHIPPING_AMOUNT);
    },

    /**
     * Return configuration setting order "Display Zero Tax subtotal" value
     *
     * @return {boolean}
     */
    orderDisplayZeroTaxSubTotal() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_ORDER_DISPLAY_ZERO_TAX_SUBTOTAL);
    },
}
