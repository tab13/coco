import CategoryConstant from '../constant/CategoryConstant';
import LogoutPopupConstant from "../constant/LogoutPopupConstant";

const initialState = {categories: []};

/**
 * receive action from Category Action
 * @param state = {categories: []}
 * @param action
 * @returns {*}
 */
const categoryReducer = function (state = initialState, action) {
    switch (action.type) {
        case CategoryConstant.GET_LIST_CATEGORY_RESULT:
            const {categories} = action;
            return {...state, categories: categories};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default categoryReducer;
