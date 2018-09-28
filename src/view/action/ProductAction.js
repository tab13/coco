import ProductConstant from '../constant/ProductConstant';

export default {

    /**
     * search product
     *
     * @param queryService
     * @param {string} searchKey
     * @returns {{type: string, queryService: *}}
     */
    searchProduct: (queryService, searchKey = '') => {
        return {
            type: ProductConstant.SEARCH_PRODUCT,
            queryService: queryService,
            search_key: searchKey
        }
    },

    /**
     * Action dispatch result of search product action
     *
     * @param {object[]} products
     * @param {object} search_criteria
     * @param {number} total_count
     * @param {string} search_key
     * @return type, products
     */
    searchProductResult: (products = [], search_criteria = {}, total_count = 0, search_key = '', requestMode) => {
        return {
            type: ProductConstant.SEARCH_PRODUCT_RESULT,
            products: products,
            search_criteria: search_criteria,
            total_count: total_count,
            search_key: search_key,
            request_mode: requestMode
        }
    },

    /**
     * action get list product by keyword
     * @param searchKey
     * @return type, search_key
     */
    getListProduct: (searchKey = '', currentPage = 1, pageSize = 16) => {
        return {
            type: ProductConstant.GET_LIST_PRODUCT,
            search_key: searchKey,
            currentPage: currentPage,
            pageSize: pageSize
        }
    },

    /**
     * action result list product
     * @param products
     * @return type, products
     */
    getListProductResult: (products = []) => {
        return {
            type: ProductConstant.GET_LIST_PRODUCT_RESULT,
            products: products
        }
    },

    /**
     * View product action
     *
     * @param {object || null}product
     * @return {{type: string, product: *}}
     */
    viewProduct: (product = null, isShowExternalStock = false, canBack = false) => {
        return {
            type: ProductConstant.VIEW_PRODUCT,
            product: product,
            isShowExternalStock: isShowExternalStock,
            canBack: canBack
        }
    },

    /**
     * Search by barcode
     * @param code
     * @returns {{type: string, code: *}}
     */
    searchByBarcode: (code) => {
        return {
            type: ProductConstant.SEARCH_BY_BARCODE,
            code: code
        }
    },

    /**
     * Sync action update product data finish
     *
     * @param items
     * @return {{type: string, products: *}}
     */
    syncActionUpdateProductDataFinish(items = []) {
        return {
            type: ProductConstant.SYNC_ACTION_UPDATE_PRODUCT_DATA_FINISH,
            products: items
        }
    },

    /**
     * Sync action update stock data finish
     *
     * @param items
     * @return {{type: string, stocks: *}}
     */
    syncActionUpdateStockDataFinish(items = []) {
        return {
            type: ProductConstant.SYNC_ACTION_UPDATE_STOCK_DATA_FINISH,
            stocks: items
        }
    },

    /**
     * Sync action update catalog rule price data finish
     * @param items
     * @return {{type: string, catalogrule_prices: Array}}
     */
    syncActionUpdateCatalogRulePriceDataFinish(items = []) {
        return {
            type: ProductConstant.SYNC_ACTION_UPDATE_CATALOG_RULE_PRICE_DATA_FINISH,
            catalogrule_prices: items
        }
    },

    /**
     * Sync action deleted catalog rule price data finish
     * @param ids
     * @return {{type: string, ids: Array}}
     */
    syncActionDeletedCatalogRulePriceDataFinish(ids = []) {
        return {
            type: ProductConstant.SYNC_ACTION_DELETED_CATALOG_RULE_PRICE_DATA_FINISH,
            ids: ids
        }
    }
}
