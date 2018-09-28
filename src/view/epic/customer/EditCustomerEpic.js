import {Observable} from 'rxjs';
import CustomerConstant from "../../constant/CustomerConstant";
import CustomerService from "../../../service/customer/CustomerService";
import CustomerAction from "../../action/CustomerAction";
import ActionLogAction from "../../action/ActionLogAction";

/**
 * Edit customer epic
 * 
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
export default function EditCustomerEpic(action$) {
    return action$.ofType(CustomerConstant.EDIT_CUSTOMER)
        .mergeMap(action => Observable.from(
            CustomerService.editCustomer(action.customer)
            ).mergeMap(response => {
                return [
                    CustomerAction.saveCustomer([response]),
                    CustomerAction.syncActionUpdateDataFinish([response]),
                    ActionLogAction.syncActionLog()
                ]
            }).catch(error => Observable.of(CustomerAction.editCustomerError(error)))
        );
}