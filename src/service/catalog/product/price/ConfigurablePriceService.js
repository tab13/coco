import {AbstractPriceService} from "./AbstractPriceService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";

export class ConfigurablePriceService extends AbstractPriceService {
    static className = 'ConfigurableProductPriceService';

    /**
     * Get
     *
     * @param qty
     * @param product
     * @param quote
     * @param item
     */
    getFinalPrice(qty, product, quote, item) {
        let finalPrice = 0;
        if (product.custom_option && product.custom_option.simple_product && product.custom_option.simple_product.id) {
            finalPrice = super.getFinalPrice(qty, product.custom_option.simple_product, quote, item);
        } else {

        }
        finalPrice = this._applyOptionsPrice(product, qty, finalPrice);
        finalPrice = Math.max(0, finalPrice);
        finalPrice = this._applyCustomPrice(item, finalPrice);
        product.final_price = finalPrice;
        return finalPrice;
    }

    /**
     * Get
     *
     * @param qty
     * @param product
     * @param quote
     * @param item
     */
    getOriginalFinalPrice(qty, product, quote, item) {
        let finalPrice = 0;
        if (product.custom_option && product.custom_option.simple_product && product.custom_option.simple_product.id) {
            finalPrice = super.getFinalPrice(qty, product.custom_option.simple_product, quote, item);
        } else {

        }
        finalPrice = this._applyOptionsPrice(product, qty, finalPrice);
        finalPrice = Math.max(0, finalPrice);
        finalPrice = this._applyCustomPrice(item, finalPrice);
        product.final_price = finalPrice;
        return finalPrice;
    }
}

let configurablePriceService = ServiceFactory.get(ConfigurablePriceService);

export default configurablePriceService;