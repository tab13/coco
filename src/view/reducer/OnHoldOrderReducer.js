import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import { combineReducers } from 'redux';
import holdOrderList from "./onHoldOrder/HoldOrderListReducer";
import OnHoldOrderConstant from "../constant/OnHoldOrderConstant";
import {toast} from "react-toastify";
import i18n from "../../config/i18n";

const initialState = {};

const index = function (state = initialState, action) {
    switch (action.type) {
        case OnHoldOrderConstant.HOLD_ORDER_RESULT:
            toast.success(
                i18n.translator.translate(
                    'Order #{{id}} has been held successfully!',
                    {id: action.order.increment_id}
                ),
                {
                    position: toast.POSITION.BOTTOM_CENTER,
                    className: 'wrapper-messages messages-success'
                }
            );
            return {state};
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state
    }
};

export default combineReducers({
    index,
    holdOrderList
});