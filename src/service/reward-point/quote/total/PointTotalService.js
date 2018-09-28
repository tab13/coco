import * as _ from "lodash";
import {AbstractTotalService} from "../../../checkout/quote/total/AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../helper/NumberHelper";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import {RewardPointHelper} from "../../../../helper/RewardPointHelper";
import QuoteItemService from "../../../checkout/quote/ItemService";
import RewardPointService from "../../RewardPointService";
import SalesRuleUtilityService from "../../../salesrule/UtilityService";

export class PointTotalService extends AbstractTotalService {
    static className = 'PointTotalService';

    code = "rewardpoint";

    /**
     * Collect point
     *
     * @param quote
     * @param address
     * @param total
     * @return {PointTotalService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        if (!quote.customer) return this;
        if (!RewardPointHelper.isEnabledRewardPoint()) return this;
        if (!quote.is_virtual && address.address_type === 'billing') return this;
        if (quote.is_virtual && address.address_type === 'shipping') return this;

        let maxPoints         = RewardPointService.getCustomerPointBalance(quote.customer);
        let baseTotal         = RewardPointService.getQuoteBaseTotal(quote);
        let maxPointsPerOrder = RewardPointHelper.getSpendMaxPointPerOrder();
        if (maxPointsPerOrder) {

            maxPoints = Math.min(maxPointsPerOrder, maxPoints);
        }

        if (!maxPoints || !RewardPointService.customerCanSpendPoint(quote.customer)) return this;

        let baseDiscount = 0;
        let pointUsed    = 0;

        let rule = RewardPointService.getActiveSpendingRate(quote);

        if (rule) {
            let points       = Math.min(RewardPointService.getUsedPoint(), maxPoints);
            let ruleDiscount = RewardPointService.getDiscountAmountByPoint(RewardPointService.getUsedPoint(), quote);

            if (ruleDiscount > 0) {
                baseTotal -= ruleDiscount;
                baseDiscount += ruleDiscount;
                pointUsed += points;

                this.processDiscount(quote, address, total, ruleDiscount, points);

            }
        }


        if (baseTotal < 0.0001) {
            baseDiscount = RewardPointService.getQuoteBaseTotal(quote);
        }

        baseDiscount && this.setBaseDiscount(baseDiscount, total, quote, pointUsed);

        return this;
    }

    /**
     *
     * @param quote
     * @param address
     * @param total
     * @param ruleDiscount
     * @param points
     */
    processDiscount(quote, address, total, ruleDiscount, points) {
        let baseTotalWithoutShipping = RewardPointService.getQuoteBaseTotalWithoutShippingFee(quote);
        let maxDiscountItems         = Math.min(ruleDiscount, baseTotalWithoutShipping);
        quote.items.map(item => {
            if (item.parent_item_id) {
                return item;
            }
            if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
                this.calculateDiscountItem(quote, total, item, baseTotalWithoutShipping, maxDiscountItems, points);
                this.distributeDiscount(quote, item);
                QuoteItemService.getChildrenItems(quote, item).map(child => {
                    this.aggregateItemDiscount(child);
                    return child;
                });
            } else {
                this.calculateDiscountItem(quote, total, item, baseTotalWithoutShipping, maxDiscountItems, points);
                this.aggregateItemDiscount(item);
            }
            return item;
        });

