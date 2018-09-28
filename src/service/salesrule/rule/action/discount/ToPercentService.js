import {SalesRuleByPercentService} from "./ByPercentService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";

export class SalesRuleToPercentService extends SalesRuleByPercentService {
    static className = 'SalesRuleToPercentService';

    /**
     * @param {object} quote
     * @param {object} address
     * @param {object} rule
     * @param {object} item
     * @param {object} qty
     */
    calculate(quote, address, rule, item, qty) {
        let rulePercent = Math.max(0, 100 - rule.discount_amount);

        return this._calculate(quote, rule, item, qty, rulePercent);
    }
}


/** @type SalesRuleToPercentService */
let salesRuleToPercentService = ServiceFactory.get(SalesRuleToPercentService);

export default salesRuleToPercentService;