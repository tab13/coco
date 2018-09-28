import {SalesRuleAbstractDiscountService} from "./AbstractDiscountService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import ValidatorService from "../../../ValidatorService";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";

export class SalesRuleCartFixedService extends SalesRuleAbstractDiscountService {
    static className = 'SalesRuleCartFixedService';

    cartFixedRuleUsedForAddress = {};

    /**
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} rule
     * @param {object} item
     * @param {object} qty
     */
    calculate(quote, address, rule, item, qty) {
        this.cartFixedRuleUsedForAddress = {};
        let discountData = {};
        let ruleTotals = ValidatorService.getRuleItemTotalsInfo(rule.rule_id);

        let itemPrice = ValidatorService.getItemPrice(item);
        let baseItemPrice = ValidatorService.getItemBasePrice(item);
        let itemOriginalPrice = ValidatorService.getItemOriginalPrice(item, quote);
        let baseItemOriginalPrice = ValidatorService.getItemBaseOriginalPrice(item, quote);

        let cartRules = address.cart_fixed_rules;
        if (!cartRules[rule.rule_id]) {
            cartRules[rule.rule_id] = rule.discount_amount;
        }

        if (cartRules[rule.rule_id] > 0) {
            let baseDiscountAmount = 0;
            let quoteAmount = 0;
            if (ruleTotals.items_count <= 1) {
                quoteAmount = CurrencyHelper.convert(cartRules[rule.rule_id]);
                baseDiscountAmount = Math.min(baseItemPrice * qty, cartRules[rule.rule_id]);
            } else {
                let discountRate = baseItemPrice * qty / ruleTotals.base_items_price;
                let maximumItemDiscount = rule.discount_amount * discountRate;
                quoteAmount = CurrencyHelper.convert(maximumItemDiscount);
                baseDiscountAmount = Math.min(baseItemPrice * qty, maximumItemDiscount);
                ValidatorService.decrementRuleItemTotalsCount(rule.rule_id);
            }
            baseDiscountAmount = CurrencyHelper.roundToFloat(baseDiscountAmount);
            cartRules[rule.rule_id] -= baseDiscountAmount;
            discountData.amount = CurrencyHelper.roundToFloat(Math.min(itemPrice * qty, quoteAmount));
            discountData.base_amount = baseDiscountAmount;
            discountData.original_amount = Math.min(itemOriginalPrice * qty, quoteAmount);
            discountData.base_original_amount = CurrencyHelper.roundToFloat(baseItemOriginalPrice);
        }

        address.cart_fixed_rules = cartRules;

        return discountData;
    }

    /**
     * Set information about usage cart fixed rule by quote address
     *
     * @param {number} ruleId
     * @param {number} itemId
     */
    setCartFixedRuleUsedForAddress(ruleId, itemId) {
        this.cartFixedRuleUsedForAddress[ruleId] = itemId;
    }

    /**
     * Retrieve information about usage cart fixed rule by quote address
     *
     * @param {number} ruleId
     * @return {number|null}
     */
    getCartFixedRuleUsedForAddress(ruleId) {
        if (this.cartFixedRuleUsedForAddress[ruleId]) {
            return this.cartFixedRuleUsedForAddress[ruleId];
        }
        return null;
    }
}


/** @type SalesRuleCartFixedService */
let salesRuleCartFixedService = ServiceFactory.get(SalesRuleCartFixedService);

export default salesRuleCartFixedService;