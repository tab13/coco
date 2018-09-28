import {CreditmemoAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";

export class CreditmemoCostService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoCostService';

    /**
     * Collect creditmemo cost
     *
     * @param creditmemo
     * @return {CreditmemoCostService}
     */
    collect(creditmemo) {
        let baseRefundTotalCost = 0;
        creditmemo.items.forEach(item => {
            baseRefundTotalCost = NumberHelper.addNumber(
                baseRefundTotalCost, NumberHelper.multipleNumber(item.base_cost, item.qty)
            );
        });
        creditmemo.base_cost = baseRefundTotalCost;
        return this;
    }
}

/** @type CreditmemoCostService */
let creditmemoCostService = ServiceFactory.get(CreditmemoCostService);

export default creditmemoCostService;