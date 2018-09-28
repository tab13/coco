import OrderConstant from '../constant/OrderConstant';
import SessionConstant from "../constant/SessionConstant";

export default {
    /**
     * action place order after
     * @param {object} order
     * @param {object} quote
     * @returns {{type: string, order: *}}
     */
    placeOrderAfter: (order, quote) => {
        return {
            type: OrderConstant.PLACE_ORDER_AFTER,
            order: order,
            quote: quote
        }
    },

    /**
     * action search order
     * @returns {{type: string}}
     */
    searchOrder: (queryService, searchKey = '', searchAllTime = false) => {
        return {
            type: OrderConstant.SEARCH_ORDER,
            queryService: queryService,
            search_key: searchKey,
            searchAllTime: searchAllTime
        }
    },

    /**
     * action search order result
     * @param orders
     * @param search_criteria
     * @param total_count
     * @param search_key
     * @param searchAllTime
     * @param request_mode
     * @return {{type: string, orders: Array, search_criteria: {}, total_count: number, search_key: string, searchAllTime: boolean, request_mode: *}}
     */
    searchOrderResult: (
        orders = [],
        search_criteria = {},
        total_count = 0,
        search_key = '',
        searchAllTime = false,
        request_mode
    ) => {
        return {
            type: OrderConstant.SEARCH_ORDER_RESULT,
            orders: orders,
            search_criteria: search_criteria,
            total_count: total_count,
            search_key: search_key,
            searchAllTime: searchAllTime,
            request_mode: request_mode
        }
    },

    /**
     * action search order error
     * @param error
     * @returns {{type: string, error: *}}
     */
    searchOrderError: (error) => {
        return {
            type: OrderConstant.SEARCH_ORDER_ERROR,
            error: error
        }
    },

    /**
     * action reprint order
     * @param order
     * @param credit_balance
     * @param point_balance
     * @return {{type: string, order: *, credit_balance: *, point_balance: *}}
     */
    reprintOrder: (order, credit_balance, point_balance) => {
        return {
            type: OrderConstant.REPRINT_ORDER,
            order,
            credit_balance,
            point_balance
        }
    },


    printReport: (currentSession) => {
        return {
            type: SessionConstant.PRINT_REPORT,
            currentSession,
        }
    },


    /**
     * Sync action update order data finish
     * @param items
     * @return {{type: string, orders: Array}}
     */
    syncActionUpdateDataFinish(items = []) {
        return {
            type: OrderConstant.SYNC_ACTION_UPDATE_DATA_FINISH,
            orders: items
        }
    },

    /**
     * Sync deleted order finish
     * @param ids
     * @return {{type: string, ids: Array}}
     */
    syncDeletedOrderFinish(ids = []) {
        return {
            type: OrderConstant.SYNC_DELETED_ORDER_FINISH,
            ids: ids
        }
    },

    /**
     * take payment
     * @param order
     * @return {{type: string, order: *}}
     */
    takePayment(order) {
        return {
            type: OrderConstant.TAKE_PAYMENT,
            order: order
        }
    },

    /**
     * take payment result
     * @param order
     * @param createInvoice
     * @return {{type: string, order: *, createInvoice: number}}
     */
    takePaymentResult(order, createInvoice = 0) {
        return {
            type: OrderConstant.TAKE_PAYMENT_RESULT,
            order: order,
            createInvoice: createInvoice
        }
    },




    /**
     * send email
     * @param order
     * @return {{type: string, order: *, email: string}}
     */
    sendEmail(order, email) {
        return {
            type: OrderConstant.SEND_EMAIL,
            order: order,
            email: email
        }
    },

    /**
     * send email result
     * @param order
     * @param
     * @return {{type: string}}
     */
    sendEmailResult(response) {
        return {
            type: OrderConstant.SEND_EMAIL_RESULT,
            response: response
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
            type: OrderConstant.ADD_PAYMENT,
            payment,
            index
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
            type: OrderConstant.REMOVE_PAYMENT,
            payment,
            index
        }
    },

    /**
     * add comment
     * @param order
     * @return {{type: string, order: *, email: string}}
     */
    addComment(order, comment, notify, visibleOnFront) {
        return {
            type: OrderConstant.ADD_COMMENT,
            order: order,
            comment: comment,
            notify: notify,
            visibleOnFront: visibleOnFront
        }
    },

    /**
     * action process payments
     * @param order
     * @returns {{type: string, quote: *}}
     */
    processPayment: (order) => {
        return {
            type: OrderConstant.TAKE_PAYMENT_PROCESS_PAYMENT,
            order
        }
    },

    /**
     * add comment result
     * @param order
     * @param
     * @return {{type: string}}
     */
    addCommentResult(response) {
        return {
            type: OrderConstant.ADD_COMMENT_RESULT,
            response: response
        }
    },



    /**
     * cance;
     * @param order
     * @return {{type: string, order: *, email: string}}
     */
    cancel(order, comment, notify, visibleOnFront) {
        return {
            type: OrderConstant.CANCEL,
            order: order,
            comment: comment,
            notify: notify,
            visibleOnFront: visibleOnFront
        }
    },

    /**
     * cancel result
     * @param order
     * @param
     * @return {{type: string}}
     */
    cancelResult(response) {
        return {
            type: OrderConstant.CANCEL_RESULT,
            response: response
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
            type: OrderConstant.TAKE_PAYMENT_PROCESS_SINGLE_PAYMENT_RESULT,
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
            type: OrderConstant.TAKE_PAYMENT_PROCESS_SINGLE_PAYMENT_ERROR,
            result,
            payment,
            index
        }
    },

    /**
     * get list order statuses
     * @return {{type: string}}
     */
    getListOrderStatuses: () => {
        return {
        type: OrderConstant.GET_LIST_ORDER_STATUSES,
        }
    },

    /**
     * action print creditmemo
     * @param {object} creditmemo
     * @returns {{type: string, order: *}}
     */
    printCreditmemo: (creditmemo, credit_balance, point_balance) => {
        return {
            type: OrderConstant.PRINT_CREDITMEMO,
            creditmemo,
            credit_balance,
            point_balance
        }
    }
}