import CustomerConstant from '../../constant/CustomerConstant';
import LogoutPopupConstant from "../../constant/LogoutPopupConstant";
import CustomerListService from "../../../service/customer/CustomerListService";
import CheckoutConstant from "../../constant/CheckoutConstant";

const initialState = {customers: [], search_key: '', order_id: null};

/**
 * Receive action from Customer Action
 *
 * @param state = {customers: []}
 * @param {object} action
 * @returns {*}
 */
const customerListReducer = function (state = initialState, action) {
    switch (action.type) {
        case CustomerConstant.SEARCH_CUSTOMER_RESULT: {
            const {customers, search_criteria, total_count, search_key} = action;
            let customersList = [];
            if (search_key !== state.search_key && search_criteria.current_page !== 1) {
                return state;
            }
            if (search_criteria.current_page === 1) {
                customersList = customers;
            } else {
                customersList = CustomerListService.addCustomerToList(state.customers, customers);
            }
            return {
                ...state, customers: customersList, search_criteria: search_criteria,
                total_count: total_count, search_key: search_key
            };
        }
        case CustomerConstant.CREATE_CUSTOMER_SUCCESS: {
            let customerListAfterCreate = CustomerListService.updateCustomerList(state.customers, [action.customer]);
            return {...state, customers: customerListAfterCreate};
        }
        case CustomerConstant.SAVE_CUSTOMER: {
            let customerListAfterSave = CustomerListService.updateCustomerList(state.customers, action.customers);
            return {...state, customers: customerListAfterSave};
        }
        case CustomerConstant.SYNC_ACTION_UPDATE_DATA_FINISH:
            return {...state, updated_customers: action.items};
        case CustomerConstant.SYNC_DELETED_CUSTOMER_FINISH:
            return {...state, deleted_customer_ids: action.ids};
        case CheckoutConstant.CHECK_OUT_PLACE_ORDER_RESULT:
            return {...state, order_id: action.order.increment_id, customers: [], search_key: ''};
        case CustomerConstant.RESET_CUSTOMER_LIST:
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return {...state, customers: []};
        default:
            return state
    }
};

export default customerListReducer;
