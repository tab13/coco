import {Observable} from "rxjs";
import QuoteConstant from "../../../constant/checkout/QuoteConstant";

/**
 * Receive action type(QuoteConstant.PLACE_ORDER_BEFORE) and request
 * @param action$
 */
export default (action$) => {
    return action$.ofType(QuoteConstant.PLACE_ORDER_BEFORE)
        .mergeMap(action => {
            let quote = action.quote;
            if (quote) {
                if (quote.gift_voucher_gift_codes && quote.gift_voucher_gift_codes_discount) {
                    let giftcodes = quote.gift_voucher_gift_codes;
                    giftcodes = giftcodes.split(',');
                    if (giftcodes && Array.isArray(giftcodes) && giftcodes.length) {
                        let codesDiscount = quote.gift_voucher_gift_codes_discount;
                        let codesBaseDiscount = quote.codes_base_discount;
                        codesDiscount = codesDiscount.split(',');
                        codesBaseDiscount = codesBaseDiscount.split(',');
                        giftcodes.forEach((code, index) => {
                            if(!Math.abs(codesDiscount[index])) {
                                giftcodes.splice(index, 1);
                                codesDiscount.splice(index, 1);
                                codesBaseDiscount.splice(index, 1);
                            }
                        });
                        giftcodes = giftcodes.join(',');
                        codesDiscount = codesDiscount.join(',');
                        codesBaseDiscount = codesBaseDiscount.join(',');
                        quote.gift_voucher_gift_codes = giftcodes;
                        quote.gift_voucher_gift_codes_discount = codesDiscount;
                        quote.codes_base_discount = codesBaseDiscount;
                        quote.codes_discount = codesDiscount;
                    }
                }
            }
            return Observable.empty();
        });
}
