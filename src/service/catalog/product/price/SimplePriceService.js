import {AbstractPriceService} from "./AbstractPriceService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";

export class SimplePriceService extends AbstractPriceService{
    static className = 'SimpleProductPriceService';

}

let simplePriceService = ServiceFactory.get(SimplePriceService);

export default simplePriceService;