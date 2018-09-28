import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import OnHoldOrderConstant from "../../constant/OnHoldOrderConstant";

const initialState = {orders: []};

/**
 * receive action from Config Action
 *
 * @param state = {configs: []}
 * @param action
 * @returns {*}
 */
const holdOrderListReducer = function (state = initialState, action) {
    switch (action.type) {
        case OnHoldOrderConstant.SEARCH_ORDER_RESULT:
            return {
                ...state,
                orders: action.orders,
                search_criteria: action.search_criteria,
                total_count: action.total_count,
                search_key: action.search_key,
                request_mode: action.request_mode
            };
        case OnHoldOrderConstant.SYNC_ACTION_UPDATE_ON_HOLD_ORDER_FINISH:
            return {...state, updated_orders: action.orders};
        case OnHoldOrderConstant.SYNC_DELETED_HOLD_ORDER_FINISH:
            return {...state, deleted_order_ids: action.ids};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default holdOrderListReducer;