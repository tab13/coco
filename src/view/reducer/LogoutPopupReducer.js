import LogoutPopupConstant from "../constant/LogoutPopupConstant";

/**
 *  initial State for reducer
 *
 * @type {{isOpen: boolean, isRequesting: boolean, success: {}, error: {}}}
 */
const initState = {
    isOpen: false,
    isRequesting: false,
    success: {},
    error: {}
};

/**
 * receive action from Logout Popup Action
 *
 * @param state
 * @param action
 * @return {{isOpen: boolean, isRequesting: boolean, success: {}, error: {}}}
 * @constructor
 */
export default function LogoutPopupReducer(state = initState, action) {
    switch (action.type) {
        case LogoutPopupConstant.TOGGLE_LOGOUT_ALERT:
        case LogoutPopupConstant.CLICK_MODAL_BACKDROP:
            return {...state , isOpen: !state.isOpen };
        case LogoutPopupConstant.BEGIN_LOGOUT_REQUESTING:
            return {...state , isRequesting: true };
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return {...state , ...{ isRequesting: false, success: action.response, isOpen: false }};
        case LogoutPopupConstant.LOGOUT_REQUESTING_ERROR:
            return {...state , ...{ isRequesting: false, error: action.reason, isOpen: false } };
        case LogoutPopupConstant.AFTER_ERROR_ALERT_DISMISS:
            return {...state , ...initState };
        case LogoutPopupConstant.LOGOUT_RE_INIT:
            return initState;
        case LogoutPopupConstant.FORCE_SIGN_OUT:
            return initState;
        default: return state
    }
}