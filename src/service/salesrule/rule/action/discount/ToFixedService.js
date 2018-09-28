import {SalesRuleAbstractDiscountService} from "./AbstractDiscountService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import ValidatorService from "../../../ValidatorService";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";

export class SalesRuleToFixedService extends SalesRuleAbstractDiscountService {
    static className = 'SalesRuleToFixedService';

    /**
     * @param {object} quote
     * @param {object} address
     * @param {object} rule
     * @param {object} item
     * @param {object} qty
     */
    calculate(quote, address, rule, item, qty) {
        let discountData = {};

        let itemPrice = ValidatorService.getItemPrice(item);
        let baseItemPrice = ValidatorService.getItemBasePrice(item);
        let itemOriginalPrice = ValidatorService.getItemOriginalPrice(item, quote);
        let baseItemOriginalPrice = ValidatorService.getItemBaseOriginalPrice(item, quote);

        let quoteAmount = CurrencyHelper.convert(rule.discount_amount);
        discountData.amount = qty * (itemPrice - quoteAmount);
        discountData.base_amount = qty * (baseItemPrice - rule.discount_amount);
        discountData.original_amount = qty * (itemOriginalPrice - quoteAmount);
        discountData.base_original_amount = qty * (baseItemOriginalPrice - rule.discount_amount);

        return discountData;
    }
}


/** @type SalesRuleToFixedService */
let salesRuleToFixedService = ServiceFactory.get(SalesRuleToFixedService);

export default salesRuleToFixedService;