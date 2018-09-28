import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import OrderAction from "../../action/OrderAction";

/**
 * Sync deleted order finish epic
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function SyncDeletedHoldOrderFinishEpic(action$) {
    return action$.ofType(SyncConstant.DELETE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_ORDER && action.ids && action.ids.length) {
                return Observable.of(OrderAction.syncDeletedOrderFinish(action.ids));
            }
            return Observable.empty();
        });
}