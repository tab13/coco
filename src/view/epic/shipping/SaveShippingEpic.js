import ShippingConstant from "../../constant/ShippingConstant";
import {Observable} from 'rxjs';
import QuoteAddressService from "../../../service/checkout/quote/AddressService";
import AddressConstant from "../../constant/checkout/quote/AddressConstant";
import QuoteService from "../../../service/checkout/QuoteService";
import QuoteAction from "../../action/checkout/QuoteAction";
import StoreCreditService from "../../../service/store-credit/StoreCreditService";
import PaymentAction from "../../action/PaymentAction";
import AppStore from "../../../view/store/store";
import ShippingAction from "../../action/ShippingAction";

/**
 * Save shipping to quote
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default function saveShipping(action$) {
    return action$.ofType(ShippingConstant.SAVE_SHIPPING)
        .mergeMap((action) => {
            let quote = action.quote,
                address = action.address,
                shippingMethod = action.shipping_method,
                deliveryDate = action.delivery_date,
                fulfillOnline = action.fulfill_online;
            let customer = quote.customer;
            let shippingAddress = QuoteAddressService.getShippingAddress(quote);
            if (!shippingAddress) {
                shippingAddress = QuoteAddressService.createAddress(
                    AddressConstant.SHIPPING_ADDRESS_TYPE, address, customer
                );
                shippingAddress.quote_id = quote.id;
                quote.addresses.push(shippingAddress);
            } else {
                QuoteAddressService.updateAddress(shippingAddress, address, customer);
            }
            shippingAddress.shipping_method = shippingMethod ? shippingMethod.code : "";
            shippingAddress.current_shipping_method = shippingMethod;
            quote.pos_delivery_date = deliveryDate;
            quote.pos_fulfill_online = fulfillOnline;
            // check and remove customer credit in quote
            quote = StoreCreditService.checkAndRemoveStoreCreditInQuote(quote);

            AppStore.dispatch(ShippingAction.saveShippingAfter(quote));

            quote = QuoteService.collectTotals(quote);
            return Observable.from([
                QuoteAction.setQuote(quote),
                QuoteAction.validateQuoteSalesRule(quote),
                PaymentAction.updateStoreCreditWhenChangeShippingMethod(quote)
            ]);
        });
}