import {WeeeDataService} from "./WeeeDataService";
import ServiceFactory from "../../framework/factory/ServiceFactory";

export class OrderWeeeDataService extends WeeeDataService {
    static className = 'OrderWeeeDataService';

    /**
     * Get applied items
     * @param item
     * @param order
     * @return {*}
     */
    getApplied(item, order) {
        let data = item.weee_tax_applied;
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    }
}

/** @type OrderWeeeDataService */
let orderWeeeDataService = ServiceFactory.get(OrderWeeeDataService);

export default orderWeeeDataService;