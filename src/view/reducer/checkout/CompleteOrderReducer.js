import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import CheckoutConstant from "../../constant/CheckoutConstant";
import PaymentConstant from "../../../view/constant/PaymentConstant";

const initialState = {
    error: false,
    response: false,
    additionalData: false,
};

/**
 * Receive action from Checkout Action
 * @param state
 * @param action
 * @returns {{}}
 */
const completeOrderReducer = function (state = initialState, action) {
    switch (action.type) {
        case CheckoutConstant.CHECKOUT_TO_SELECT_PAYMENTS: {
            if(action.initPayments) {
                return {...initialState};
            }
            return state;
        }
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return {...initialState};
        case CheckoutConstant.CHECKOUT_PROCESS_SINGLE_PAYMENT_RESULT:{
            const { result } = action;
            return {
                ...state,
                response: result.response,
                additionalData: result.response && result.response.additionalData,
                error: false
            };
        }
        case CheckoutConstant.CHECKOUT_PROCESS_SINGLE_PAYMENT_ERROR: {
            const {result} = action;
            return {
                ...state,
                response: false,
                error: result.message,
            };
        }

        case PaymentConstant.PAYMENTS_STATUS_TO_PENDING: {
            return {...state, error: false};
        }
        default:
            return state;
    }
};

export default completeOrderReducer;