import ProductConstant from '../constant/ProductConstant';
import ProductListReducer from './product/ProductListReducer';
import ViewProductReducer from './product/ViewProductReducer';
import { combineReducers } from 'redux'
import LogoutPopupConstant from "../constant/LogoutPopupConstant";

const initialState = {products: []};

/**
 * receive action from Product Action
 *
 * @param state = {products: []}
 * @param action
 * @returns {*}
 */
const productReducer = function (state = initialState, action) {
    switch (action.type) {
        case ProductConstant.GET_LIST_PRODUCT_RESULT:
            const {products} = action;
            return {...state, products: products};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default combineReducers({
    productReducer,
    productList: ProductListReducer,
    viewProduct: ViewProductReducer
});
