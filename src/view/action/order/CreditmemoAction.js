import CreditmemoConstant from '../../constant/order/CreditmemoConstant';

export default {
    createCreditmemoPrepareTotals(creditmemo, order, totals) {
        return {
            type: CreditmemoConstant.CREATE_CREDITMEMO_PREPARE_TOTALS,
            creditmemo: creditmemo,
            order: order,
            totals: totals
        }
    },

    /**
     * Init creditmemo total
     *
     * @param creditmemoService
     * @return {{type: string, creditmemo: *}}
     */
    salesOrderCreditmemoInitTotalCollectors(creditmemoService) {
        return {
            type: CreditmemoConstant.SALES_ORDER_CREDITEMEMO_INIT_TOTAL_COLLECTORS,
            service: creditmemoService
        }
    },

    /**
     * Set credit memo
     * @param creditmemo
     * @return {{type: string, creditmemo: *}}
     */
    setCreditmemo(creditmemo) {
        return {
            type: CreditmemoConstant.SET_CREDITMEMO,
            creditmemo
        }
    },

    /**
     * Clear credit memo data
     *
     * @return {{type: string}}
     */
    clearCreditmemo() {
        return {
            type: CreditmemoConstant.RESET_CREDITMEMO
        }
    },

    /**
     * Create credit memo
     *
     * @param creditmemo
     * @return {{type: string, creditmemo: *}}
     */
    createCreditmemo(creditmemo) {
        return {
            type: CreditmemoConstant.CREATE_CREDITMEMO,
            creditmemo: creditmemo
        }
    },

    /**
     * Create credit memo
     *
     * @param creditmemo
     * @return {{type: string, creditmemo: *}}
     */
    createCreditmemoAfter(creditmemo) {
        return {
            type: CreditmemoConstant.CREATE_CREDITMEMO_AFTER,
            creditmemo: creditmemo
        }
    },

    /**
     * send email credit memo
     * @param increment_id
     * @param email
     * @param creditmemo_increment_id
     * @returns {{type: string, increment_id: *, email: *}}
     */
    sendEmailCreditmemo(increment_id, email, creditmemo_increment_id) {
        return {
            type: CreditmemoConstant.SEND_EMAIL_CREDITMEMO,
            increment_id: increment_id,
            email: email,
            creditmemo_increment_id: creditmemo_increment_id
        }
    },

    /**
     * credit memo create customer
     * @param order
     * @param email
     * @param isNewAccount
     * @returns {{type: string, email: *}}
     */
    creditmemoCreateCustomer(order, email, isNewAccount) {
        return {
            type: CreditmemoConstant.CREDITMEMO_CREATE_CUSTOMER,
            order: order,
            email: email,
            isNewAccount: isNewAccount
        }
    },

    /**
     * credit memo create customer result
     * @param order
     * @returns {{type: string, order: *}}
     */
    creditmemoCreateCustomerResult(order) {
        return {
            type: CreditmemoConstant.CREDITMEMO_CREATE_CUSTOMER_RESULT,
            order: order
        }
    },

    /**
     *
     * @param creditmemo
     * @return {{type: string, creditmemo: *}}
     */
    processPayment: (creditmemo) => {
        return {
            type: CreditmemoConstant.CREDITMEMO_PROCESS_PAYMENT,
            creditmemo
        }
    },

    /**
     * action process payments result
     * @param result
     * @param payment
     * @param index
     * @return {{type: string, result: *}}
     */
    processSinglePaymentResult: (result, payment, index) => {
        return {
            type: CreditmemoConstant.CREDITMEMO_PROCESS_SINGLE_PAYMENT_RESULT,
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
            type: CreditmemoConstant.CREDITMEMO_PROCESS_SINGLE_PAYMENT_ERROR,
            result,
            payment,
            index
        }
    },

    /**
     * action refund operation refund after
     * @param creditmemo
     * @param order
     * @return {{type: string, creditmemo: *, order: *}}
     */
    refundOperationRefundAfter: (creditmemo, order) => {
        return {
            type: CreditmemoConstant.REFUND_OPERATION_REFUND_AFTER,
            creditmemo,
            order,
        }
    },

    /**
     * action refund create action log before
     * @param creditmemo
     * @return {{type: string, creditmemo: *}}
     */
    creditmemoCreateActionLogBefore: (creditmemo) => {
        return {
            type: CreditmemoConstant.CREDITMEMO_CREATE_ACTION_LOG_BEFORE,
            creditmemo
        }
    },
}
