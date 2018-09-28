import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import UserConstant from "../constant/UserConstant";

const  initialState = {

};
/**
 * receive action from User Action
 *
 * @param state
 * @param action
 * @returns {*}
 */
const userReducer = function (state = initialState, action) {
    let {result} = action;
    let {sharing} = action;

    switch (action.type) {
        case UserConstant.USER_LOGIN_RESULT:
            return { ...state,
                    locations: result.locations,
                    session: result.session,
                    error: result.error,
                    sharing : sharing
            };

        case UserConstant.USER_AFTER_CONTINUE_LOGIN:
            return {...state,
                after_sharing : action.param
            };

        case UserConstant.USER_LOGIN_ERROR:
            return { ...state,
                    error: action.error
            };
        case UserConstant.USER_ASSIGN_POS:
            return {
                ...state,
                loading: true
            };
        case UserConstant.USER_GET_LOGO_SUCCESS:
            let logoUrl = '';
            if(result) {
                logoUrl = result.logoUrl;
            }
            return {
                ...state,
                logoUrl: logoUrl
            };
        case UserConstant.USER_ASSIGN_POS_RESPONSE:
            return {
                ...state,
                error: '',
                assignPos: action.assignPos,
                loading: false
            };
        case UserConstant.USER_ASSIGN_POS_ERROR:
            return {
                ...state,
                assignPos: false,
                error: action.error,
                loading: false
            };
        case UserConstant.USER_CLOSE_POPUP:
            return {
                ...state,
                error: ''
            };
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            if(action.response.code === 901) {
                return state;
            }
            return initialState;
        default:
            return state;
    }
};

export default userReducer;
