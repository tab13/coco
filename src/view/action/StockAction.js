import StockConstant from "../constant/StockConstant";

export default {
    /**
     * get external stock
     * @param product_id
     * @returns {{type: string, product_id: *}}
     */
    getExternalStock: (product_id) => {
        return {
            type: StockConstant.GET_EXTERNAL_STOCK,
            product_id: product_id
        }
    },

    /**
     * get external stock result
     * @param locations
     * @returns {{type: string, locations: *}}
     */
    getExternalStockResult: (locations) => {
        return {
            type: StockConstant.GET_EXTERNAL_STOCK_RESULT,
            locations: locations
        }
    },

    /**
     * Show external stock
     * @param canBack
     * @returns {{type: string, canBack: *}}
     */
    showExternalStock: (canBack) => {
        return {
            type: StockConstant.SHOW_EXTERNAL_STOCK,
            canBack: canBack
        }
    },

    /**
     * Cancel External Stock
     * @returns {{type: string}}
     */
    cancelExternalStock: () => {
        return {
            type: StockConstant.CANCEL_EXTERNAL_STOCK,
        }
    },
}