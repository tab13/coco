import CustomerListReducer from './customer/CustomerListReducer';
import { combineReducers } from 'redux'

export default combineReducers({
    customerList: CustomerListReducer,
});
