import LogoutPopupConstant from "../constant/LogoutPopupConstant";

/**
 * action emit whenever user click outside modal logout
 *
 * @return {{type}}
 */
export const toggle = () => {
    return {
        type: LogoutPopupConstant.TOGGLE_LOGOUT_ALERT,
    }
};

/**
 * action emit whenever user click outside modal logout
 *
 * @return {{type}}
 */
export const clickBackDrop = () => {
    return {
        type: LogoutPopupConstant.CLICK_MODAL_BACKDROP,
    }
};

/**
 * action emit whenever user click "Yes" option modal logout
 *
 * @return {{type}}
 */
export const clickLogOut = () => {
    return {
        type: LogoutPopupConstant.CLICK_MODAL_YES
    }
};

/**
 * action emit when logout request done
 *
 * @param response
 * @return {{type, response: *}}
 */
export const finishLogoutRequesting = (response) => {
    return {
        type: LogoutPopupConstant.FINISH_LOGOUT_REQUESTING,
        response
    }
};

/**
 * action emit when logout request has error
 *
 * @param reason
 * @return {{type, reason: *}}
 */
export const logoutRequestingError = (reason) => {
    return {
        type: LogoutPopupConstant.LOGOUT_REQUESTING_ERROR,
        reason
    }
};

/**
 * action force signout
 *
 * @return {{type}}
 */
export const forceSignOut = () => {
    return {
        type: LogoutPopupConstant.FORCE_SIGN_OUT
    }
};

/**
 * action emit when error alert dismiss
 *
 * @return {{type}}
 */
export const afterErrorAlertDismiss = () => {
    return {
        type: LogoutPopupConstant.AFTER_ERROR_ALERT_DISMISS,
    }
};

export const reInit = () => {
    return {
        type: LogoutPopupConstant.LOGOUT_RE_INIT,
    }
};

/**
 * Combine actions
 *
 * @type {{toggle: function(), clickBackDrop: function(), clickLogOut: function(), finishLogoutRequesting: function(*), forceSignOut: function(), logoutRequestingError: function(*), afterErrorAlertDismiss: function(), reInit: function()}}
 */
export default {
    toggle,
    clickBackDrop,
    clickLogOut,
    finishLogoutRequesting,
    forceSignOut,
    logoutRequestingError,
    afterErrorAlertDismiss,
    reInit
};