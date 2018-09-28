import {AbstractPriceService} from "./AbstractPriceService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";

export class GiftCardPriceService extends AbstractPriceService{
    static className = 'GiftCardPriceService';

}

/**
 *
 * @type {GiftCardPriceService}
 */
let giftCardPriceService = ServiceFactory.get(GiftCardPriceService);

export default giftCardPriceService;