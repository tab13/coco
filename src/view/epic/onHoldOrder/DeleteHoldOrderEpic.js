import {Observable} from 'rxjs';
import ActionLogAction from "../../action/ActionLogAction";
import OnHoldOrderService from "../../../service/sales/OnHoldOrderService";
import OnHoldOrderConstant from "../../constant/OnHoldOrderConstant";

/**
 * hold order epic
 * @param action$
 * @return {Observable<any>}
 */
export default function deleteHoldOrderEpic(action$) {
    return action$.ofType(OnHoldOrderConstant.DELETE_ON_HOLD_ORDER)
        .mergeMap(action => Observable.from(OnHoldOrderService.deleteOrder(action.order))
            .mergeMap((response) => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            }).catch(error => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            })
        );
};
