import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import OrderConstant from "../../constant/OrderConstant";

const initialState = {orders: []};

/**
 * receive action from Config Action
 *
 * @param state = {configs: []}
 * @param action
 * @returns {*}
 */
const orderListReducer = function (state = initialState, action) {
    switch (action.type) {
        case OrderConstant.SEARCH_ORDER_RESULT:
            return {
                ...state,
                orders: action.orders,
                search_criteria: action.search_criteria,
                total_count: action.total_count,
                search_key: action.search_key,
                searchAllTime: action.searchAllTime,
                request_mode: action.request_mode
            };
        case OrderConstant.SYNC_ACTION_UPDATE_DATA_FINISH:
            return {...state, updated_orders: action.orders};
        case OrderConstant.SYNC_DELETED_ORDER_FINISH:
            return {...state, deleted_order_ids: action.ids};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default orderListReducer;