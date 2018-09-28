import LoadingConstant from '../constant/LoadingConstant';
import LogoutPopupConstant from "../constant/LogoutPopupConstant";

const initialState = {
    count: 0,
    total: 6
};

/**
 * receive action from Loadint Action
 *
 * @param state = initialState
 * @param action
 * @returns {*}
 */
const loadingReducer =  function (state = initialState, action) {
    switch (action.type) {
        case LoadingConstant.INCREASE_COUNT:
            let count = state.count;
            if (count < state.total) {
                count++;
            }
            return {...state, count: count};
        case LoadingConstant.RESET_STATE:
            return initialState;
        case LoadingConstant.CLEAR_DATA_ERROR:
            return state;
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default loadingReducer;
