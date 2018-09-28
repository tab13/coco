import {AbstractShippingMethodService} from "./AbstractShippingMethodService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import QuoteItemService from "../../checkout/quote/ItemService";
import NumberHelper from "../../../helper/NumberHelper";

export class FlatRateService extends AbstractShippingMethodService {
    static className = 'FlatRateService';
    static methodCode = "flatrate_flatrate";

    /**
     *
     * @param request
     * @param quote
     */
    collectRates(request, quote) {
        let freeBoxes = this.getFreeBoxesCount(request, quote);
        this.free_boxes = freeBoxes;
        let shippingPrice = this.getShippingPrice(request, freeBoxes);

        let result = [];

        if (shippingPrice !== false) {
            let method = this.createResultMethod(shippingPrice);
            result.push(method);
        }

        return result;
    }

    /**
     *
     * @param request
     * @param quote
     * @return {number}
     */
    getFreeBoxesCount(request, quote) {
        let freeBoxes = 0;
        if (request.all_items) {
            request.all_items.forEach(item => {
                if (item.product.is_virtual || item.parent_item_id) {
                    return false;
                }
                if (item.has_children && QuoteItemService.isShipSeparately(item, quote)) {
                    freeBoxes = NumberHelper.addNumber(freeBoxes, this.getFreeBoxesCountFromChildren(item, quote));
                } else if (item.free_shipping) {
                    freeBoxes = NumberHelper.addNumber(freeBoxes, item.qty);
                }
            });
        }
        return freeBoxes;
    }

    /**
     * @param item
     * @param quote
     * @return {number}
     */
    getFreeBoxesCountFromChildren(item, quote) {
        let freeBoxes = 0;
        QuoteItemService.getChildrenItems(quote, item).forEach(child => {
            if (child.free_shipping && !child.product.is_virtual) {
                freeBoxes = NumberHelper.addNumber(freeBoxes, item.qty * child.qty);
            }
        });
        return freeBoxes;
    }

    /**
     *
     * @param request
     * @param freeBoxes
     * @return {boolean}
     */
    getShippingPrice(request, freeBoxes) {
        let shippingPrice = false;
        let configPrice = this.getConfigData('price');
        if (this.getConfigData('type') === 'O') {
            shippingPrice = configPrice;
        } else if (this.getConfigData('type') === 'I') {
            shippingPrice = NumberHelper.minusNumber(
                NumberHelper.multipleNumber(request.package_qty, configPrice),
                NumberHelper.multipleNumber(freeBoxes, configPrice)
            );
        }

        shippingPrice = this.getFinalPriceWithHandlingFee(shippingPrice);

        if (shippingPrice !== false && request.package_qty === freeBoxes) {
            shippingPrice = 0;
        }
        return shippingPrice;
    }

    /**
     * Create result method
     *
     * @param shippingPrice
     * @return {{carrier: string, method: string, code: *, title: *, price: *, cost: *}}
     */
    createResultMethod(shippingPrice) {
        let method = {
            carrier: 'flatrate',
            method: 'flatrate',
            code: this.getConfigData('code'),
            title: this.getConfigData('title'),
            description: this.getConfigData('description'),
            price: shippingPrice,
            cost: shippingPrice
        };
        return method;
    }
}

/** @type FlatRateService */
let flatRateService = ServiceFactory.get(FlatRateService);

export default flatRateService;
