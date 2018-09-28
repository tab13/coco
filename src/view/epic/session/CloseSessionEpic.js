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
export default function closeSession(action$) {
    return action$.ofType(SessionConstant.REQUEST_CLOSE_SESSION)
        .mergeMap(action => Observable.from(SessionService.closeSession(action.session, action.note))
            .mergeMap((response) => {
                return [
                    SessionAction.setCurrentSession(response, true),
                    SessionAction.syncActionUpdateDataFinish([response]),
                    ActionLogAction.syncActionLog(),
                ];
            }).catch(error => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            })
        );
}