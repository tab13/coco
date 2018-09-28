import UserConstant from "../constant/UserConstant";

/**
 * export UserAction
 * @type {{clickLogin: clickLogin, loginUserResult: loginUserResult, handleAssignPos: assignPos, assignPosResponse: assignPosResponse, assignPosError: assignPosError}}
 */
export default {

    /**
     * action click login
     * @param username
     * @param password
     * @returns {{type: string, username: string, password: string}}
     */
    clickLogin: (username = '', password = '') => {
        return {
            type: UserConstant.USER_CLICK_LOGIN,
            username: username,
            password: password
        }
    },

    continueLogin : () => {
        return {
            type: UserConstant.USER_CONTINUE_LOGIN
        }
    },
    /**
     * process login success
     *
     * @param response
     * @returns {{type: string, result: {session: *, locations: *|Array}}}
     */
    loginSuccess: (response) => {
        return {
            type: UserConstant.USER_LOGIN_RESULT,
            result: {
                session: response.session_id,
                locations: response.locations
            },
            sharing : {
                sharing_account : response.sharing_account,
            }
        }
    },

    /**
     *
     * @param param
     * @returns {{type: string, text: *}}
     */
    afterContinueLogin : (string) => {
        return {
            type: UserConstant.USER_AFTER_CONTINUE_LOGIN,
            param : string
        }
    },

    /**
     * process login error
     * @param message
     * @returns {{type: string, message: string}}
     */
    loginError:(message) => {
        return {
            type: UserConstant.USER_LOGIN_ERROR,
            error: message
        }
    },

    /**
     * close popup
     * @returns {{type: string, closed: boolean}}
     */
    closePopup: () => {
        return {
            type: UserConstant.USER_CLOSE_POPUP,
            closed: true
        }
    },

    /**
     * get logo
     * @returns {{type: string}}
     */
    getLogo: () => {
        return {
            type: UserConstant.USER_GET_LOGO
        }
    },

    /**
     * get logo success
     * @param response
     * @returns {{type: string, result: *}}
     */
    getLogoSuccess: (response) => {
        return {
            type: UserConstant.USER_GET_LOGO_SUCCESS,
            result: {
                logoUrl: response.logo_url
            }
        }
    },

    /**
     * get logo error
     * @param response
     * @returns {{type: string, result: *}}
     */
    getLogoError: (response) => {
        return {
            type: UserConstant.USER_GET_LOGO_ERROR,
            result: {
                logoUrl: ''
            }
        }
    },

    /**
     * change information staff
     * @param user_name
     * @param old_password
     * @param new_password
     * @returns {{type: string, user_name: *, old_password: *, new_password: *}}
     */
    changeInformation: (user_name, old_password, new_password) => {
        return {
            type: UserConstant.USER_CHANGE_INFORMATION,
            user_name: user_name,
            old_password: old_password,
            new_password: new_password
        }
    },

    /**
     * get countries
     * @returns {{type: string}}
     */
    getCountries: () => {
        return {
            type: UserConstant.USER_GET_COUNTRIES
        }
    }
}

