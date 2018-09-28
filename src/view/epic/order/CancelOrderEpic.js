import {Observable} from 'rxjs';
import ActionLogAction from "../../action/ActionLogAction";
import OrderAction from "../../action/OrderAction";
import OrderConstant from "../../constant/OrderConstant";
import OrderService from "../../../service/sales/OrderService";


/**
 * checkout place order epic
 * @param action$
 * @returns {*}
 */
export default function cancel(action$) {
    return action$.ofType(OrderConstant.CANCEL)
        .mergeMap(action => Observable.from(OrderService.cancel(action.order, action.comment, action.notify, action.visibleOnFront))
            .mergeMap((response) => {
                return [
                    OrderAction.cancelResult(response),
                    OrderAction.syncActionUpdateDataFinish([response]),
                    ActionLogAction.syncActionLog()
                ];
            }).catch(error => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            })
        );
};
