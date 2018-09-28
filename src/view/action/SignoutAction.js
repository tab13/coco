import SignoutConstant from "../constant/SignoutConstant";

export default {
    /**
     * Get new location list
     *
     * @returns {{type: string, queryService: *}}
     */
     getNewLocations: (queryService) => {
        return {
            type: SignoutConstant.GET_NEW_LOCATION_LIST,
            queryService: queryService
        }
    },

    /**
     * Force sign out successfully
     *
     * @returns {{type: string, queryService: *}}
     */
     forceSignOutSuccess: () => {
        return {
            type: SignoutConstant.FORCE_SIGN_OUT_SUCCESS
        }
    }

}
