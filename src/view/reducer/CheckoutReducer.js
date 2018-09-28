import { combineReducers } from 'redux';
import quote from './checkout/QuoteReducer';
import payment from './checkout/PaymentReducer';
import shipping from './checkout/ShippingReducer'
import completeOrder from './checkout/CompleteOrderReducer';
import CheckoutConstant from "../constant/CheckoutConstant";
import {toast} from "react-toastify";
import i18n from "../../config/i18n";
import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import ProductList from "../component/catalog/ProductList";
import SpendRewardPoint from "../component/checkout/SpendRewardPoint";
import Payment from "../component/checkout/Payment";
import QuoteConstant from "../constant/checkout/QuoteConstant";
import GiftcardForm from "../component/checkout/cart/totals/GiftcardForm";

const initialState = {
    pages: [ProductList, Payment, SpendRewardPoint, GiftcardForm],
    currentPage : ProductList.className,
};

const initialStateProductAddQuote = {
    added_item_id: null
};

/**
 * receive action from Checkout Action
 * @param state
 * @param action
 * @return {{pages: *[], currentPage}}
 */
function index(state = initialState, action) {
    switch (action.type) {
        case CheckoutConstant.CHECKOUT_TO_SELECT_PAYMENTS:
            return { ...state,  currentPage: Payment.className};
        case CheckoutConstant.CHECKOUT_TO_SPEND_REWARD_POINT:
            return { ...state,  currentPage: SpendRewardPoint.className};
        case CheckoutConstant.CHECKOUT_TO_APPLY_GIFT_CARD:
            return {...state, currentPage: GiftcardForm.className}
        case CheckoutConstant.CHECKOUT_TO_CATALOG:
            return { ...state,  currentPage: ProductList.className};
        case CheckoutConstant.CHECKOUT_SWITCH_PAGE:
            return { ...state,  currentPage: action.page};
        case CheckoutConstant.CHECK_OUT_PLACE_ORDER_RESULT:
            toast.success(
                i18n.translator.translate(
                    'Order #{{id}} has been created successfully!',
                    {id: action.order.increment_id}
                ),
                {
                    position: toast.POSITION.BOTTOM_CENTER,
                    className: 'wrapper-messages messages-success'
                }
            );
            return {
                ...state,
                currentPage: ProductList.className
            };
        case CheckoutConstant.CHECK_OUT_PLACE_ORDER_ERROR:
            toast.error(
                i18n.translator.translate(i18n.translator.translate("Place order failed!")),
                {
                    className: 'wrapper-messages messages-warning'
                }
            );
            return {
                ...state
            };

        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
}

/**
 * receive action from Quote Action
 * @param state
 * @param action
 * @returns {*}
 */
function addedItemIdInQuote(state = initialStateProductAddQuote, action) {
    switch (action.type) {
        case QuoteConstant.PRODUCT_ADD_QUOTE:
            return {...state, added_item_id: action.added_item_id};
        default:
            return state
    }
}

export default combineReducers({
    index,
    addedItemIdInQuote,
    quote,
    payment,
    shipping,
    completeOrder
});
