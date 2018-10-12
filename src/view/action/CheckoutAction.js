import CheckoutConstant from '../constant/CheckoutConstant';

export default {
    /**
     * action place order
     * @param quote
     * @param additionalData
     * @return {{type: string, quote: *, additionalData: *}}
     */
    placeOrder: (quote, additionalData) => {
        // COCO-CUSTOMIZE
        if (typeof quote.staff_discount !== 'string') {
            quote.staff_discount = JSON.stringify(quote.staff_discount);
        }
        return {
            type: CheckoutConstant.CHECK_OUT_PLACE_ORDER,
            quote: quote,
            additionalData
        }
    },

    /**
     * action result order after place order
     * @param order
     * @returns {{type: string, order: *}}
     */
    placeOrderResult: (order) => {
        return {
            type: CheckoutConstant.CHECK_OUT_PLACE_ORDER_RESULT,
            order: order
        }
    },

    /**
     * action result error after place order
     * @param error
     * @returns {{type: string, error: *}}
     */
    placeOrderError: (error) => {
        return {
            type: CheckoutConstant.CHECK_OUT_PLACE_ORDER_ERROR,
            error: error
        }
    },

    /**
     *  whenever user click point discount
     * @param quote
     * @return {{type: string, quote: *}}
     */
    checkoutToSpendRewardPoint: (quote) => {
        return {
            type: CheckoutConstant.CHECKOUT_TO_SPEND_REWARD_POINT,
            quote
        }
    },

    /**
     * Action to show giftcard form
     *
     * @param quote
     * @return {{type: string, quote: *}}
     */
    checkoutToApplyGiftCard : (quote) => {
        return {
            type : CheckoutConstant.CHECKOUT_TO_APPLY_GIFT_CARD,
            quote
        }
    },

    /**
     *  whenever user click grand total, select payment show
     * @param quote
     * @return {{type: string, quote: *}}
     */
    checkoutToSelectPayments: (quote, initPayments) => {
        return {
            type: CheckoutConstant.CHECKOUT_TO_SELECT_PAYMENTS,
            quote,
            initPayments
        }
    },

    /**
     *  before user click grand total, init payment
     * @param quote
     * @return {{type: string, quote: *}}
     */
    initPayments: (quote) => {
        return {
            type: CheckoutConstant.CHECKOUT_INIT_PAYMENTS,
            quote
        }
    },

    /**
     *  whenever user click back on select payment, product list show
     * @return {{type: string, quote: *}}
     */
    checkoutToCatalog: () => {
        return {
            type: CheckoutConstant.CHECKOUT_TO_CATALOG,
        }
    },
    switchPage: (page) => {
        return {
            type: CheckoutConstant.CHECKOUT_SWITCH_PAGE,
            page
        }
    },

    /**
     * action process payments
     * @param quote
     * @returns {{type: string, quote: *}}
     */
    processPayment: (quote) => {
        return {
            type: CheckoutConstant.CHECKOUT_PROCESS_PAYMENT,
            quote: quote
        }
    },

    /**
     * action process payments result
     * @param result
     * @param payment
     * @param index
     * @return {{type: string, result: *, payment: *, index: *}}
     */
    processSinglePaymentResult: (result, payment, index) => {
        return {
            type: CheckoutConstant.CHECKOUT_PROCESS_SINGLE_PAYMENT_RESULT,
            result,
            payment,
            index
        }
    },

    /**
     * action process payments error
     * @param result
     * @param payment
     * @param index
     * @return {{type: string, result: *, payment: *, index: *}}
     */
    processSinglePaymentError: (result, payment, index) => {
        return {
            type: CheckoutConstant.CHECKOUT_PROCESS_SINGLE_PAYMENT_ERROR,
            result,
            payment,
            index
        }
    },

}
