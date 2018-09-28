import CoreService from "../../CoreService";
import SimplePriceService from './price/SimplePriceService';
import ConfigurablePriceService from './price/ConfigurablePriceService';
import BundlePriceService from './price/BundlePriceService';
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import GiftCardPriceService from "./price/GiftCardPriceService";

export class PriceService extends CoreService {
    static className = 'ProductPriceService';
    priceServices = {
        simple: SimplePriceService,
        configurable: ConfigurablePriceService,
        bundle: BundlePriceService,
        gift_card: GiftCardPriceService
    };

    /**
     *  Get product price service by product type id
     *
     * @param product
     * @return {AbstractPriceService}
     */
    getPriceService(product) {
        if (typeof product === 'string' && this.priceServices[product]) {
            return this.priceServices[product];
        }
        if (product.type_id && this.priceServices[product.type_id]) {
            return this.priceServices[product.type_id];
        }
        return this.priceServices.simple;
    }
}

/** @type PriceService */
let priceService = ServiceFactory.get(PriceService);

export default priceService;