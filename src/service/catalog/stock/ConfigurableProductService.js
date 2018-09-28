import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractStockService} from "./AbstractService";

export class ConfigurableProductStockService extends AbstractStockService {
    static className = 'ConfigurableProductStockService';
}

/** @type ConfigurableProductStockService */
let configurableProductStockService = ServiceFactory.get(ConfigurableProductStockService);

export default configurableProductStockService;

