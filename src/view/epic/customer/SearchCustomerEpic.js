import CustomerConstant from '../../constant/CustomerConstant';
import CustomerAction from '../../action/CustomerAction';
import {Observable} from 'rxjs';
import CustomerService from "../../../service/customer/CustomerService";

/**
 * Receive action type(SEARCH_CUSTOMER) and request, response list customer
 * @param action$
 */
export default function SearchProductEpic(action$) {
    return action$.ofType(CustomerConstant.SEARCH_CUSTOMER)
        .mergeMap(action => Observable.from(
            CustomerService.getList(action.queryService)
            ).map(response => {
                return CustomerAction.searchCustomerResult(
                    response.items,
                    response.search_criteria,
                    response.total_count,
                    action.search_key
                )
            }).catch(() => Observable.of(CustomerAction.searchCustomerResult([])))
        );
}
