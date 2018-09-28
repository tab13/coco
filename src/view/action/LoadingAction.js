import LoadingConstant from '../constant/LoadingConstant';

export default {
    /**
     * action get config
     * @return type
     */
    increaseCount: () => {
        return {
            type: LoadingConstant.INCREASE_COUNT
        }
    },

    /**
     * Reset State
     * @returns {{type: string}}
     */
    resetState: () => {
        return {
            type: LoadingConstant.RESET_STATE
        }
    },

    /**
     * Clear Data
     * @returns {{type: string}}
     */
    clearData: () => {
        return {
            type: LoadingConstant.CLEAR_DATA
        }
    },

    /**
     * Clear data success
     * @returns {{type: string}}
     */
    clearDataSuccess: () => {
        return {
            type: LoadingConstant.CLEAR_DATA_SUCCESS
        }
    },

    /**
     * Clear data error
     * @returns {{type: string}}
     */
    clearDataError: (error) => {
        return {
            type: LoadingConstant.CLEAR_DATA_ERROR,
            error
        }
    }
}