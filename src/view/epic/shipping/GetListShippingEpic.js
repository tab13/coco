import ShippingConstant from "../../constant/ShippingConstant";
import ShippingService from "../../../service/shipping/ShippingService";
import Config from "../../../config/Config";
import {Observable} from 'rxjs';

/**
 * Get shipping list
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default function getListShipping(action$) {
    return action$.ofType(ShippingConstant.GET_LIST_SHIPPING)
        .mergeMap(() => Observable.from(ShippingService.getAll())
            .mergeMap((response) => {
                Config.shipping_methods = response;
                return Observable.empty();
            }).catch(error => {
                return Observable.empty();
            })
        );
}