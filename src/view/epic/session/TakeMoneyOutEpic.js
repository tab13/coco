import {Observable} from 'rxjs';
import ActionLogAction from "../../action/ActionLogAction";
import SessionService from "../../../service/session/SessionService";
import SessionConstant from "../../constant/SessionConstant";
import SessionAction from "../../action/SessionAction";

/**
 * open session epic
 * @param action$
 * @returns {*}
 */
export default function takeMoneyOut(action$) {
    return action$.ofType(SessionConstant.REQUEST_TAKE_MONEY_OUT)
        .mergeMap(action => Observable.from(SessionService.addOrRemoveTransaction(action.amount, action.note, false))
            .mergeMap((response) => {
                return [
                    SessionAction.syncActionUpdateDataFinish([response]),
                    ActionLogAction.syncActionLog()
                ];
            }).catch(error => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            })
        );
}