import * as _ from "lodash";
import {AbstractProcessor} from "../../../checkout/quote/processor/AbstractProcessor";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import {RewardPointHelper} from "../../../../helper/RewardPointHelper";
import RewardPointService from "../../../reward-point/RewardPointService";
import QuoteItemService from "../../../checkout/quote/ItemService";

export class EarningPointProcessor extends AbstractProcessor {
    static className = 'EarningPointProcessor';

    /**
     * Collect for address
     *
     * @param {object} quote
     * @return {EarningPointProcessor}
     */
    execute(quote) {
        super.execute(quote);
        if (!RewardPointHelper.isEnabledRewardPoint()) {
            return this;
        }
        quote.addresses.forEach(address => {
            if (!quote.is_virtual && address.address_type === 'billing') return;
            if (quote.is_virtual && address.address_type === 'shipping') return;

            this.setEarningPoints(address, quote);
        });
        return this;
    }

    /**
     *
     * @param address
     * @param quote
     * @return {EarningPointProcessor}
     */
    setEarningPoints(address, quote) {
        if (quote.rewardpoints_spent > 0 && !RewardPointHelper.canEarnWhenSpend()) {
            address.rewardpoints_earn = 0;
            return this;
        }
        let earningPoints = 0;
        if (!address.rewardpoints_earn) {
            earningPoints = RewardPointService.getEarnPointForQuote(quote);
            if (earningPoints > 0) {
                address.rewardpoints_earn = earningPoints;
                quote.rewardpoints_earn   = _.toNumber(quote.rewardpoints_earn || 0) + earningPoints;
            }

            // Update earning point for each items
            this._updateEarningPoints(quote);
        }
        return this;
    }

    /**
     * update earning points for quote items
     * @param quote
     * @return {EarningPointProcessor}
     * @private
     */
    _updateEarningPoints(quote) {
        let items         = quote.items;
        let earningPoints = _.toNumber(quote.rewardpoints_earn);
        if (!items.length || earningPoints <= 0) {
            return this;
        }

        // Calculate total item prices
        let baseItemsPrice = 0;
        let totalItemsQty  = 0;
        let isBaseOnQty    = false;
        items.forEach(item => {
            if (item.parent_item_id) return;
            if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
                QuoteItemService.getChildrenItems(quote, item).map(child => {
                    baseItemsPrice +=
                        item.qty * (child.qty * child.base_price_incl_tax) - (child.base_discount_amount || 0)
                        - (child.magestore_base_discount || 0);
                    totalItemsQty += item.qty * child.qty;
                    return child;
                })
            } else if (item.product) {
                baseItemsPrice += item.qty * item.base_price_incl_tax - (item.base_discount_amount || 0)
                    - (item.magestore_base_discount || 0);
                totalItemsQty += _.toNumber(item.qty);
            }
        });
        let earnPointsForShipping = RewardPointHelper.canEarnByShipping();
        if (earnPointsForShipping) {
            baseItemsPrice += (_.toNumber(quote.base_shipping_amount) || 0)
                + _.toNumber(quote.base_shipping_tax_amount || 0)
                - _.toNumber(quote.magestore_base_discount_for_shipping || 0);
        }
        if (baseItemsPrice < 0.0001) {
            isBaseOnQty = true;
        }

        // Update for items
        let deltaRound    = 0;
        let baseItemPrice = 0;
        items.forEach(item => {
            if (item.parent_item_id) return;
            if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
                QuoteItemService.getChildrenItems(quote, item).map(child => {
                    baseItemPrice       = item.qty * (child.qty * child.base_price_incl_tax)
                        - (child.base_discount_amount || 0)
                        - (child.magestore_base_discount || 0);
                    let itemQty         = item.qty * child.qty;
                    let realItemEarning = 0;

                    if (isBaseOnQty) {
                        realItemEarning = itemQty * earningPoints / totalItemsQty + deltaRound;
                    } else {
                        realItemEarning = baseItemPrice * earningPoints / baseItemsPrice + deltaRound;
                    }

                    let itemEarning         = RewardPointHelper.round(realItemEarning);
                    deltaRound              = realItemEarning - itemEarning;
                    child.rewardpoints_earn = itemEarning;
                    return child;
                });
            } else if (item.product) {
                baseItemPrice       = item.qty * item.base_price_incl_tax - (item.base_discount_amount || 0)
                    - (item.magestore_base_discount || 0);
                let itemQty         = item.qty;
                let realItemEarning = 0;
                if (isBaseOnQty) {
                    realItemEarning = itemQty * earningPoints / totalItemsQty + deltaRound;
                } else {
                    realItemEarning = baseItemPrice * earningPoints / baseItemsPrice + deltaRound;
                }
                let itemEarning        = RewardPointHelper.round(realItemEarning);
                deltaRound             = realItemEarning - itemEarning;
                item.rewardpoints_earn = itemEarning;
            }
        });

        return this;
    }
}

/**
 *
 * @type {EarningPointProcessor}
 */
const earningPointProcessor = ServiceFactory.get(EarningPointProcessor);

export default earningPointProcessor;