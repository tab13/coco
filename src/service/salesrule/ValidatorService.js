import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import QuoteItemService from "../checkout/quote/ItemService";
import RulesApplierService from "./RulesApplierService";
import UtilityService from "./UtilityService";
import CatalogDataService from "../catalog/CatalogDataService";
import SimpleActionConstant from "../../view/constant/salesrule/SimpleActionConstant";
import CurrencyHelper from "../../helper/CurrencyHelper";

export class SalesRuleValidatorService extends CoreService {
    static className = 'SalesRuleValidatorService';

    rulesItemTotals = {};

    /**
     * Reset quote applied rule ids
     *
     * @param quote
     * @param address
     */
    reset(quote, address) {
        quote.applied_rule_ids = "";
        address.applied_rule_ids = "";
    }

    /**
     * Sort valid sales rule by priority
     *
     * @param quote
     */
    sortSalesRuleByPriority(quote) {
        if (quote.valid_salesrule && quote.valid_salesrule.length) {
            quote.valid_salesrule.sort((a, b) => {
                if (a.sort_order === b.sort_order) {
                    return (a.rule_id - b.rule_id);
                } else if (a.sort_order < b.sort_order) {
                    return -1;
                } else if (a.sort_order > b.sort_order) {
                    return 1;
                }
                return -1;
            });
        }
    }

    /**
     * Calculate quote totals for each rule and save results
     *
     * @param {object} quote
     * @param {object} address
     * @param {array} quoteItems
     * @return {{}}
     */
    initTotals(quote, address, quoteItems) {
        address.cart_fixed_rules = {};
        if (!quoteItems && !quoteItems.length) {
            return {};
        }
        this.rulesItemTotals = {};
        if (quote.valid_salesrule && quote.valid_salesrule.length > 0) {
            quote.valid_salesrule.map(rule => {
                let ruleTotalItemsPrice = 0;
                let ruleTotalBaseItemsPrice = 0;
                let validItemsCount = 0;
                quoteItems.map(item => {
                    if (item.parent_item_id) {
                        return false;
                    }
                    if (!rule.valid_item_ids.includes(parseFloat(item.item_id))) {
                        return false;
                    }
                    let qty = UtilityService.getItemQty(item, quote, rule);
                    ruleTotalItemsPrice += (this.getItemPrice(item) * qty);
                    ruleTotalBaseItemsPrice += (this.getItemBasePrice(item) * qty);
                    validItemsCount++;
                    return item;
                });
                this.rulesItemTotals[rule.rule_id] = {
                    items_price: ruleTotalItemsPrice,
                    base_items_price: ruleTotalBaseItemsPrice,
                    items_count: validItemsCount
                };
                return rule;
            })
        }

        return this.rulesItemTotals;
    }

    /**
     * Quote item discount calculation process
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} item
     */
    process(quote, address, item) {
        item.discount_amount = 0;
        item.base_discount_amount = 0;
        item.discount_percent = 0;
        let itemPrice = this.getItemPrice(item);
        if (itemPrice < 0) {
            return this;
        }
        let appliedRuleIds = RulesApplierService.applyRules(quote, address, item);
        RulesApplierService.setAppliedRuleIds(quote, address, item, appliedRuleIds);
    }

