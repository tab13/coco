import ShippingConstant from '../../constant/ShippingConstant';
import LoadingAction from "../../action/LoadingAction";
import {Observable} from 'rxjs';
import ShippingService from "../../../service/shipping/ShippingService";
import SyncService from "../../../service/sync/SyncService";
import Config from "../../../config/Config";

/**
 * Get shipping online epic
 *
 * @param action$
 * @returns {function(*): *}
 */
export default function getShippingOnline(action$) {
    return action$.ofType(ShippingConstant.GET_SHIPPING_ONLINE)
        .mergeMap(() => Observable.from(SyncService.getShipping())
            .mergeMap((response) => {
                ShippingService.saveToDb(response.items);
                Config.shipping_methods = response.items;
                return [
                    LoadingAction.increaseCount(),
                    // ShippingAction.getShippingOnlineResult(response.items)
                ];
            }).catch(error => {
                return Observable.empty();
            })
        );
}