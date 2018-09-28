import LoadingAction from "../../action/LoadingAction";
import {Observable} from 'rxjs';
import Config from "../../../config/Config";
import OrderConstant from "../../constant/OrderConstant";
import OrderService from "../../../service/sales/OrderService";

/**
 * Receive action type(GET_LIST_ORDER_STATUSES) and request, response data statuses
 * @param action$
 */
export default action$ => action$.ofType(OrderConstant.GET_LIST_ORDER_STATUSES)
    .mergeMap(action => Observable.from(OrderService.getListOrderStatuses())
        .mergeMap((response) => {
            OrderService.saveOrderStatus(response.items);
            Config.orderStatus = response.items;

            return [
                LoadingAction.increaseCount()
            ];
        }).catch(error => {
            return Observable.empty();
        })
    );