        this.calculateDiscountShipping(address, total, ruleDiscount, maxDiscountItems);
    }

    /**
     *
     * @param quote
     * @param total
     * @param item
     * @param baseTotalWithoutShipping
     * @param maxDiscountItems
     * @param points
     */
    calculateDiscountItem(quote, total, item, baseTotalWithoutShipping, maxDiscountItems, points) {
        let itemPrice                  = SalesRuleUtilityService.getItemPrice(item);
        let baseItemPrice              = SalesRuleUtilityService.getItemBasePrice(item);
        let qty                        = QuoteItemService.getTotalQty(item, quote);
        let baseDiscountAmount         = item.base_discount_amount || 0;
        let baseItemPriceAfterDiscount = baseItemPrice * qty - baseDiscountAmount;
        let discountRate               = baseItemPriceAfterDiscount / baseTotalWithoutShipping;
        let maximumItemDiscount        = maxDiscountItems * discountRate;
        let baseRewardDiscountAmount   = Math.min(baseItemPriceAfterDiscount, maximumItemDiscount);
        baseRewardDiscountAmount       = _.toNumber(CurrencyHelper.round(baseRewardDiscountAmount));

        let rewardDiscountAmount = _.toNumber(CurrencyHelper.convert(maximumItemDiscount));
        rewardDiscountAmount     = Math.min(itemPrice * qty - (item.discount_amount || 0), rewardDiscountAmount);
        rewardDiscountAmount     = _.toNumber(CurrencyHelper.round(rewardDiscountAmount));

        let pointSpent =
                NumberHelper.phpRound(points * baseItemPrice / baseTotalWithoutShipping, 0, 'PHP_ROUND_HALF_DOWN');

        item.rewardpoints_base_discount = _.toNumber(item.rewardpoints_base_discount || 0) + baseRewardDiscountAmount;
        item.rewardpoints_discount      = _.toNumber(item.rewardpoints_discount || 0) + rewardDiscountAmount;
        item.magestore_base_discount    = _.toNumber(item.magestore_base_discount || 0) + baseRewardDiscountAmount;
        item.magestore_discount         = _.toNumber(item.magestore_discount || 0) + rewardDiscountAmount;
        item.rewardpoints_spent         = _.toNumber(item.rewardpoints_spent || 0) + pointSpent;
        item.discount_amount            = _.toNumber(item.discount_amount || 0) + rewardDiscountAmount;
        item.base_discount_amount       = _.toNumber(item.base_discount_amount || 0) + baseRewardDiscountAmount;
    }

    /**
     *
     * @param item
     */
    aggregateItemDiscount(item) {
        this._addAmount(-(item.rewardpoints_discount || 0), this.code);
        this._addBaseAmount(-(item.rewardpoints_base_discount || 0), this.code);
    }

    /**
     *
     * @param quote
     * @param item
     * @return {PointTotalService}
     */
    distributeDiscount(quote, item) {
        let parentBaseRowTotal = item.base_row_total || 0;
        let keys               = [
            'discount_amount',
            'base_discount_amount',
            'original_discount_amount',
            'base_original_discount_amount',
            'rewardpoints_base_discount',
            'rewardpoints_discount',
            'magestore_base_discount',
            'magestore_discount'
        ];
        let roundingDelta      = [];
        keys.forEach(key => {
            roundingDelta[key] = 0.0000001;
        });
        QuoteItemService.getChildrenItems(quote, item).map(child => {
            let ratio = (child.base_row_total || 0) / parentBaseRowTotal;
            keys.forEach(key => {
                if (!item.hasOwnProperty('key')) {
                    return;
                }
                let value        = item[key] * ratio;
                let roundedValue = _.toNumber(CurrencyHelper.round(value + roundingDelta[key]));
                roundingDelta[key] += value - _.toNumber(roundedValue);
                child[key]       = roundedValue;
            });
            return child;
        });

        keys.forEach(key => {
            item[key] = 0;
        });
        return this;
    }

    /**
     *
     * @param address
     * @param total
     * @param ruleDiscount
     * @param maxDiscountItems
     * @return {PointTotalService}
     */
    calculateDiscountShipping(address, total, ruleDiscount, maxDiscountItems) {
        if (ruleDiscount <= maxDiscountItems) return this;
        let shippingAmount     = _.toNumber(address.shipping_amount_for_discount) || 0;
        let baseShippingAmount = _.toNumber(address.base_shipping_amount) || 0;
        if (shippingAmount) {
            baseShippingAmount = _.toNumber(address.base_shipping_amount_for_discount) || 0;
        }

        baseShippingAmount       = baseShippingAmount - _.toNumber(address.base_shipping_discount_amount || 0);
        let baseDiscountShipping = ruleDiscount - maxDiscountItems;
        baseDiscountShipping     = Math.min(baseDiscountShipping, baseShippingAmount);
        let discountShipping     = _.toNumber(CurrencyHelper.convert(baseDiscountShipping));

        total.magestore_base_discount_for_shipping    = _.toNumber(total.magestore_base_discount_for_shipping || 0)
            + baseDiscountShipping;
        total.magestore_discount_for_shipping         = _.toNumber(total.magestore_discount_for_shipping || 0)
            + discountShipping;
        total.rewardpoints_base_discount_for_shipping = _.toNumber(total.rewardpoints_base_discount_for_shipping || 0)
            + baseDiscountShipping;
        total.rewardpoints_discount_for_shipping      = _.toNumber(total.rewardpoints_discount_for_shipping || 0)
            + discountShipping;
        total.base_shipping_discount_amount           = Math.max(
            0,
            _.toNumber(total.base_shipping_discount_amount || 0) + baseDiscountShipping);
        total.shipping_discount_amount                = Math.max(
            0,
            _.toNumber(total.shipping_discount_amount || 0) + discountShipping);

        this._addAmount(-discountShipping, this.code);
        this._addBaseAmount(-baseDiscountShipping, this.code);
    }

    /**
     *
     * @param baseDiscount
     * @param total
     * @param quote
     * @param pointUsed
     */
    setBaseDiscount(baseDiscount, total, quote, pointUsed) {
        let discount                      = _.toNumber(CurrencyHelper.convert(baseDiscount));
        total.discount_amount             = _.toNumber(total.discount_amount || 0) - discount;
        total.base_discount_amount        = _.toNumber(total.base_discount_amount || 0) - baseDiscount;
        total.rewardpoints_spent          = _.toNumber(total.rewardpoints_spent || 0) + pointUsed;
        total.rewardpoints_base_discount  = _.toNumber(total.rewardpoints_base_discount || 0) + baseDiscount;
        total.rewardpoints_discount       = _.toNumber(total.rewardpoints_discount || 0) + discount;
        total.magestore_base_discount     = _.toNumber(total.magestore_base_discount || 0) + baseDiscount;
        total.magestore_discount          = _.toNumber(total.magestore_discount || 0) + discount;
        total.base_subtotal_with_discount = _.toNumber(total.base_subtotal_with_discount || 0) - baseDiscount;
        total.subtotal_with_discount      = _.toNumber(total.subtotal_with_discount || 0) - discount;

        quote.rewardpoints_spent                      = total.rewardpoints_spent;
        quote.rewardpoints_base_discount              = total.rewardpoints_base_discount;
        quote.rewardpoints_discount                   = total.rewardpoints_discount;
        quote.magestore_base_discount                 = total.magestore_base_discount;
        quote.magestore_discount                      = total.magestore_discount;
        quote.magestore_base_discount_for_shipping    = _.toNumber(total.magestore_base_discount_for_shipping) || 0;
        quote.magestore_discount_for_shipping         = _.toNumber(total.magestore_discount_for_shipping) || 0;
        quote.rewardpoints_base_discount_for_shipping = _.toNumber(total.rewardpoints_base_discount_for_shipping) || 0;
        quote.rewardpoints_discount_for_shipping      = _.toNumber(total.rewardpoints_discount_for_shipping) || 0;
    }
}

/** @type {PointTotalService} */
let pointTotalService = ServiceFactory.get(PointTotalService);

export default pointTotalService;