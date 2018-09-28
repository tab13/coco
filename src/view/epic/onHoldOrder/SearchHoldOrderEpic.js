import {Observable} from 'rxjs';
import Config from "../../../config/Config";
import OnHoldOrderConstant from "../../constant/OnHoldOrderConstant";
import OnHoldOrderAction from "../../action/OnHoldOrderAction";
import OrderService from "../../../service/sales/OrderService";

/**
 * search hold order epic
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default function searchHoldOrderEpic(action$) {
    return action$.ofType(OnHoldOrderConstant.SEARCH_ORDER)
        .mergeMap(action => {
            let requestMode = Config.mode;
            return Observable.from(
                    OrderService.getList(action.queryService)
                ).map(response => {
                    return OnHoldOrderAction.searchOrderResult(
                        response.items,
                        response.search_criteria,
                        response.total_count,
                        action.search_key,
                        requestMode
                    )
                }).catch(error => Observable.of(OnHoldOrderAction.searchOrderResult([])))
            }
        );
}