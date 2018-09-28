import ProductConstant from '../../constant/ProductConstant';
import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import StockConstant from "../../constant/StockConstant";

const initialState = {product: null, isShowExternalStock: false, canBack: true};
/**
 * Receive action from Product Action
 *
 * @param state = {products: []}
 * @param action
 * @returns {*}
 */
const searchProductReducer = function (state = initialState, action) {
    switch (action.type) {
        case ProductConstant.VIEW_PRODUCT:
            const {product, isShowExternalStock, canBack} = action;
            return {...state, product: product, isShowExternalStock: isShowExternalStock, canBack: canBack};
        case StockConstant.SHOW_EXTERNAL_STOCK:
            return {...state, isShowExternalStock: true, canBack: action.canBack};
        case StockConstant.CANCEL_EXTERNAL_STOCK:
            return {...state, isShowExternalStock: false};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default searchProductReducer;
