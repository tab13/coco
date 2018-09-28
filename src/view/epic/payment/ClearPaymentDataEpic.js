import PaymentConstant from '../../constant/PaymentConstant';
import {Observable} from 'rxjs';
import PaymentService from "../../../service/payment/PaymentService";

/**
 * Get payment list 
 * 
 * @param action$
 * @returns {Observable<any>}
 */
export default function clearPaymentDataEpic(action$) {
    return action$.ofType(PaymentConstant.CLEAR_DATA)
        .mergeMap(() => Observable.from(PaymentService.clear())
            .mergeMap(() => {
                return Observable.empty();
            }).catch(error => {
                return Observable.empty();
            })
        );
}