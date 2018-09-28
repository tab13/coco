import {Observable} from 'rxjs';
import OrderConstant from "../../constant/OrderConstant";
import OrderService from "../../../service/sales/OrderService";
import OrderAction from "../../action/OrderAction";
import Config from "../../../config/Config";

/**
 * search order epic
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default function searchOrderEpic(action$) {
    return action$.ofType(OrderConstant.SEARCH_ORDER)
        .mergeMap(action => {
            let requestMode = Config.mode;
            return Observable.from(
                    OrderService.getListOrder(action.queryService, action.searchAllTime)
                ).map(response => {
                    return OrderAction.searchOrderResult(
                        response.items,
                        response.search_criteria,
                        response.total_count,
                        action.search_key,
                        action.searchAllTime,
                        requestMode
                    )
                }).catch(error => Observable.of(OrderAction.searchOrderResult([])))
            }
        );
}