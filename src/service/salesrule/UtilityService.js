import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import QuoteItemService from "../checkout/quote/ItemService";

export class SalesRuleUtilityService extends CoreService {
    static className = 'SalesRuleUtilityService';

    /**
     * Return discount item qty
     *
     * @param {object} item
     * @param {object} quote
     * @param {object} rule
     * @return {number}
     */
    getItemQty(item, quote, rule) {
        let qty = QuoteItemService.getTotalQty(item, quote);
        let discountQty = rule.discount_qty;
        return discountQty ? Math.min(qty, discountQty) : qty;
    }

    /**
     * @param {object} discountData
     * @param {object} item
     * @param {number} qty
     */
    minFix(discountData, item, qty) {
        let itemPrice = this.getItemPrice(item);
        let baseItemPrice = this.getItemBasePrice(item);
        let itemDiscountAmount = item.discount_amount || 0;
        let itemBaseDiscountAmount = item.base_discount_amount || 0;

        let discountAmount = Math.min(itemDiscountAmount + discountData.amount, itemPrice * qty);
        let baseDiscountAmount = Math.min(itemBaseDiscountAmount + discountData.base_amount, baseItemPrice * qty);
        discountData.amount = discountAmount;
        discountData.base_amount = baseDiscountAmount;
    }

    /**
     * Return item price
     *
     * @param {object} item
     * @return {number}
     */
    getItemPrice(item) {
        let price = item.discount_calculation_price;
        let calcPrice = QuoteItemService.getCalculationPrice(item);
        return price === null || price === undefined ? calcPrice : price;
    }

    /**
     * Return base item price
     *
     * @param {object} item
     * @return {number}
     */
    getItemBasePrice(item) {
        let price = item.discount_calculation_price;
        return price !== null && price !== undefined ?
            item.base_discount_calculation_price : QuoteItemService.getBaseCalculationPrice(item);
    }

    /**
     * Merge two sets of ids
     *
     * @param {array|string} a1
     * @param {array|string} a2
     * @param {boolean} asString
     * @return {array|string}
     */
    mergeIds(a1, a2, asString = true) {
        if (!Array.isArray(a1)) {
            a1 = !a1 ? [] : a1.split(',').map(Number);
        }
        if (!Array.isArray(a2)) {
            a2 = !a2 ? [] : a2.split(',').map(Number);
        }
        let a = [...new Set([...a1, ...a2])];
        if (asString) {
            a = a.join(',');
        }
        return a;
    }
}


/** @type SalesRuleUtilityService */
let salesRuleUtilityService = ServiceFactory.get(SalesRuleUtilityService);

export default salesRuleUtilityService;