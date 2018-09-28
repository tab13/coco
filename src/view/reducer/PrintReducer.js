import * as PrintConstant from "../constant/PrintConstant";
import OrderConstant from "../constant/OrderConstant";
import SessionConstant from "../constant/SessionConstant";


/**
 *  initial State for reducer
 *
 * @type {{isOpen: boolean}}
 */
const initState = {
};

/**
 * receive action from Checkout Action
 * 
 * @param state
 * @param action
 * @returns {*}
 */
export default function PrintReducer(state = initState, action) {
    switch (action.type) {
        case OrderConstant.PLACE_ORDER_AFTER:
            return {...state, orderData: action.order, isReprint: false, quote: action.quote};
        case PrintConstant.FINISH_PRINT:
            return {...state, orderData: null, isReprint: false, quote: null, reportData: null, creditBalance: null, pointBalance: null, creditmemo: null};
        case OrderConstant.REPRINT_ORDER:
            return {
                ...state,
                orderData: action.order,
                isReprint: true,
                creditBalance: action.credit_balance,
                pointBalance: action.point_balance
            };
        case  OrderConstant.PRINT_CREDITMEMO:
            return {
                ...state,
                creditmemo: action.creditmemo,
                creditBalance: action.credit_balance,
                pointBalance: action.point_balance};
        case  SessionConstant.PRINT_REPORT:
            return {
                ...state,
                reportData: action.currentSession};
        default: return state
    }
}