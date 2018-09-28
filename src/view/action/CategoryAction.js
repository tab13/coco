import CategoryConstant from '../constant/CategoryConstant';

export default {
    /**
     * action get list category from indexDB
     * @returns {{type: string}}
     */
    getListCategory: () => {
        return {
            type: CategoryConstant.GET_LIST_CATEGORY,
        }
    },

    /**
     * action result list category
     * @param categories
     * @return type, categories
     */
    getListCategoryResult: (categories = []) => {
        return {
            type: CategoryConstant.GET_LIST_CATEGORY_RESULT,
            categories: categories
        }
    },

    /**
     * action get category online
     * @returns {{type: string}}
     */
    getCategoryOnline: () => {
        return {
            type: CategoryConstant.GET_CATEGORY_ONLINE,
        }
    },

    /**
     * action result get category online
     * @param categories
     * @returns {{type: string, categories: *}}
     */
    getCategoryOnlineResult: (categories = []) => {
        return {
            type: CategoryConstant.GET_CATEGORY_ONLINE_RESULT,
            categories: categories
        }
    },
}
