import {Observable} from 'rxjs';
import CreditmemoConstant from "../../constant/order/CreditmemoConstant";
import ActionLogAction from "../../action/ActionLogAction";
import CreditmemoSuccessService from "../../../service/sales/order/creditmemo/CreditmemoSuccessService";
import OrderAction from "../../action/OrderAction";
import CreditmemoAction from "../../action/order/CreditmemoAction";

export default function creditmemoCreateCustomer(action$) {
    return action$.ofType(CreditmemoConstant.CREDITMEMO_CREATE_CUSTOMER)
        .mergeMap(action => Observable.from(
                CreditmemoSuccessService.creditmemoCreateCustomer(action.order, action.email, action.isNewAccount)
            )
                .mergeMap((response) => {
                    return [
                        CreditmemoAction.creditmemoCreateCustomerResult(response),
                        ActionLogAction.syncActionLog(),
                        OrderAction.syncActionUpdateDataFinish([response])
                    ];
                }).catch(error => {
                    return Observable.empty();
                })
        );
}