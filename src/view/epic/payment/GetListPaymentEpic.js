import PaymentAction from "../../action/PaymentAction";
import PaymentConstant from '../../constant/PaymentConstant';
import {Observable} from 'rxjs';
import PaymentService from "../../../service/payment/PaymentService";

/**
 * Get payment list 
 * 
 * @param action$
 * @returns {Observable<any>}
 */
export default function getListPayment(action$) {
    return action$.ofType(PaymentConstant.GET_LIST_PAYMENT)
        .mergeMap(() => Observable.from(PaymentService.getAll())
            .mergeMap((response) => {
                return Observable.of(PaymentAction.getListPaymentResult(response));
            }).catch(error => {
                return Observable.empty();
            })
        );
}