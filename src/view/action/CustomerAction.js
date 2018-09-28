import CustomerConstant from "../../view/constant/CustomerConstant";

export default {
    /**
     * search customer
     *
     * @param {object} queryService
     * @param {string} searchKey
     * @returns {{type: string, queryService: *}}
     */
    searchCustomer: (queryService, searchKey = '') => {
        return {
            type: CustomerConstant.SEARCH_CUSTOMER,
            queryService: queryService,
            search_key: searchKey
        }
    },

    /**
     * Action dispatch result of search customer action
     *
     * @param {object[]} customers
     * @param {object} search_criteria
     * @param {number} totalCount
     * @param {string} searchKey
     * @return {object}
     */
    searchCustomerResult: (customers = [], search_criteria = {}, totalCount = 0, searchKey = '') => {
        return {
            type: CustomerConstant.SEARCH_CUSTOMER_RESULT,
            customers: customers,
            search_criteria: search_criteria,
            total_count: totalCount,
            search_key: searchKey
        }
    },

    /**
     * Action dispatch reset customer list
     *
     * @return {object}
     */
    resetCustomerList: () => {
        return {
            type: CustomerConstant.RESET_CUSTOMER_LIST
        }
    },

    /**
     * create customer
     * @param customer
     * @returns {{type: string, customer: *}}
     */
    createCustomer: (customer) => {
        return {
            type: CustomerConstant.CREATE_CUSTOMER,
            customer: customer
        }
    },

    /**
     * create customer success
     * @param customer
     * @returns {{type: string, customer: *}}
     */
    createCustomerSuccess: (customer) => {
        return {
            type: CustomerConstant.CREATE_CUSTOMER_SUCCESS,
            customer: customer
        }
    },

    /**
     * create customer
     * @param error
     * @returns {{type: string, customer: *}}
     */
    createCustomerError: (error) => {
        return {
            type: CustomerConstant.CREATE_CUSTOMER_ERROR,
            error: error
        }
    },

    /**
     * edit customer
     * @param customer
     * @returns {{type: string, customer: *}}
     */
    editCustomer: (customer) => {
        return {
            type: CustomerConstant.EDIT_CUSTOMER,
            customer: customer
        }
    },

    /**
     * edit customer error
     * @param error
     * @returns {{type: string, error: *}}
     */
    editCustomerError: (error) => {
        return {
            type: CustomerConstant.EDIT_CUSTOMER_ERROR,
            error: error
        }
    },

    /**
     * save customer
     * @param customers
     * @returns {{type: string, customers: *}}
     */
    saveCustomer(customers) {
        return {
            type: CustomerConstant.SAVE_CUSTOMER,
            customers: customers
        }
    },

    /**
     * Sync action update customer data finish
     * @param items
     * @return {{type: string, orders: Array}}
     */
    syncActionUpdateDataFinish(items = []) {
        return {
            type: CustomerConstant.SYNC_ACTION_UPDATE_DATA_FINISH,
            items: items
        }
    },

    /**
     * Sync deleted customer finish
     * @param ids
     * @return {{type: string, ids: Array}}
     */
    syncDeletedCustomerFinish(ids = []) {
        return {
            type: CustomerConstant.SYNC_DELETED_CUSTOMER_FINISH,
            ids: ids
        }
    },
}