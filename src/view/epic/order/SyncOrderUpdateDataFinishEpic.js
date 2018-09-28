import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import OrderAction from "../../action/OrderAction";
import StatusConstant from "../../constant/order/StatusConstant";

/**
 * Sync order update data finish epic
 * 
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function SyncOrderUpdateDataFinishEpic(action$) {
    return action$.ofType(SyncConstant.UPDATE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_ORDER && action.items && action.items.length) {
                let items = action.items.filter(item => item.state !== StatusConstant.STATE_HOLDED);
                return Observable.of(OrderAction.syncActionUpdateDataFinish(items));
            }
            return Observable.empty();
        });
}