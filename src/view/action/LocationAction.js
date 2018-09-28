import UserConstant from "../constant/UserConstant";

export default {
    /**
     * action user assign pos
     * @param posId
     * @param locationId
     * @param currentStaffId
     * @returns {{type: string, posId: string, locationId: string, currentStaffId: string}}
     */
    assignPos: (posId = '', locationId = '', currentStaffId = '') => {
        return {
            type: UserConstant.USER_ASSIGN_POS,
            posId,
            locationId,
            currentStaffId
        }
    },
    
    /**
     * action user assign pos response
     * @returns {{type: string}}
     */
    assignPosResponse: () => {
        return {
            type: UserConstant.USER_ASSIGN_POS_RESPONSE,
            assignPos: true
        }
    },
    
    /**
     * action user assign pos error
     * @param error
     * @returns {{type: string, error: *}}
     */
    assignPosError: (error) => {
        return {
            type: UserConstant.USER_ASSIGN_POS_ERROR,
            error
        }
    }

}