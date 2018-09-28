import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import { combineReducers } from 'redux';
import orderList from "./order/OrderListReducer";
import takePayment from "./order/TakePaymentReducer";
import creditmemo from "./order/CreditmemoReducer";
import OrderConstant from "../constant/OrderConstant";
import {toast} from "react-toastify";
import i18n from "../../config/i18n";

const initialState = {};

/**
 * receive action from Config Action
 *
 * @param state = {configs: []}
 * @param action
 * @returns {*}
 */
const index = function (state = initialState, action) {
    switch (action.type) {
        case OrderConstant.TAKE_PAYMENT_RESULT:
            let message = 'Payment has been received successfully';
            if (action.createInvoice) {
                message = 'Payment has been received and Invoice is created successfully';
            }
            toast.success(
                i18n.translator.translate(message),
                {
                    position: toast.POSITION.BOTTOM_CENTER,
                    className: 'wrapper-messages messages-success'
                }
            );
            return state;
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default combineReducers({
    index,
    orderList,
    takePayment,
    creditmemo
});