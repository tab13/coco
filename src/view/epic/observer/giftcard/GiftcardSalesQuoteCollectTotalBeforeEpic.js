import TotalsConstant from '../../../constant/checkout/quote/TotalsConstant';
import {Observable} from "rxjs";

/**
 * Receive action type(PLACE_ORDER_AFTER | CREATE_CREDITMEMO_AFTER) and request
 * @param action$
 */
export default (action$) => {
    return action$.ofType(TotalsConstant.SALES_QUOTE_COLLECT_TOTALS_BEFORE)
        .mergeMap(action => {
            let quote = action.quote;
            if(quote) {
                delete quote.base_gift_voucher_discount;
                delete quote.gift_voucher_discount;
                delete quote.magestore_base_discount;
                delete quote.magestore_discount;
                delete quote.gift_voucher_gift_codes;
                delete quote.gift_voucher_gift_codes_discount;
                delete quote.codes_base_discount;
                delete quote.codes_discount;
                delete quote.base_giftvoucher_discount_for_shipping;
                delete quote.giftvoucher_discount_for_shipping;
                delete quote.magestore_base_discount_for_shipping;
                delete quote.magestore_discount_for_shipping;
                if (quote.addresses && Array.isArray(quote.addresses) && quote.addresses.length) {
                    quote.addresses.forEach(address => {
                        address.base_gift_voucher_discount = 0;
                        address.gift_voucher_discount = 0;
                        address.base_giftvoucher_discount_for_shipping = 0;
                        address.giftvoucher_discount_for_shipping = 0;
                        address.magestore_base_discount = 0;
                        address.magestore_discount = 0;
                        address.magestore_base_discount_for_shipping = 0;
                        address.magestore_discount_for_shipping = 0;
                    })
                }
                if (quote.items && Array.isArray(quote.items) && quote.items.length) {
                    quote.items.forEach(item => {
                        item.base_gift_voucher_discount = 0;
                        item.gift_voucher_discount = 0;
                        item.magestore_base_discount = 0;
                        item.magestore_discount = 0;
                    })
                }
            }
            return Observable.empty();
        });
}
