import QuoteConstant from '../../../constant/checkout/QuoteConstant';
import {Observable} from "rxjs/Rx";
import QuoteService from "../../../../service/checkout/QuoteService";
import QuoteAction from "../../../action/checkout/QuoteAction";
import CouponTypeConstant from "../../../constant/salesrule/CouponTypeConstant";

/**
 *
 * @param action$
 * @return {Observable<any>}
 */
export default function removeCouponCode(action$) {
    return action$.ofType(QuoteConstant.REMOVE_COUPON_CODE)
        .mergeMap(action => {
            let quote = action.quote;
            quote.coupon_code = null;
            if (quote.valid_salesrule && quote.valid_salesrule.length) {
                quote.valid_salesrule = quote.valid_salesrule.filter(
                    rule => rule.coupon_type === CouponTypeConstant.COUPON_TYPE_NO_COUPON
                );
                QuoteService.collectTotals(quote);
            }
            return Observable.of(QuoteAction.setQuote(quote));
        }).catch((error) => {
            console.log(error);
            return Observable.empty();
        });
}
