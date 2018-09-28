import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import SessionConstant from "../../constant/SessionConstant";

const initialState = {sessions: []};

/**
 * receive action from Config Action
 *
 * @param state = {configs: []}
 * @param action
 * @returns {*}
 */
const sessionListReducer = function (state = initialState, action) {
    switch (action.type) {
        case SessionConstant.GET_LIST_SESSION_RESULT:
            return {
                ...state,
                sessions: action.sessions,
                search_criteria: action.search_criteria,
                total_count: action.total_count,
                request_mode: action.request_mode
            };
        case SessionConstant.SYNC_ACTION_UPDATE_DATA_FINISH:
            return {...state, updated_sessions: action.sessions};
        case SessionConstant.SYNC_DELETED_SESSION_FINISH:
            return {...state, deleted_session_ids: action.ids};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default sessionListReducer;