    /**
     * @todo discount for shipping free
     *
     * @param quote
     * @param address
     */
    processShippingAmount(quote, address) {
        let shippingAmount = address.shipping_amount_for_discount;
        let baseShippingAmount = 0;
        if (typeof shippingAmount !== 'undefined' && shippingAmount !== null) {
            baseShippingAmount = address.base_shipping_amount_for_discount;
        } else {
            shippingAmount = address.shipping_amount;
            baseShippingAmount = address.base_shipping_amount;
        }
        let appliedRuleIds = [];
        if (!quote.valid_salesrule || !quote.valid_salesrule.length) {
            return appliedRuleIds;
        }
        quote.valid_salesrule.map(rule => {
            if (!rule.apply_to_shipping) {
                return rule;
            }
            let discountAmount = 0;
            let baseDiscountAmount = 0;
            let rulePercent = Math.min(100, rule.discount_amount);
            let quoteAmount = 0;
            switch (rule.simple_action) {
                case SimpleActionConstant.TO_PERCENT_ACTION:
                    rulePercent = Math.max(0, 100 - rule.discount_amount);
                    break;
                case SimpleActionConstant.BY_PERCENT_ACTION:
                    discountAmount = (shippingAmount - (address.shipping_discount_amount || 0)) * rulePercent / 100;
                    baseDiscountAmount = (baseShippingAmount -
                        (address.base_shipping_discount_amount || 0)) * rulePercent / 100;
                    let discountPercent = Math.min(100, (address.shipping_discount_percent || 0) + rulePercent);
                    address.shipping_discount_percent = discountPercent;
                    break;
                case SimpleActionConstant.TO_FIXED_ACTION:
                    quoteAmount = CurrencyHelper.convert(rule.discount_amount);
                    discountAmount = shippingAmount - quoteAmount;
                    baseDiscountAmount = baseShippingAmount - rule.discount_amount;
                    break;
                case SimpleActionConstant.BY_FIXED_ACTION:
                    quoteAmount = CurrencyHelper.convert(rule.discount_amount);
                    discountAmount = quoteAmount;
                    baseDiscountAmount = rule.discount_amount;
                    break;
                case SimpleActionConstant.CART_FIXED_ACTION:
                    let cartRules = address.cart_fixed_rules;
                    if (typeof cartRules[rule.rule_id] === 'undefined') {
                        cartRules[rule.rule_id] = rule.discount_amount;
                    }
                    if (cartRules[rule.rule_id] > 0) {
                        quoteAmount = CurrencyHelper.convert(cartRules[rule.rule_id]);
                        discountAmount = Math.min(
                            shippingAmount - (address.shipping_discount_amount || 0), quoteAmount
                        );
                        baseDiscountAmount = Math.min(
                            baseShippingAmount - (address.base_shipping_discount_amount || 0), cartRules[rule.rule_id]
                        );
                        cartRules[rule.rule_id] -= baseDiscountAmount;
                    }
                    address.cart_fixed_rules = cartRules;
                    break;
                default:
                    break;
            }
            discountAmount = Math.min((address.shipping_discount_amount || 0) + discountAmount, shippingAmount);
            baseDiscountAmount = Math.min(
                (address.base_shipping_discount_amount || 0) + baseDiscountAmount, baseShippingAmount
            );
            address.shipping_discount_amount = discountAmount;
            address.base_shipping_discount_amount = baseDiscountAmount;
            appliedRuleIds.push(rule.rule_id);
            RulesApplierService.addDiscountDescription(address, rule);
            return rule;
        });

        address.applied_rule_ids = UtilityService.mergeIds(address.applied_rule_ids, appliedRuleIds);
        quote.applied_rule_ids = UtilityService.mergeIds(quote.applied_rule_ids, appliedRuleIds);
        return this;
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
     * Return item original price
     *
     * @param {object} item
     * @param {object} quote
     * @return {number}
     */
    getItemOriginalPrice(item, quote) {
        return CatalogDataService.getTaxPrice(item, quote, QuoteItemService.getOriginalPrice(item), true);
    }

    /**
     * Return item base original price
     *
     * @param {object} item
     * @param {object} quote
     * @return {number}
     */
    getItemBaseOriginalPrice(item, quote) {
        return CatalogDataService.getTaxPrice(item, quote, QuoteItemService.getBaseOriginalPrice(item), true);
    }

    /**
     * Return items list sorted by possibility to apply prioritized rules
     *
     * @param {object} quote
     * @param {object[]} validSalesrule
     * @param {object[]} items
     * @return {Array}
     */
    sortItemsByPriority(quote, validSalesrule, items) {
        let sortedItemIds = [];
        let sortedItems = [];
        if (validSalesrule && validSalesrule.length > 0) {
            let sortedRule = validSalesrule.sort((a, b) => a.sort_order = b.sort_order);
            quote.valid_salesrule = sortedRule;
            sortedRule.sort((a, b) => a.sort_order = b.sort_order).map(rule => {
                items.map(item => {
                    if (rule.valid_item_ids.includes(parseFloat(item.item_id)) &&
                        !sortedItemIds.includes(parseFloat(item.item_id))) {
                        sortedItemIds.push(parseFloat(item.item_id));
                        sortedItems.push(item);
                    }
                    return item;
                });
                return rule;
            })
        }
        items.map(item => {
            if (!sortedItemIds.includes(parseFloat(item.item_id))) {
                sortedItems.push(item);
            }
            return item;
        });
        return sortedItems;
    }

    /**
     * @param {number} key
     * @return {*}
     */
    getRuleItemTotalsInfo(key) {
        if (this.rulesItemTotals[key]) {
            return this.rulesItemTotals[key];
        }
    }

    decrementRuleItemTotalsCount(key) {
        this.rulesItemTotals[key].items_count--;
    }
}


/** @type SalesRuleValidatorService */
let salesRuleValidatorService = ServiceFactory.get(SalesRuleValidatorService);

export default salesRuleValidatorService;