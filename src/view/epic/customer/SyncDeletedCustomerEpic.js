import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import CustomerAction from "../../action/CustomerAction";

/**
 * Sync deleted hold order finish epic
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function SyncDeletedCustomerEpic(action$) {
    return action$.ofType(SyncConstant.DELETE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_CUSTOMER && action.ids && action.ids.length) {
                return Observable.of(CustomerAction.syncDeletedCustomerFinish(action.ids));
            }
            return Observable.empty();
        });
}