import Config from '../config/Config'
import ConfigHelper from './ConfigHelper'
import ProductTypeConstant from "../view/constant/ProductTypeConstant";

export default {
    /**
     * Check config buy at store fulfill online is enalbe
     *
     * @return {*|null}
     */
    isEnableBuyAtStoreFulFillOnline() {
        return !!+ConfigHelper.getConfig('webpos/omnichannel_experience/fulfill_online');
    },

    /**
     * check is show shipping method
     * @returns {*|string|Array}
     */
    isShowShippingMethod() {
        return Config.config && Config.config.shipping && Config.config.shipping.shipping_methods;
    },

    /**
     * Check is show delivery date
     *
     * @return {boolean}
     */
    isShowDeliveryDate() {
        return Config.config && Config.config.shipping && Config.config.shipping.delivery_date;
    },

    /**
     * Check is show delivery date
     *
     * @return {boolean}
     */
    isAllowToAddOutOfStockProduct() {
        return !!+ConfigHelper.getConfig('webpos/checkout/add_out_of_stock_product');
    },

    /**
     * Check need confirm before deleting cart
     *
     * @return {boolean}
     */
    needConfirmDeleteCart() {
        return !!+ConfigHelper.getConfig('webpos/checkout/need_confirm');
    },
    /**
     * check quote has gift card items
     * @param quote
     * @return {boolean}
     */
    hasGiftCardItems(quote) {
        let giftCardItem;
        if (quote.items) {
            giftCardItem = quote.items.find(item => item.product_type === ProductTypeConstant.GIFT_CARD);
        }
        return !!giftCardItem;
    }
}