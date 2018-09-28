import ProductConstant from '../../constant/ProductConstant';
import LogoutPopupConstant from "../../constant/LogoutPopupConstant";

const initialState = {products: []};

/**
 * Receive action from Product Action
 *
 * @param state = {products: []}
 * @param action
 * @returns {*}
 */
const productListReducer = function (state = initialState, action) {
    switch (action.type) {
        case ProductConstant.SEARCH_PRODUCT_RESULT:
            const {products, search_criteria, total_count, search_key, request_mode} = action;
            return {...state, products, search_criteria, total_count, search_key, request_mode};
        case ProductConstant.SYNC_ACTION_UPDATE_PRODUCT_DATA_FINISH:
            return {...state, updated_products: action.products};
        case ProductConstant.SYNC_ACTION_UPDATE_STOCK_DATA_FINISH:
            return {...state, updated_stocks: action.stocks};
        case ProductConstant.SYNC_ACTION_UPDATE_CATALOG_RULE_PRICE_DATA_FINISH:
            return {...state, updated_catalogrule_prices: action.catalogrule_prices};
        case ProductConstant.SYNC_ACTION_DELETED_CATALOG_RULE_PRICE_DATA_FINISH:
            return {...state, deleted_catalogrule_prices: action.ids};
        case ProductConstant.RESET_PRODUCT_LIST:
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return {...state, products: []};
        default:
            return state
    }
};

export default productListReducer;
