import OrderConstant from '../../../constant/OrderConstant';
import {Observable} from 'rxjs';
import RewardPointService from "../../../../service/reward-point/RewardPointService";

/**
 * Receive action type(PLACE_ORDER_AFTER) and request, response list product
 * @param action$
 */
export default function PlaceOrderAfterEpic(action$) {
    return action$.ofType(OrderConstant.PLACE_ORDER_AFTER)
        .mergeMap(action => {
            // check and remove used reward point
            const order = action.order;
            if (order.customer_id) {
                RewardPointService.removeUsedPoint();
            }
            return Observable.empty()
        });
}
