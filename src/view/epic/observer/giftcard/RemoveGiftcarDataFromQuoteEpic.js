import {Observable} from "rxjs";
import QuoteConstant from "../../../constant/checkout/QuoteConstant";
import ShippingConstant from "../../../constant/ShippingConstant";

/**
 * @param action$
 */
export default (action$) => {
    return action$.ofType(
        QuoteConstant.CHANGE_CUSTOMER_AFTER,
        QuoteConstant.ADD_PRODUCT_AFTER,
        QuoteConstant.REMOVE_CART_ITEM_AFTER,
        ShippingConstant.SAVE_SHIPPING_AFTER,
        QuoteConstant.UPDATE_QTY_CART_ITEM_AFTER,
        QuoteConstant.ADD_COUPON_CODE_AFTER,
    ).mergeMap(action => {
        let quote = action.quote;
        if (quote) {
            delete quote.gift_voucher_applied_codes;
            let removeExistingCodesAction = [
                QuoteConstant.CHANGE_CUSTOMER_AFTER
            ];
            if(removeExistingCodesAction.includes(action.type)) {
                delete quote.gift_voucher_existing_codes;
            }
        }
        return Observable.empty();
    });
}
