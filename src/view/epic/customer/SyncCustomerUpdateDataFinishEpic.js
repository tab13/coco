import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import CustomerAction from "../../action/CustomerAction";

/**
 * Sync customer update data finish epic
 * 
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function SyncCustomerUpdateDataFinishEpic(action$) {
    return action$.ofType(SyncConstant.UPDATE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_CUSTOMER && action.items && action.items.length) {
                return Observable.of(CustomerAction.syncActionUpdateDataFinish(action.items));
            }
            return Observable.empty();
        });
}