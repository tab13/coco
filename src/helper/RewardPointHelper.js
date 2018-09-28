import * as _ from "lodash";
import ConfigHelper from "./ConfigHelper";
import Config from '../config/Config'
import ResetRewardProcessor from "../service/reward-point/quote/processor/ResetRewardProcessor";

export class RewardPointHelper {
    /**
     *
     * @return {number}
     */
    static isEnabledRewardPoint() {
        const isEnabled = ConfigHelper.getConfig('rewardpoints/general/enable');
        return isEnabled * 1;
    }
    /**
     * @return {*|string}
     */
    static getPointName() {
        return ConfigHelper.getConfig("rewardpoints/general/point_name") || "Point";
    }
    /**
     * @return {*|string}
     */
    static getPluralOfPointName() {
        return ConfigHelper.getConfig("rewardpoints/general/point_names") || "Points";
    }

    /**
     *
     * @return {*|string}
     */
    static getEarningRoundMethod() {
        return ConfigHelper.getConfig("rewardpoints/earning/rounding_method") || "round";
    }

    /**
     *
     * @return {*|number}
     */
    static getEarningMaxBalance() {
        return _.toNumber(ConfigHelper.getConfig("rewardpoints/earning/max_balance")) || 0;
    }

    /**
     *
     * @return {*|number}
     */
    static canEarnByTax() {
        return ConfigHelper.getConfig("rewardpoints/earning/by_tax") * 1 || 0;
    }

    /**
     *
     * @return {*|number}
     */
    static canEarnByShipping() {
        return ConfigHelper.getConfig("rewardpoints/earning/by_shipping") * 1 || 0;
    }

    /**
     *
     * @return {*|number}
     */
    static canEarnWhenSpend() {
        return ConfigHelper.getConfig("rewardpoints/earning/earn_when_spend") * 1 || 0;
    }
    /**
     *
     * @return {*|number}
     */
    static allowReceivingPointsWhenInvoiceIsCreated() {
        return ConfigHelper.getConfig("rewardpoints/earning/order_invoice") * 1 || 0;
    }
    /**
     *
     * @return {*|number}
     */
    static holdPointDay() {
        return _.toNumber(ConfigHelper.getConfig("rewardpoints/earning/holding_days")) || 0;
    }
    /**
     *
     * @return {*|number}
     */
    static getMinimumRedeemablePoint() {
        return _.toNumber(ConfigHelper.getConfig("rewardpoints/spending/redeemable_points")) || 0;
    }
    /**
     *
     * @return {*|number}
     */
    static getSpendMaxPointPerOrder() {
        return _.toNumber(ConfigHelper.getConfig("rewardpoints/spending/max_points_per_order")) || 0;
    }
    /**
     *
     * @return {*|number}
     */
    static isSpendMaxPointAsDefault() {
        return ConfigHelper.getConfig("rewardpoints/spending/max_point_default") * 1 || 0;
    }

    /**
     *
     * @return {*|number}
     */
    static allowSpendForShippingFee() {
        return ConfigHelper.getConfig("rewardpoints/spending/spend_for_shipping") * 1 || 0;
    }

    /**
     *
     * @return {array}
     */
    static getRates() {
        return Config.config.rewardpoints_rate
            ? Config.config.rewardpoints_rate.filter(rate => ((rate.status * 1) === 1))
            : [];
    }

    /**
     *
     * @return {array}
     */
    static getEarningRates() {
        return this.getRates().filter(rate => ((rate.direction * 1) === 2));
    }

    /**
     *
     * @return {array}
     */
    static getSpendingRates() {
        return this.getRates().filter(rate => ((rate.direction * 1) === 1));
    }

    /**
     *
     * @param number
     * @return {number}
     */
    static round(number) {
        return Math[this.getEarningRoundMethod()](number);
    }

    /**
     *
     * @param order
     * @return {*}
     */
    static filterDataHoldOrder(order) {
        ResetRewardProcessor.execute(order);

        delete order.rewardpoints_spent;
        delete order.rewardpoints_base_discount;
        delete order.rewardpoints_discount;
        delete order.rewardpoints_earn;
        delete order.rewardpoints_base_amount;
        delete order.rewardpoints_amount;
        delete order.rewardpoints_base_discount_for_shipping;
        delete order.rewardpoints_discount_for_shipping;
        delete order.magestore_base_discount_for_shipping;
        delete order.magestore_discount_for_shipping;
        delete order.magestore_base_discount;
        delete order.magestore_discount;
        delete order.base_discount_amount;
        delete order.discount_amount;
        order.addresses.map(address => {
            delete address.rewardpoints_spent;
            delete address.rewardpoints_base_discount;
            delete address.rewardpoints_discount;
            delete address.rewardpoints_base_amount;
            delete address.rewardpoints_amount;
            delete address.magestore_base_discount_for_shipping;
            delete address.magestore_discount_for_shipping;
            delete address.rewardpoints_base_discount_for_shipping;
            delete address.rewardpoints_discount_for_shipping;
            delete address.magestore_base_discount;
            delete address.magestore_discount;
            delete address.rewardpoints_earn;
            delete address.base_discount_amount;
            delete address.discount_amount;
            return address;
        });

        delete order.items.map(item => {
            if (!item.product) return item;
            delete item.rewardpoints_base_discount;
            delete item.rewardpoints_discount;
            delete item.magestore_base_discount;
            delete item.magestore_discount;
            delete item.rewardpoints_earn;
            delete item.rewardpoints_spent;
            delete item.discount_amount;
            delete item.base_discount_amount;
            delete item.discount_percent;
            return item;
        });

        return order;
    }

}