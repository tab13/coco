import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import SessionAction from "../../action/SessionAction";

/**
 * Sync deleted session finish epic
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function SyncDeletedHoldOrderFinishEpic(action$) {
    return action$.ofType(SyncConstant.DELETE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_SESSION && action.ids && action.ids.length) {
                return Observable.of(SessionAction.syncDeletedSessionFinish(action.ids));
            }
            return Observable.empty();
        });
}