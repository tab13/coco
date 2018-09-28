import ShippingConstant from '../constant/ShippingConstant';

export default {
    /**
     * action get shipping online
     * @returns {{type: string}}
     */
    getShippingOnline: () => {
        return {
            type: ShippingConstant.GET_SHIPPING_ONLINE
        }
    },

    /**
     * action get list Shipping
     * @returns {{type: string}}
     */
    getListShipping: () => {
        return {
            type: ShippingConstant.GET_LIST_SHIPPING
        }
    },

    /**
     * action result get list Shipping
     * @param shipping_methods
     * @returns {{type: string, shipping_methods: *}}
     */
    getListShippingResult: (shipping_methods) => {
        return {
            type: ShippingConstant.GET_LIST_SHIPPING_RESULT,
            shipping_methods: shipping_methods
        }
    },

    /**
     * action result get list Shipping
     * @param quote
     * @param address
     * @returns {{type: string, shipping_methods: *}}
     */
    getShippingMethods: (quote = null, address = null) => {
        return {
            type: ShippingConstant.GET_SHIPPING_METHODS,
            quote: quote,
            address: address
        }
    },

    /**
     * Action save shipping
     *
     * @param quote
     * @param address
     * @param shippingMethod
     * @param deliveryDate
     * @param fulfillOnline
     * @return {object}
     */
    saveShipping(quote, address, shippingMethod, deliveryDate, fulfillOnline) {
        return {
            type: ShippingConstant.SAVE_SHIPPING,
            quote: quote,
            address: address,
            shipping_method: shippingMethod,
            delivery_date: deliveryDate,
            fulfill_online: fulfillOnline,
        }
    },

    /**
     * Action save shipping
     *
     * @param quote
     * @return {object}
     */
    saveShippingAfter(quote) {
        return {
            type: ShippingConstant.SAVE_SHIPPING_AFTER,
            quote: quote
        }
    }


}