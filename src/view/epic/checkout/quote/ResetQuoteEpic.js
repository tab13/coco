import QuoteConstant from '../../../constant/checkout/QuoteConstant';
import QuoteService from '../../../../service/checkout/QuoteService';
import CheckoutConstant from "../../../constant/CheckoutConstant";
import QuoteAction from '../../../action/checkout/QuoteAction';
import {Observable} from 'rxjs';

/**
 *
 * @param action$
 * @return {Observable<any>}
 */
export default function resetQuoteEpic(action$) {
    return action$.ofType(CheckoutConstant.CHECK_OUT_PLACE_ORDER_RESULT, QuoteConstant.REMOVE_CART)
        .mergeMap(() => {
                try {
                    let quote = QuoteService.resetQuote();
                    console.log(JSON.parse(JSON.stringify(quote)));
                    return Observable.of(QuoteAction.setQuote(quote));
                } catch (e) {
                    return Observable.empty();
                }
            }
        );
}
