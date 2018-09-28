import TakePaymentConstant from '../../constant/order/TakePaymentConstant';

export default {
    /**
     * Select payment
     * @param payment
     * @param remain
     * @return {{type: string, payment: *, remain: *}}
     */
    selectPayment: (payment, remain) => {
        return {
            type: TakePaymentConstant.SELECT_PAYMENT,
            payment: payment,
            remain: remain
        }
    },

    /**
     * Switch page
     * @param paymentPage
     * @returns {{type: string, paymentPage: *}}
     */
    switchPage: (paymentPage) => {
        return {
            type: TakePaymentConstant.SWITCH_PAGE,
            paymentPage: paymentPage
        }
    },

    /**
     * Reset State
     * @returns {{type: string}}
     */
    resetState: () => {
        return {
            type: TakePaymentConstant.RESET_STATE
        }
    },

    /**
     * Add payment
     * @returns {{type: string}}
     */
    addPayment: (remain) => {
        return {
            type: TakePaymentConstant.ADD_PAYMENT,
            remain: remain
        }
    }
}