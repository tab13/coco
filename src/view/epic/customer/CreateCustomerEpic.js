import {Observable} from 'rxjs';
import CustomerConstant from "../../constant/CustomerConstant";
import CustomerService from "../../../service/customer/CustomerService";
import CustomerAction from "../../action/CustomerAction";
import ActionLogAction from "../../action/ActionLogAction";

/**
 * Create customer epic
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function CreateCustomerEpic(action$) {
    return action$.ofType(CustomerConstant.CREATE_CUSTOMER)
        .mergeMap(action => Observable.from(
            CustomerService.createCustomer(action.customer)
            ).mergeMap(response => {
                return [
                    CustomerAction.createCustomerSuccess(response),
                    CustomerAction.syncActionUpdateDataFinish([response]),
                    ActionLogAction.syncActionLog()
                ]
            }).catch(error => Observable.of(CustomerAction.createCustomerError(error)))
        );
}