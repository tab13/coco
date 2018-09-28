import QuoteService from '../../../../service/checkout/QuoteService';
import CheckoutConstant from "../../../constant/CheckoutConstant";
import QuoteAction from '../../../action/checkout/QuoteAction';
import {Observable} from 'rxjs';

/**
 *
 * @param action$
 * @return {Observable<any>}
 */
export default function CheckoutToCatalogEpic(action$, store) {
    return action$.ofType(CheckoutConstant.CHECKOUT_TO_CATALOG)
        .mergeMap(() => {
                try {
                    let quote = QuoteService.collectTotals({
                        ...store.getState().core.checkout.quote, valid_salesrule: null, coupon_code: null
                    });
                    return Observable.of(QuoteAction.setQuote(quote));
                } catch (e) {
                    return Observable.empty();
                }
            }
        );
}
