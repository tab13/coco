import PaymentConstant from "../../constant/PaymentConstant";
import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import TakePaymentConstant from "../../constant/order/TakePaymentConstant";
import OrderConstant from "../../constant/OrderConstant";

const initialState = {
    payments: [],
    paymentPage: TakePaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT,
    payment: {},
    amountPaid: 0,
    error: false,
    response: false
};

/**
 * Receive action from Take Payment Action
 * @param state
 * @param action
 * @returns {*}
 */
const takePaymentReducer = function (state = initialState, action) {
    switch (action.type) {
        case PaymentConstant.GET_LIST_PAYMENT_RESULT:
            return {...initialState, payments: action.payments};
        case TakePaymentConstant.SELECT_PAYMENT:
            return {
                ...state,
                remain: action.remain,
                payment: action.payment,
                paymentPage: TakePaymentConstant.PAYMENT_PAGE_EDIT_PAYMENT
            };
        case TakePaymentConstant.SWITCH_PAGE:
            return {
                ...state,
                paymentPage: action.paymentPage
            };

        case TakePaymentConstant.ADD_PAYMENT:
            return {
                ...state,
                remain: action.remain,
                paymentPage: TakePaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT
            };
        case OrderConstant.TAKE_PAYMENT_PROCESS_SINGLE_PAYMENT_RESULT: {
            const {result, index} = action;
            return {
                ...state,
                response: {...result.response, index},
                error: false
            };
        }
        case OrderConstant.TAKE_PAYMENT_PROCESS_SINGLE_PAYMENT_ERROR: {
            const { result, index } = action;
            return {
                ...state,
                response: false,
                error: { message: result.message, index },
            };
        }
        case TakePaymentConstant.CANCEL_PAYMENT:
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
        case TakePaymentConstant.RESET_STATE:
            return {...initialState};
        default:
            return state;
    }
};

export default takePaymentReducer;