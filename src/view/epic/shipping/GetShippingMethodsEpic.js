import ShippingConstant from "../../constant/ShippingConstant";
import ShippingAction from "../../action/ShippingAction";
import {Observable} from 'rxjs';
import QuoteAddressService from "../../../service/checkout/quote/AddressService";
import QuoteService from "../../../service/checkout/QuoteService";
import AddressConstant from "../../constant/checkout/quote/AddressConstant";
import ShippingService from "../../../service/shipping/ShippingService";
import TaxHelper from "../../../helper/TaxHelper";

/**
 * Get shipping method by address
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default function getShippingMethod(action$) {
    return action$.ofType(ShippingConstant.GET_SHIPPING_METHODS)
        .mergeMap(action => Observable.of(ShippingService.getAllowShippingMethods())
            .mergeMap((allShippingMethods) => {
                let quote = JSON.parse(JSON.stringify(action.quote));
                let address = JSON.parse(JSON.stringify(action.address));
                if (!quote || !address) {
                    return Observable.empty();
                }
                address.address_type = AddressConstant.SHIPPING_ADDRESS_TYPE;
                let shippingAddress = quote.addresses.find(address =>
                    address.address_type === AddressConstant.SHIPPING_ADDRESS_TYPE
                );
                QuoteAddressService.updateAddress(shippingAddress, address, quote.customer);
                QuoteService.collectTotals(quote);

                let shippingMethods = QuoteAddressService.requestShippingRates(
                    quote, shippingAddress, allShippingMethods
                );
                let displayInclTax = TaxHelper.shippingPriceDisplayIncludeTax();
                shippingMethods.forEach(shipping => {
                    shippingAddress.shipping_method = shipping.code;
                    shippingAddress.current_shipping_method = shipping;
                    QuoteService.collectTotals(quote);
                    shipping.display_amount = displayInclTax ?
                        shippingAddress.shipping_incl_tax : shippingAddress.shipping_amount;
                });

                return Observable.of(
                    ShippingAction.getListShippingResult(shippingMethods)
                );
            }).catch(error => {
                console.log(error);
                return Observable.of(ShippingAction.getListShippingResult([]));
            })
        );
}