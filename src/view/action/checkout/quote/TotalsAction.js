import TotalsConstant from '../../../constant/checkout/quote/TotalsConstant';

export default {

    /**
     * Init quote total
     *
     * @param totalService
     * @returns {{type: string, service: *}}
     */
    salesQuoteInitTotalCollectors: (totalService) => {
        return {
            type: TotalsConstant.SALES_QUOTE_INIT_TOTAL_COLLECTORS,
            service: totalService
        }
    },

    /**
     * Collect quote total before
     *
     * @param quote
     * @returns {{type: string, quote: *}}
     */
    salesQuoteCollectTotalsBefore: (quote) => {
        return {
            type: TotalsConstant.SALES_QUOTE_COLLECT_TOTALS_BEFORE,
            quote: quote
        }
    },

    /**
     * Collect quote total after
     *
     * @param quote
     * @returns {{type: string, quote: *}}
     */
    salesQuoteCollectTotalsAfter: (quote) => {
        return {
            type: TotalsConstant.SALES_QUOTE_COLLECT_TOTALS_AFTER,
            quote: quote
        }
    },
}
