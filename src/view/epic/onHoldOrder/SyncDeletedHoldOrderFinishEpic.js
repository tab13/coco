import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import OnHoldOrderAction from "../../action/OnHoldOrderAction";

/**
 * Sync deleted hold order finish epic
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function SyncDeletedHoldOrderFinishEpic(action$) {
    return action$.ofType(SyncConstant.DELETE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_ORDER && action.ids && action.ids.length) {
                return Observable.of(OnHoldOrderAction.syncDeletedHoldOrderFinish(action.ids));
            }
            return Observable.empty();
        });
}