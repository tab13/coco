import {Observable} from 'rxjs';
import CustomerConstant from "../../../constant/CustomerConstant";
import QuoteService from "../../../../service/checkout/QuoteService";
import QuoteAction from "../../../action/checkout/QuoteAction";

/**
 * Receive action type(CREATE_CUSTOMER_SUCCESS) and request
 *
 * @param action$
 * @param store
 * @return {Observable<any>}
 * @constructor
 */
export default function PlaceOrderAfterEpic(action$, store) {
    return action$.ofType(CustomerConstant.CREATE_CUSTOMER_SUCCESS)
        .mergeMap(action => {
                let quote = QuoteService.changeCustomer(store.getState().core.checkout.quote, action.customer);
                quote = QuoteService.collectTotals(quote);
                return Observable.of(QuoteAction.setQuote(quote));
            }
        );
}
