import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractStockService} from "./AbstractService";

export class SimpleProductStockService extends AbstractStockService {
    static className = 'SimpleProductStockService';
}

/** @type SimpleProductStockService */
let simpleProductStockService = ServiceFactory.get(SimpleProductStockService);

export default simpleProductStockService;

