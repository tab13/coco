import {Observable} from 'rxjs';
import CheckoutConstant from "../../constant/CheckoutConstant";
import CheckoutService from "../../../service/checkout/CheckoutService";
import CheckoutAction from "../../action/CheckoutAction";
import ActionLogAction from "../../action/ActionLogAction";
import OrderAction from "../../action/OrderAction";

/**
 * checkout place order epic
 * @param action$
 * @returns {*}
 */
export default function placeOrder(action$) {
    return action$.ofType(CheckoutConstant.CHECK_OUT_PLACE_ORDER)
        .mergeMap(action => Observable.from(CheckoutService.placeOrder(action.quote, action.additionalData))
            .mergeMap((response) => {
                return [
                    CheckoutAction.placeOrderResult(response),
                    OrderAction.placeOrderAfter(response, action.quote),
                    ActionLogAction.syncActionLog()
                ];
            }).catch(error => {
                return [
                    CheckoutAction.placeOrderError(error),
                    ActionLogAction.syncActionLog()
                ];
            })
        );
};
