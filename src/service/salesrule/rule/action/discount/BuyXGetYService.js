import {SalesRuleAbstractDiscountService} from "./AbstractDiscountService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import ValidatorService from "../../../ValidatorService";
import NumberHelper from "../../../../../helper/NumberHelper";

export class SalesRuleBuyXGetYService extends SalesRuleAbstractDiscountService {
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
        let itemPrice = ValidatorService.getItemPrice(item);
        let baseItemPrice = ValidatorService.getItemBasePrice(item);
        let itemOriginalPrice = ValidatorService.getItemOriginalPrice(item, quote);
        let baseItemOriginalPrice = ValidatorService.getItemBaseOriginalPrice(item, quote);

        let x = rule.discount_step;
        let y = rule.discount_amount;

        if (!x || y > x) {
            return discountData;
        }

        let buyAndDiscountQty = NumberHelper.addNumber(x, y);

        let fullRuleQtyPeriod = Math.floor(qty / buyAndDiscountQty);
        let freeQty = NumberHelper.minusNumber(qty, NumberHelper.multipleNumber(fullRuleQtyPeriod, buyAndDiscountQty));

        let discountQty = NumberHelper.multipleNumber(fullRuleQtyPeriod, y);

        if (freeQty > x) {
            discountQty = NumberHelper.addNumber(discountQty, freeQty, -x);
        }

        discountData.amount = discountQty * itemPrice;
        discountData.base_amount = discountQty * baseItemPrice;
        discountData.original_amount = discountQty * itemOriginalPrice;
        discountData.base_original_amount = discountQty * baseItemOriginalPrice;

        return discountData;
    }
}


/** @type SalesRuleBuyXGetYService */
let salesRuleBuyXGetYService = ServiceFactory.get(SalesRuleBuyXGetYService);

export default salesRuleBuyXGetYService;