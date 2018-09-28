import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import SessionAction from "../../action/SessionAction";

/**
 * Sync order update data finish epic
 * 
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function SyncSessionUpdateDataFinishEpic(action$) {
    return action$.ofType(SyncConstant.UPDATE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_SESSION) {
                return Observable.of(SessionAction.syncActionUpdateDataFinish(action.items));
            }
            return Observable.empty();
        });
}