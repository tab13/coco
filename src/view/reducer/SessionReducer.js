import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import { combineReducers } from 'redux';
import sessionList from "./session/SessionListReducer";
import SessionConstant from "../constant/SessionConstant";

const initialState = {
    currentSession: null,
    redirectToManageSession: false,
    isCloseSession: false
};

const index = function (state = initialState, action) {
    switch (action.type) {
        case SessionConstant.SET_CURRENT_SESSION:
            return {...state, currentSession: action.session, isCloseSession: action.isCloseSession};
        case SessionConstant.REDIRECT_TO_MANAGE_SESSION:
            return {...state, redirectToManageSession: true};
        case SessionConstant.REDIRECT_TO_MANAGE_SESSION_SUCCESS:
            return {...state, redirectToManageSession: false};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default combineReducers({
    index,
    sessionList
});