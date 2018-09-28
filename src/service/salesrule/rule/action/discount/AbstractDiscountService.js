import CoreService from "../../../../CoreService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";

export class SalesRuleAbstractDiscountService extends CoreService {
    static className = 'SalesRuleAbstractDiscountService';

    /**
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} rule
     * @param {object} item
     * @param {number} qty
     */
    calculate(quote, address, rule, item, qty) {
    }

    /**
     * @param {number} qty
     * @param {object} rule
     * @return {number}
     */
    fixQuantity(qty, rule) {
        return qty;
    }
}


/** @type SalesRuleAbstractDiscountService */
let salesRuleAbstractDiscountService = ServiceFactory.get(SalesRuleAbstractDiscountService);

export default salesRuleAbstractDiscountService;