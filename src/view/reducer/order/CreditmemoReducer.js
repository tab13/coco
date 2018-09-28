import CreditmemoConstant from '../../constant/order/CreditmemoConstant';
import LogoutPopupConstant from "../../constant/LogoutPopupConstant";

const initialState = {
    creditmemo: {items: []},
    order_creditmemo_create_account: {},
    error: false,
    response: false
};

/**
 * receive action from Credimemo Action
 *
 * @param state = {configs: []}
 * @param action
 * @returns {*}
 */
const orderReducer = function (state = JSON.parse(JSON.stringify(initialState)), action) {
    switch (action.type) {
        case CreditmemoConstant.SET_CREDITMEMO:
            return {...state, creditmemo: action.creditmemo};
        case CreditmemoConstant.RESET_CREDITMEMO:
            return {...state, creditmemo: {}, error: false, response: false};
        case CreditmemoConstant.CREDITMEMO_CREATE_CUSTOMER_RESULT:
            return {...state, order_creditmemo_create_account: action.order};
        case CreditmemoConstant.CREDITMEMO_PROCESS_SINGLE_PAYMENT_RESULT: {
            const {result, index} = action;
            return {
                ...state,
                response: {...result.response, index},
                error: false
            };
        }
        case CreditmemoConstant.CREDITMEMO_PROCESS_SINGLE_PAYMENT_ERROR: {
            const { result, index } = action;
            return {
                ...state,
                response: false,
                error: { message: result.message, index },
            };
        }
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return JSON.parse(JSON.stringify(initialState));
        default:
            return state
    }
};

export default orderReducer;