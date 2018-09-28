import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import QuoteItemService from "../checkout/quote/ItemService";
import UtilityService from "./UtilityService";
import SalesRuleCalculatorFactoryService from "./rule/action/discount/CalculatorFactoryService";
import CouponTypeConstant from "../../view/constant/salesrule/CouponTypeConstant";
import CurrencyHelper from "../../helper/CurrencyHelper";

export class SalesRuleRulesApplierService extends CoreService {
    static className = 'SalesRuleRulesApplierService';

    /**
     * Apply rule
     *
     * @param quote
     * @param address
     * @param item
     * @return {Array}
     */
    applyRules(quote, address, item) {
        let appliedRuleIds = [];
        if (quote.valid_salesrule && quote.valid_salesrule.length) {
            quote.valid_salesrule.map(rule => {
                if (!rule.valid_item_ids.includes(parseFloat(item.item_id))) {
                    let childrens = QuoteItemService.getChildrenItems(quote, item);
                    let isContinue = true;
                    if (childrens && childrens.length > 0) {
                        let children = childrens.find(childItem =>
                            rule.valid_item_ids.includes(parseFloat(childItem.item_id))
                        );
                        if (children && children.item_id) {
                            isContinue = false;
                        }
                    }
                    if (isContinue) {
                        return false;
                    }
                }
                this.applyRule(quote, item, rule, address);
                appliedRuleIds.push(rule.rule_id);
                return rule;
            });
        }
        return appliedRuleIds;
    }

    /**
     * Add rule discount description label to address object
     *
     * @param {object} address
     * @param {object} rule
     */
    addDiscountDescription(address, rule) {
        let description = address.discount_description;
        let ruleLabel = rule.store_labels && rule.store_labels.length ? rule.store_labels[0] : null;
        let label = '';
        if (ruleLabel) {
            label = ruleLabel;
        } else {
            if (address.coupon_code && address.coupon_code.length) {
                label = address.coupon_code;
            }
        }

        if (label.length) {
            description[rule.rule_id] = label;
        }

        address.discount_description = description;
    }


    /**
     * @param {object} quote
     * @param {object} item
     * @param {object} rule
     * @param {object} address
     */
    applyRule(quote, item, rule, address) {
        let discountData = this.getDiscountData(quote, item, rule, address);
        this.setDiscountData(discountData, item);
        this.maintainAddressCouponCode(address, rule, quote.coupon_code);
        this.addDiscountDescription(address, rule);
    }

    /**
     * @param {object} quote
     * @param {object} item
     * @param {object} rule
     * @param {object} address
     */
    getDiscountData(quote, item, rule, address) {
        let qty = UtilityService.getItemQty(item, quote, rule);
        let discountCalculator = SalesRuleCalculatorFactoryService.create(rule.simple_action);
        qty = discountCalculator.fixQuantity(qty, rule);
        let discountData = discountCalculator.calculate(quote, address, rule, item, qty);
        UtilityService.minFix(discountData, item, qty);
        return discountData;
    }

    /**
     * @param {object} discountData
     * @param {object} item
     */
    setDiscountData(discountData, item) {
        item.discount_amount = CurrencyHelper.roundToFloat(discountData.amount);
        item.base_discount_amount = CurrencyHelper.roundToFloat(discountData.base_amount);
        item.original_discount_amount = CurrencyHelper.roundToFloat(discountData.original_amount);
        item.base_original_discount_amount = CurrencyHelper.roundToFloat(discountData.base_original_amount);
    }

    /**
     * Set coupon code to address
     *
     * @param {object} address
     * @param {object} rule
     * @param {string} couponCode
     * @return {SalesRuleRulesApplierService}
     */
    maintainAddressCouponCode(address, rule, couponCode) {
        if (rule.coupon_type !== CouponTypeConstant.COUPON_TYPE_NO_COUPON) {
            address.coupon_code = couponCode;
        }
        return this;
    }

    /**
     * @param {object} quote
     * @param {object} address
     * @param {object} item
     * @param {Array} appliedRuleIds
     */
    setAppliedRuleIds(quote, address, item, appliedRuleIds) {
        item.applied_rule_ids = appliedRuleIds.join(',');
        address.applied_rule_ids = UtilityService.mergeIds(address.applied_rule_ids, appliedRuleIds);
        quote.applied_rule_ids = UtilityService.mergeIds(quote.applied_rule_ids, appliedRuleIds);
        return this;
    }
}


/** @type SalesRuleRulesApplierService */
let salesRuleRulesApplierService = ServiceFactory.get(SalesRuleRulesApplierService);

export default salesRuleRulesApplierService;