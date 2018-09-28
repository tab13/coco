import QuoteConstant from '../../../constant/checkout/QuoteConstant';
import {Observable} from "rxjs/Rx";
import QuoteService from "../../../../service/checkout/QuoteService";
import QuoteAction from "../../../action/checkout/QuoteAction";

/**
 *
 * @param action$
 * @return {Observable<any>}
 */
export default function validateQuoteSalesRule(action$) {
    return action$.ofType(QuoteConstant.VALIDATE_QUOTE_SALES_RULE)
        .mergeMap(action => {
            let quote = action.quote;
            return Observable.fromPromise(
                QuoteService.submitCouponCode(quote, quote.coupon_code || "")
            ).pipe(response => {
                return Observable.fromPromise(response.toPromise())
                    .mergeMap(rules => {
                        quote.valid_salesrule = rules;
                        quote = QuoteService.collectTotals(quote);
                        return Observable.of(QuoteAction.setQuote(quote));
                    }).catch(error => {
                        console.log(error);
                        quote.coupon_code = null;
                        return Observable.fromPromise(
                            QuoteService.submitCouponCode(quote, quote.coupon_code || "")
                        ).pipe(response => {
                            return Observable.fromPromise(response.toPromise())
                                .mergeMap(rules => {
                                    quote.valid_salesrule = rules;
                                    quote = QuoteService.collectTotals(quote);
                                    return Observable.of(QuoteAction.setQuote(quote));
                                }).catch((error) => {
                                    console.log(error);
                                    quote.valid_salesrule = [];
                                    quote = QuoteService.collectTotals(quote);
                                    return Observable.of(QuoteAction.setQuote(quote));
                                });
                        });
                    });
            });
        }).catch((error) => {
            console.log(error);
            return Observable.empty();
        });
}
