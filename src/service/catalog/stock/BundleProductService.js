import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractStockService} from "./AbstractService";

export class BundleProductStockService extends AbstractStockService {
    static className = 'BundleProductStockService';
}

/** @type BundleProductStockService */
let bundleProductStockService = ServiceFactory.get(BundleProductStockService);

export default bundleProductStockService;

