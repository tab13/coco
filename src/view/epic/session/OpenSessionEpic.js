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
export default function openSession(action$) {
    return action$.ofType(SessionConstant.REQUEST_OPEN_SESSION)
        .mergeMap(action => Observable.from(SessionService.openSession(action.opening_amount))
            .mergeMap((response) => {
                return [
                    SessionAction.syncActionUpdateDataFinish([response]),
                    ActionLogAction.syncActionLog(),
                    SessionAction.setCurrentSession(response)
                ];
            }).catch(error => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            })
        );
}