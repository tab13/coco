import ConfigHelper from "./ConfigHelper";
import GiftcardConstant from "../view/constant/GiftcardConstant";

export default {
    /**
     * Check module giftcard enable
     *
     * @return {boolean}
     */
    isGiftcardEnable() {
        return !!+ConfigHelper.getConfig(GiftcardConstant.XML_PATH_IS_GIFTCARD_ACTIVE);
    },
    /**
     * Check config allow discount for shipping
     *
     * @return {boolean}
     */
    isAllowDiscountForShipping() {
        return !!+ConfigHelper.getConfig(GiftcardConstant.XML_PATH_ALLOW_DISCOUNT_FOR_SHIPPING);
    },
    /**
     * Config show number of giftcar prefix
     *
     * @return {number}
     */
    getShowPrefixGiftCard() {
        return ConfigHelper.getConfig(GiftcardConstant.XML_PATH_SHOW_GIFTCARD_PREFIX) * 1;
    },
    /**
     *
     * @return {*|string}
     */
    getHiddenCharGiftcard() {
        return ConfigHelper.getConfig(GiftcardConstant.XML_PATH_SHOW_HIDDEN_CHARACTER) || "x";
    },
    /**
     *
     * @return {*|string}
     */
    canUseWithCoupon() {
        return !!+ConfigHelper.getConfig(GiftcardConstant.XML_PATH_USE_WITH_COUPON);
    },

    /**
     * Get the hidden gift code
     *
     * @param string $code
     * @return {*|string}
     */
    getHiddenCode(code) {
        let prefix = this.getShowPrefixGiftCard();
        let prefixCode = code.substr(0, prefix);
        let suffixCode = code.substr(prefix);
        if (suffixCode) {
            let hiddenChar = this.getHiddenCharGiftcard();
            suffixCode = suffixCode.replace(/([a-zA-Z0-9-])/g, hiddenChar);
        }
        return prefixCode + suffixCode;
    }
}