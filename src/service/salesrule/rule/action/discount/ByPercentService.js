import {SalesRuleAbstractDiscountService} from "./AbstractDiscountService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import ValidatorService from "../../../ValidatorService";

export class SalesRuleByPercentService extends SalesRuleAbstractDiscountService {
    static className = 'SalesRuleByPercentService';

    /**
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} rule
     * @param {object} item
     * @param {number} qty
     */
    calculate(quote, address, rule, item, qty) {
        let rulePercent = Math.min(100, rule.discount_amount);

        return this._calculate(quote, rule, item, qty, rulePercent);
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

    /**
     *
     * @param quote
     * @param rule
     * @param item
     * @param qty
     * @param rulePercent
     * @private
     */
    _calculate(quote, rule, item, qty, rulePercent) {
        let discountData = {};

        let itemPrice = ValidatorService.getItemPrice(item);
        let baseItemPrice = ValidatorService.getItemBasePrice(item);
        let itemOriginalPrice = ValidatorService.getItemOriginalPrice(item, quote);
        let baseItemOriginalPrice = ValidatorService.getItemBaseOriginalPrice(item, quote);

        let rulePct = rulePercent / 100;
        discountData.amount = (qty * itemPrice - (item.discount_amount || 0)) * rulePct;
        discountData.base_amount = (qty * baseItemPrice - (item.base_discount_amount || 0)) * rulePct;
        discountData.original_amount = (qty * itemOriginalPrice - (item.discount_amount || 0)) * rulePct;
        discountData.base_original_amount = (qty * baseItemOriginalPrice - (item.base_discount_amount || 0)) * rulePct;

        if (!rule.discount_qty || rule.discount_qty > qty) {
            item.discount_percent = Math.min(100, (item.discount_percent || 0) + rulePercent);
        }
        return discountData;
    }
}


/** @type SalesRuleByPercentService */
let salesRuleByPercentService = ServiceFactory.get(SalesRuleByPercentService);

export default salesRuleByPercentService;