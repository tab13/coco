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
    return action$.ofType(CustomerConstant.SAVE_CUSTOMER)
        .mergeMap(action => {
                let quote = store.getState().core.checkout.quote;
                let customers = action.customers;
                if (quote.customer && quote.customer.id) {
                    let customer = customers.find(customer => customer.email === quote.customer.email);
                    if (customer && customer.email) {
                        quote = QuoteService.changeCustomer(quote, customer);
                        quote = QuoteService.collectTotals(quote);
                        return Observable.of(QuoteAction.setQuote(quote));
                    }
                }
                return Observable.empty();
            }
        );
}
