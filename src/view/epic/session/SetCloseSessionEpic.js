import {Observable} from 'rxjs';
import SessionService from "../../../service/session/SessionService";
import SessionConstant from "../../constant/SessionConstant";
import SessionAction from "../../action/SessionAction";

/**
 * set close session epic
 * @param action$
 * @returns {*}
 */
export default function setCloseSession(action$) {
    return action$.ofType(SessionConstant.REQUEST_SET_CLOSE_SESSION)
        .mergeMap(action => Observable.from(SessionService.setCloseSession(action.closing_amount, action.denominations))
            .mergeMap((response) => {
                return Observable.of(SessionAction.syncActionUpdateDataFinish([response]));
            }).catch(error => {
                return Observable.empty();
            })
        );
}