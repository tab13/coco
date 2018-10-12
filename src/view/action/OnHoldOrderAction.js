import OnHoldOrderConstant from '../constant/OnHoldOrderConstant';

export default {
    /**
     * action hold order
     * @param quote
     * @return {{type: string, quote: *}}
     */
    holdOrder: (quote) => {
        // COCO-CUSTOMIZE
        if (typeof quote.staff_discount !== 'string') {
            quote.staff_discount = JSON.stringify(quote.staff_discount);
        }
        return {
            type: OnHoldOrderConstant.HOLD_ORDER,
            quote: quote
        }
    },

    /**
     * hold order result
     * @param order
     * @return {{type: string, order: *}}
     */
    holdOrderResult: (order) => {
        return {
            type: OnHoldOrderConstant.HOLD_ORDER_RESULT,
            order: order
        }
    },

    /**
     * action holder order after
     * @param {object} order
     * @param {object} quote
     * @returns {{type: string, order: *}}
     */
    holderOrderAfter: (order, quote) => {
        return {
            type: OnHoldOrderConstant.HOLD_ORDER_AFTER,
            order: order,
            quote: quote
        }
    },

    /**
     * Sync action update on hold order data finish
     * @param items
     * @return {{type: string, orders: Array}}
     */
    syncActionUpdateOnHoldOrderFinish(items = []) {
        return {
            type: OnHoldOrderConstant.SYNC_ACTION_UPDATE_ON_HOLD_ORDER_FINISH,
            orders: items
        }
    },

    /**
     * Sync deleted hold order finish
     * @param ids
     * @return {{type: string, ids: Array}}
     */
    syncDeletedHoldOrderFinish(ids = []) {
        return {
            type: OnHoldOrderConstant.SYNC_DELETED_HOLD_ORDER_FINISH,
            ids: ids
        }
    },

    /**
     * action search hold order
     * @param queryService
     * @param searchKey
     * @return {{type: string, queryService: *, search_key: string}}
     */
    searchOrder: (queryService, searchKey = '') => {
        return {
            type: OnHoldOrderConstant.SEARCH_ORDER,
            queryService: queryService,
            search_key: searchKey,
        }
    },

    /**
     * action search hold order result
     * @param orders
     * @param search_criteria
     * @param total_count
     * @param search_key
     * @param request_mode
     * @return {{type: string, orders: Array, search_criteria, total_count: number, search_key: string, request_mode: *}}
     */
    searchOrderResult: (
        orders = [],
        search_criteria = {},
        total_count = 0,
        search_key = '',
        request_mode
    ) => {
        return {
            type: OnHoldOrderConstant.SEARCH_ORDER_RESULT,
            orders: orders,
            search_criteria: search_criteria,
            total_count: total_count,
            search_key: search_key,
            request_mode: request_mode
        }
    },

    /**
     * Delete on hold order
     * @param order
     * @return {{type: string, order: *}}
     */
    deleteOrder: (order) => {
        return {
            type: OnHoldOrderConstant.DELETE_ON_HOLD_ORDER,
            order: order
        }
    }
}