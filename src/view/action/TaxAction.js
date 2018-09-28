import ConfigConstant from "../constant/tax/ConfigConstant";

export default {

    /**
     * Get tax rate
     *
     * @return {{type}}
     */
    getTaxRate: () => {
        return {
            type: ConfigConstant.GET_TAX_RATE_ONLINE
        }
    },

    /**
     * Action get tax rates result
     *
     * @param taxRates
     * @returns {{type: string, taxRules: *}}
     */
    getTaxRateResult: (taxRates) => {
        return {
            type: ConfigConstant.GET_TAX_RATE_ONLINE_RESULT,
            taxRates: taxRates
        }
    },

    /**
     * Aaction get tax rate error
     *
     * @param error
     * @returns {{type: string, error: *}}
     */
    getTaxRateError: (error) => {
        return {
            type: ConfigConstant.GET_TAX_RATE_ONLINE_ERROR,
            error: error
        }
    },

    /**
     * Get tax rule
     *
     * @return {{type}}
     */
    getTaxRule: () => {
        return {
            type: ConfigConstant.GET_TAX_RULE_ONLINE
        }
    },

    /**
     * Action get tax rules result
     *
     * @param taxRules
     * @returns {{type: string, taxRules: *}}
     */
    getTaxRuleResult: (taxRules) => {
        return {
            type: ConfigConstant.GET_TAX_RULE_ONLINE_RESULT,
            taxRules: taxRules
        }
    },

    /**
     * Action get tax rule error
     *
     * @param error
     * @returns {{type: string, error: *}}
     */
    getTaxRuleError: (error) => {
        return {
            type: ConfigConstant.GET_TAX_RULE_ONLINE_ERROR,
            error: error
        }
    }
}
