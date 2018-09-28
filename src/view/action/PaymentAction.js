import PaymentConstant from '../constant/PaymentConstant';

export default {
    /**
     * action get payment online
     * @returns {{type: string}}
     */
    getPaymentOnline: () => {
        return {
            type: PaymentConstant.GET_PAYMENT_ONLINE
        }
    },

    /**
     * action get list payment from indexDB
     * @returns {{type: string}}
     */
    getListPayment: () => {
        return {
            type: PaymentConstant.GET_LIST_PAYMENT
        }
    },

    /**
     * action result list payment from indexDB
     * @param payments
     * @returns {{type: string, payments: *}}
     */
    getListPaymentResult: (payments) => {
        return {
            type: PaymentConstant.GET_LIST_PAYMENT_RESULT,
            payments: payments
        }
    },

    /**
     * Select payment
     * @param payment
     * @param remain
     * @return {{type: string, payment: *, remain: *}}
     */
    selectPayment: (payment, remain) => {
        return {
            type: PaymentConstant.SELECT_PAYMENT,
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
            type: PaymentConstant.SWITCH_PAGE,
            paymentPage: paymentPage
        }
    },

    /**
     * Reset State
     * @returns {{type: string}}
     */
    resetState: () => {
        return {
            type: PaymentConstant.RESET_STATE
        }
    },

    /**
     * Add payment
     * @returns {{type: string}}
     */
    addPayment: (remain) => {
        return {
            type: PaymentConstant.ADD_PAYMENT,
            remain: remain
        }
    },

    /**
     * clear payment data in indexedDb
     * @return {{type: string}}
     */
    clearData() {
        return {
            type: PaymentConstant.CLEAR_DATA
        }
    },
    /**
     *
     * @param payment
     * @param index
     * @return {{type: string, payment: *, index: *}}
     */
    paymentStatusToProcessing(payment, index) {
        return {
            type: PaymentConstant.PAYMENT_STATUS_TO_PROCESSING,
            payment,
            index
        }
    },
    /**
     *
     * @param payment
     * @param index
     * @param object
     * @return {{type: string, payment: *, index: *, object: *}}
     */
    startProcessSinglePayment(payment, index, object) {
        return {
            type: PaymentConstant.START_PROCESS_SINGLE_PAYMENT,
            payment,
            index,
            object
        }
    },
    /**
     *
     * @param saleObject
     * @return {{type: string, saleObject: *}}
     */
    prepareProcessPayment(saleObject) {
        return {
            type: PaymentConstant.PAYMENTS_STATUS_TO_PENDING,
            saleObject
        }
    },

    /**
     * update store credit when change shipping method
     * @param quote
     * @returns {{type: string, quote: *}}
     */
    updateStoreCreditWhenChangeShippingMethod(quote) {
        return {
            type: PaymentConstant.UPDATE_STORE_CREDIT_WHEN_CHANGE_SHIPPING_METHOD,
            quote: quote
        }
    },

    /**
     * update payment list
     * @param isUpdate
     * @return {{type: string, isUpdate: *}}
     */
    updatePaymentList(isUpdate, payments = null) {
        return {
            type: PaymentConstant.UPDATE_PAYMENT_LIST,
            isUpdate: isUpdate,
            payments: payments
        }
    }
}