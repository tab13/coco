import CoreService from "../../../CoreService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory"

export class AbstractProductTypeService extends CoreService {
    static className = 'AbstractProductTypeService';

    static CALCULATE_CHILD = 0;

    static CALCULATE_PARENT = 1;

    /**#@+
     * values for shipment type (invoice etc)
     */
    static SHIPMENT_SEPARATELY = 1;

    static SHIPMENT_TOGETHER = 0;
}


let abstractProductTypeService = ServiceFactory.get(AbstractProductTypeService);

export default abstractProductTypeService;
