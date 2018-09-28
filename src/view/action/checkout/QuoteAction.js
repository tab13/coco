import QuoteConstant from '../../constant/checkout/QuoteConstant';

export default {

    /**
     * set quote action
     *
     * @param quote
     * @returns {{type: string, quote: *}}
     */
    setQuote: (quote) => {
        return {
            type: QuoteConstant.SET_QUOTE,
            quote: quote
        }
    },

    /**
     * add product action
     *
     * @param data
     * @returns {{type: string, data: *}}
     */
    addProduct: (data) => {
        return {
            type: QuoteConstant.ADD_PRODUCT,
            data: data
        }
    },

    /**
     * add product after action
     *
     * @param quote
     * @returns {{type: string, data: *}}
     */
    addProductAfter: (quote) => {
        return {
            type: QuoteConstant.ADD_PRODUCT_AFTER,
            quote: quote
        }
    },

    /**
     * add product response successfully
     *
     * @param quote
     * @returns {{type: string, quote: *}}
     */
    addProductSuccess: (quote) => {
        return {
            type: QuoteConstant.ADD_PRODUCT_SUCCESS,
            quote: quote
        }
    },

    /**
     * add product respond failed
     * @param response
     * @returns {{type: string, response: *}}
     */
    addProductFail: (response) => {
        return {
            type: QuoteConstant.ADD_PRODUCT_FAIL,
            response: response
        }
    },

    /**
     * remove cart action
     * @returns {{type: string}}
     */
    removeCart: () => {
        return {
            type: QuoteConstant.REMOVE_CART
        }
    },

    /**
     * removeCartItem action, when user click x button on cart
     *
     * @param item
     * @return {{type: string, item: *}}
     */
    removeCartItem: (item) => {
        return {
            type: QuoteConstant.REMOVE_CART_ITEM,
            item
        }
    },

    /**
     * removeCartItem action, when user click x button on cart
     *
     * @param quote
     * @return {{type: string, item: *}}
     */
    removeCartItemAfter: (quote) => {
        return {
            type: QuoteConstant.REMOVE_CART_ITEM_AFTER,
            quote
        }
    },

    /**
     *
     * @param quote
     * @return {{type: string, quote: *}}
     */
    removeCartItemSuccess: (quote) => {
        return {
            type: QuoteConstant.REMOVE_CART_ITEM_SUCCESS,
            quote: quote
        }
    },

    /**
     *
     * @param response
     * @return {{type: string, response: *}}
     */
    removeCartItemFail: (response) => {
        return {
            type: QuoteConstant.REMOVE_CART_ITEM_FAIL,
            response: response
        }
    },

    /**
     * updateQtyCartItem action, when user update qty on number pad
     * @param item
     * @param qty
     * @return {{type: string, item: *, qty: *}}
     */
    updateQtyCartItem: (item, qty) => {
        return {
            type: QuoteConstant.UPDATE_QTY_CART_ITEM,
            item,
            qty
        }
    },

    /**
     *
     * @param quote
     * @return {{type: string, quote: *}}
     */
    updateQtyCartItemAfter: (quote) => {
        return {
            type: QuoteConstant.UPDATE_QTY_CART_ITEM_AFTER,
            quote: quote
        }
    },

    /**
     *
     * @param quote
     * @return {{type: string, quote: *}}
     */
    updateQtyCartItemSuccess: (quote) => {
        return {
            type: QuoteConstant.UPDATE_QTY_CART_ITEM_SUCCESS,
            quote: quote
        }
    },

    /**
     *
     * @param response
     * @return {{type: string, response: *}}
     */
    updateQtyCartItemFail: (response) => {
        return {
            type: QuoteConstant.UPDATE_QTY_CART_ITEM_FAIL,
            response: response
        }
    },

    /**
     * Set payments
     * @param payments
     * @returns {{type: string, payments: *}}
     */
    setPayments: (payments) => {
        return {
            type: QuoteConstant.SET_PAYMENTS,
            payments
        }
    },

    /**
     * remove payment
     * @param payment
     * @param index
     * @returns {{type: string, payments: *}}
     */
    removePayment: (payment, index) => {
        return {
            type: QuoteConstant.REMOVE_PAYMENT,
            payment,
            index
        }
    },

    /**
     * add payment
     * @param payment
     * @param index
     * @returns {{type: string, payments: *}}
     */
    addPayment: (payment, index) => {
        return {
            type: QuoteConstant.ADD_PAYMENT,
            payment,
            index
        }
    },

    /**
     * Set customer for quote
     *
     * @param customer
     * @return {{type: string, customer: *}}
     */
    setCustomer: (customer) => {
        return {
            type: QuoteConstant.SET_CUSTOMER,
            customer: customer
        }
    },

    /**
     * Set customer for quote
     *
     * @param customer
     * @return {{type: string, customer: *}}
     */
    changeCustomerAfter: (quote) => {
        return {
            type: QuoteConstant.CHANGE_CUSTOMER_AFTER,
            quote: quote
        }
    },

    /**
     * Validate quote sales rule
     *
     * @param quote
     * @return {{type: string, quote: *}}
     */
    addCouponCodeAfter: (quote) => {
        return {
            type: QuoteConstant.ADD_COUPON_CODE_AFTER,
            quote: quote
        }
    },

    /**
     * Validate quote sales rule
     *
     * @param quote
     * @return {{type: string, quote: *}}
     */
    removeCouponCode: (quote) => {
        return {
            type: QuoteConstant.REMOVE_COUPON_CODE,
            quote: quote
        }
    },

    /**
     * Validate quote sales rule
     *
     * @param quote
     * @return {{type: string, quote: *}}
     */
    validateQuoteSalesRule: (quote) => {
        return {
            type: QuoteConstant.VALIDATE_QUOTE_SALES_RULE,
            quote: quote
        }
    },

    /**
     * item_id new product add quote
     *
     * @param addedItemId
     * @returns {{type: string, product: *}}
     */
    addedItemIdInQuote: (addedItemId) => {
        return {
            type: QuoteConstant.PRODUCT_ADD_QUOTE,
            added_item_id: addedItemId
        }
    },


    /**
     * updateCustomPriceCartItem action, when user update custom price + reason on popup
     * @param item
     * @param customPrice
     * @param reason
     * @return {{type: string, item: *, customPrice: *, reason: string}}
     */
    updateCustomPriceCartItem: (item, customPrice, reason) => {
        return {
            type: QuoteConstant.UPDATE_CUSTOM_PRICE_CART_ITEM,
            item,
            customPrice,
            reason
        }
    },

    /**
     *
     * @param response
     * @return {{type: string, response: *}}
     */
    updateCustomPriceCartItemFail: (response) => {
        return {
            type: QuoteConstant.UPDATE_CUSTOM_PRICE_CART_ITEM_FAIL,
            response: response
        }
    },

    /**
     * place order before
     *
     * @param quote
     * @returns {{type: string, quote: *}}
     */
    placeOrderBefore: (quote) => {
        return {
            type: QuoteConstant.PLACE_ORDER_BEFORE,
            quote: quote
        }
    }
}
