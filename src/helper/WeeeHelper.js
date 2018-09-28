import ConfigHelper from "./ConfigHelper";
import ConfigConstant from "../view/constant/weee/ConfigConstant";

export default {
    /**
     * Check if weee tax amount should be taxable
     *
     * @return {boolean}
     */
    isTaxable() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_FPT_TAXABLE);
    },

    /**
     * Check if weee tax amount should be included to subtotal
     *
     * @return {boolean}
     */
    includeInSubtotal() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_FPT_INCLUDE_IN_SUBTOTAL);
    },

    /**
     * Check if fixed taxes are used in system
     *
     * @return {*|null}
     */
    isFixedTaxEnabled() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_FPT_ENABLED);
    },

    /**
     * Check if weee tax amount should be included to subtotal
     *
     * @return {boolean}
     */
    priceDisplayTypeIncludeFPT() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_POS_FPT_DISPLAY_PRODUCT_PRICE);
    },

    /**
     * Check if weee tax amount should be included to subtotal
     *
     * @return {boolean}
     */
    includeInSubtotalInPOS() {
        return !!+ConfigHelper.getConfig(ConfigConstant.XML_PATH_POS_FPT_INCLUDE_IN_SUBTOTAL);
    },
}