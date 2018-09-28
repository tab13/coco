import SyncConstant from '../../constant/SyncConstant';
import {Observable} from 'rxjs';
import OnHoldOrderAction from "../../action/OnHoldOrderAction";
import StatusConstant from "../../constant/order/StatusConstant";

export default function SyncHoldOrderUpdateDataFinishEpic(action$) {
    return action$.ofType(SyncConstant.UPDATE_DATA_FINISH)
        .mergeMap(action => {
            if (action.data.type === SyncConstant.TYPE_ORDER && action.items && action.items.length) {
                let items = action.items.filter(item => item.state === StatusConstant.STATE_HOLDED);
                return Observable.of(OnHoldOrderAction.syncActionUpdateOnHoldOrderFinish(items));
            }
            return Observable.empty();
        });
}