import {SalesRuleAbstractDiscountService} from "./AbstractDiscountService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";

export class SalesRuleByFixedService extends SalesRuleAbstractDiscountService {
    static className = 'SalesRuleToFixedService';

    /**
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} rule
     * @param {object} item
     * @param {number} qty
     */
    calculate(quote, address, rule, item, qty) {
        let discountData = {};
        let quoteAmount = CurrencyHelper.convert(rule.discount_amount);
        discountData.amount = qty * quoteAmount;
        discountData.base_amount = qty * rule.discount_amount;
        return discountData;
    }

    /**
     * @param {number} qty
     * @param {object} rule
     * @return {number}
     */
    fixQuantity(qty, rule) {
        let step = rule.discount_step;
        if (step) {
            qty = Math.floor(qty / step) * step;
        }

        return qty;
    }
}


/** @type SalesRuleByFixedService */
let salesRuleByFixedService = ServiceFactory.get(SalesRuleByFixedService);

export default salesRuleByFixedService;