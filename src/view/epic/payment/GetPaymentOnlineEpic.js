import PaymentConstant from '../../constant/PaymentConstant';
import LoadingAction from "../../action/LoadingAction";
import {Observable} from 'rxjs';
import PaymentService from "../../../service/payment/PaymentService";
import SyncService from "../../../service/sync/SyncService";

/**
 * Get payment online epic
 * 
 * @param action$
 * @returns {function(*): *}
 */
export default function getPaymentOnline(action$) {
    return action$.ofType(PaymentConstant.GET_PAYMENT_ONLINE)
        .mergeMap(() => Observable.from(SyncService.getPayment())
            .mergeMap((response) => {
                PaymentService.saveToDb(response.items);
                return [
                    LoadingAction.increaseCount()
                ];
            }).catch(error => {
                return Observable.empty();
            })
        );
}