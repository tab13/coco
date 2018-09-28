import PaymentConstant from "../../constant/PaymentConstant";
import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import CheckoutConstant from "../../constant/CheckoutConstant";
import QuoteConstant from "../../constant/checkout/QuoteConstant";

const initialState = {
    payments: [],
    paymentPage: PaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT,
    payment: {},
    amountPaid: 0,
    customer_id: null,
    isUpdate: false
};

/**
 * Receive action from Payment Action
 * @param state
 * @param action
 * @returns {*}
 */
const paymentReducer =  function (state = initialState, action) {
    switch (action.type) {
        case PaymentConstant.GET_LIST_PAYMENT_RESULT:
            return {...state, payments: action.payments};
        case PaymentConstant.SELECT_PAYMENT:
            return {
                ...state,
                remain: action.remain,
                payment: action.payment,
                paymentPage: PaymentConstant.PAYMENT_PAGE_EDIT_PAYMENT,
            };
        case PaymentConstant.CANCEL_PAYMENT:
            return {
                ...state,
                payment: '',
                paymentPage: PaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT
            };
        case PaymentConstant.SWITCH_PAGE:
            return {
                ...state,
                paymentPage: action.paymentPage
            };
        case CheckoutConstant.CHECKOUT_TO_SELECT_PAYMENTS: {
            let {quote} = action;
            let {payments} = quote;

            if (!quote.grand_total) {
                return {
                    ...state,
                    paymentPage: PaymentConstant.PAYMENT_PAGE_COMPLETE_ORDER,
                    customer_id: quote.customer_id
                };
            }

            if (action.initPayments || payments.length <= 0) {
                return {...initialState, payments: []};
            }
            let store_credit = payments.find((payment) => payment.code === PaymentConstant.STORE_CREDIT);
            if (
                state.paymentPage === PaymentConstant.PAYMENT_PAGE_EDIT_PAYMENT &&
                state.payment.code === PaymentConstant.STORE_CREDIT &&
                !store_credit &&
                state.customer_id &&
                state.customer_id !== quote.customer_id
            ) {
                return {
                    ...state,
                    paymentPage: PaymentConstant.PAYMENT_PAGE_COMPLETE_ORDER,
                    customer_id: quote.customer_id
                };
            }
            return {...state, customer_id: quote.customer_id};
        }
        case QuoteConstant.REMOVE_CART:
            return initialState;
        case CheckoutConstant.CHECK_OUT_PLACE_ORDER_RESULT:
            return initialState;
        case PaymentConstant.RESET_STATE:
            return initialState;
        case PaymentConstant.ADD_PAYMENT:
            return {
                ...state,
                remain: action.remain,
                paymentPage: PaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT
            };
        case PaymentConstant.UPDATE_STORE_CREDIT_WHEN_CHANGE_SHIPPING_METHOD:
            let payments_update_shipping = action.quote.payments;
            if (payments_update_shipping.length <= 0) {
                return {...state, paymentPage: PaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT};
            }
            let store_credit_update_shipping = payments_update_shipping.find(
                (payment) => payment.code === PaymentConstant.STORE_CREDIT);
            if (state.paymentPage === PaymentConstant.PAYMENT_PAGE_EDIT_PAYMENT &&
                state.payment.code === PaymentConstant.STORE_CREDIT &&
                !store_credit_update_shipping)
            {
                return {
                    ...state,
                    paymentPage: PaymentConstant.PAYMENT_PAGE_COMPLETE_ORDER
                }
            }
            return state;
        case PaymentConstant.UPDATE_PAYMENT_LIST:
            if (action.payments) {
                return {...state, isUpdate: action.isUpdate, payments: action.payments};
            }
            return {...state, isUpdate: action.isUpdate};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state;
    }
};

export default paymentReducer;