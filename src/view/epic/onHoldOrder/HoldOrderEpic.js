import {Observable} from 'rxjs';
import ActionLogAction from "../../action/ActionLogAction";
import OnHoldOrderService from "../../../service/sales/OnHoldOrderService";
import OnHoldOrderConstant from "../../constant/OnHoldOrderConstant";
import OnHoldOrderAction from "../../action/OnHoldOrderAction";
import QuoteAction from "../../action/checkout/QuoteAction";

/**
 * hold order epic
 * @param action$
 * @return {Observable<any>}
 */
export default function holdOrderEpic(action$) {
    return action$.ofType(OnHoldOrderConstant.HOLD_ORDER)
        .mergeMap(action => Observable.from(OnHoldOrderService.holdOrder(action.quote))
            .mergeMap((response) => {
                return [
                    OnHoldOrderAction.holdOrderResult(response),
                    OnHoldOrderAction.holderOrderAfter(response, action.quote),
                    QuoteAction.removeCart(),
                    ActionLogAction.syncActionLog()
                ];
            }).catch(error => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            })
        );
};
