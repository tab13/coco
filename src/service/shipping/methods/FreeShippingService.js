import {AbstractShippingMethodService} from "./AbstractShippingMethodService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";

export class FreeShippingService extends AbstractShippingMethodService {
    static className = 'FreeShippingService';
    static methodCode = "freeshipping_freeshipping";

    /**
     *
     * @param request
     * @param quote
     */
    collectRates(request, quote) {
        let result = [];

        this._updateFreeMethodQuote(request);

        if (request.free_shipping || request.base_subtotal_incl_tax >= +this.getConfigData('free_shipping_subtotal')) {
            let method = {
                carrier: 'freeshipping',
                method: 'freeshipping',
                code: this.getConfigData('code'),
                title: this.getConfigData('title'),
                description: this.getConfigData('description'),
                price: 0,
                cost: 0
            };
            result.push(method);
        }

        return result;
    }

    /**
     * Allows free shipping when all product items have free shipping (promotions etc.)
     *
     * @param request
     * @private
     */
    _updateFreeMethodQuote(request) {
        let item = request.all_items.find(item => item.free_shipping);
        if (item) {
            request.free_shipping = true;
        }
    }
}

/** @type FreeShippingService */
let freeShippingService = ServiceFactory.get(FreeShippingService);

export default freeShippingService;
