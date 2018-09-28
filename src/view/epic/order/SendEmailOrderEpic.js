import {Observable} from 'rxjs';
import ActionLogAction from "../../action/ActionLogAction";
import OrderConstant from "../../constant/OrderConstant";
import OrderService from "../../../service/sales/OrderService";

/**
 * checkout place order epic
 * @param action$
 * @returns {*}
 */
export default function sendEmail(action$) {
    return action$.ofType(OrderConstant.SEND_EMAIL)
        .mergeMap(action => Observable.from(OrderService.sendEmail(action.order, action.email))
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
