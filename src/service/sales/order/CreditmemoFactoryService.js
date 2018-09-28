import {AbstractOrderService} from "../AbstractService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import OrderItemService from "./OrderItemService";
import NumberHelper from "../../../helper/NumberHelper";
import CreateCreditmemoConstant from "../../../view/constant/order/creditmemo/CreateCreditmemoConstant";

export class CreditmemoFactoryService extends AbstractOrderService {
    static className = 'CreditmemoFactoryService';

    /**
     * Prepare order creditmemo based on order items and requested params
     *
     * @param creditmemo
     * @param order
     * @param data
     * @return {*}
     */
    createByOrder(creditmemo, order, data = {}) {
        let totalQty = 0;
        creditmemo.items = [];
        creditmemo = this.convertOrderDataToCreditmemo(creditmemo, order);
        let qtys = typeof data.qtys !== 'undefined' ? data.qtys : {};
        order.items.forEach(orderItem => {
            if (!this.canRefundItem(orderItem, order, qtys)) {
                return false;
            }

            let item = this.itemDataToCreditmemoItem(orderItem);
            let qty = 0;

            if (OrderItemService.isDummy(item, order)) {
                let parentQty = 0;
                if (data.qtys && typeof data.qtys[orderItem.parent_item_id] !== 'undefined') {
                    parentQty = data.qtys[orderItem.parent_item_id];
                } else {
                    let parentItem = OrderItemService.getParentItem(orderItem, order);
                    parentQty = parentItem ? OrderItemService.getQtyToRefund(parentItem, order) : 1;
                }
                qty = this.calculateProductOptions(orderItem, parentQty);
            } else {
                if (typeof qtys[orderItem.item_id] !== 'undefined') {
                    qty = +qtys[orderItem.item_id];
                } else if (!Object.keys(qtys).length) {
                    qty = OrderItemService.getQtyToRefund(item, order);
                } else {
                    return false;
                }
            }
            totalQty = NumberHelper.addNumber(totalQty, qty);
            item.qty = qty;
            item.parent_id = creditmemo.id;
            if (!creditmemo.items) {
                creditmemo.items = [];
            }
            creditmemo.items.push(item);
        });
        creditmemo.total_qty = totalQty;

        this.initData(creditmemo, data);

        return creditmemo;
    }

    /**
     * Convert order data to creditmemo
     *
     * @param creditmemo
     * @param order
     * @return {*}
     */
    convertOrderDataToCreditmemo(creditmemo, order) {
        creditmemo.order_id = order.entity_id;
        creditmemo.order_increment_id = order.increment_id;
        /*creditmemo.customer_id = order.customer_id;*/
        creditmemo.billing_address_id = order.billing_address_id;
        creditmemo.shipping_address_id = order.shipping_address_id;
        creditmemo.base_discount_amount = order.base_discount_amount;
        creditmemo.discount_amount = order.discount_amount;
        creditmemo.discount_description = order.discount_description;
        creditmemo.shipping_amount = order.shipping_amount;
        creditmemo.base_shipping_tax_amount = order.base_shipping_tax_amount;
        creditmemo.shipping_tax_amount = order.shipping_tax_amount;
        creditmemo.base_shipping_incl_tax = order.base_shipping_incl_tax;
        creditmemo.base_shipping_discount_amount = order.base_shipping_discount_amount;
        creditmemo.shipping_discount_amount = order.shipping_discount_amount;
        creditmemo.base_currency_code = order.base_currency_code;
        creditmemo.order_currency_code = order.order_currency_code;
        creditmemo.global_currency_code = order.global_currency_code;
        creditmemo.store_currency_code = order.store_currency_code;
        creditmemo.store_to_base_rate = order.store_to_base_rate;
        creditmemo.store_to_order_rate = order.store_to_order_rate;
        creditmemo.base_to_global_rate = order.base_to_global_rate;
        creditmemo.base_to_order_rate = order.base_to_order_rate;

        /** reward point */
        creditmemo[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY]
            = order[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY];
        creditmemo[CreateCreditmemoConstant.RETURN_SPENT_KEY] = order[CreateCreditmemoConstant.RETURN_SPENT_KEY];
        creditmemo[CreateCreditmemoConstant.REWARDPOINTS_EARN]
            = creditmemo[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY];

        return creditmemo;
    }

    /**
     * Check if order item can be refunded
     *
     * @param order
     * @param item
     * @param qtys
     * @return {boolean}
     */
    canRefundItem(item, order, qtys = {}) {
        if (OrderItemService.isDummy(item, order)) {
            if (OrderItemService.getHasChildren(item, order)) {
                let result = false;
                OrderItemService.getChildrenItems(item, order).forEach(child => {
                    if (result) {
                        return true;
                    }
                    if (!qtys || !Object.keys(qtys).length) {
                        if (this.canRefundNoDummyItem(child, order)) {
                            result = true;
                        }
                    } else {
                        if (qtys[child.item_id] && qtys[child.item_id] > 0) {
                            result = true;
                        }
                    }
                });
                return result;
            } else if (item.parent_item_id) {
                let parent = OrderItemService.getParentItem(item, order);
                if (!qtys || !Object.keys(qtys).length) {
                    return this.canRefundNoDummyItem(parent, order);
                } else {
                    return qtys[parent.item_id] && qtys[parent.item_id] > 0;
                }
            }
        } else {
            return this.canRefundNoDummyItem(item, order);
        }
    }

    /**
     *  Check if no dummy order item can be refunded
     *
     * @param item
     * @param order
     * @return {boolean}
     */
    canRefundNoDummyItem(item, order) {
        if (OrderItemService.getQtyToRefund(item, order) < 0) {
            return false;
        }
        return true;
    }

    /**
     * Convert order item object to Creditmemo item
     *
     * @param orderItem
     * @return {{order_item: *, order_item_id: *|null, product_id: *|null|number, sku: *|string, name, description, base_price: *|number, price, base_cost: *, base_price_incl_tax: *|number, price_incl_tax: *|number, weee_tax_applied: *, base_weee_tax_applied_amount: *|number, weee_tax_applied_amount: *|number, base_weee_tax_applied_row_amnt: *|number, weee_tax_applied_row_amount: *|number, base_weee_tax_disposition: *|number, weee_tax_disposition: *|number, base_weee_tax_row_disposition: *|number, weee_tax_row_disposition: *|number}}
     */
    itemDataToCreditmemoItem(orderItem) {
        return {
            order_item: orderItem,
            order_item_id: orderItem.item_id,
            product_id: orderItem.product_id,
            sku: orderItem.sku,
            name: orderItem.name,
            description: orderItem.description,
            base_price: orderItem.base_price,
            price: orderItem.price,
            base_cost: orderItem.base_cost,
            base_price_incl_tax: orderItem.base_price_incl_tax,
            price_incl_tax: orderItem.price_incl_tax,
            weee_tax_applied: orderItem.weee_tax_applied,
            base_weee_tax_applied_amount: orderItem.base_weee_tax_applied_amount,
            weee_tax_applied_amount: orderItem.weee_tax_applied_amount,
            base_weee_tax_applied_row_amnt: orderItem.base_weee_tax_applied_row_amnt,
            weee_tax_applied_row_amount: orderItem.weee_tax_applied_row_amount,
            base_weee_tax_disposition: orderItem.base_weee_tax_disposition,
            weee_tax_disposition: orderItem.weee_tax_disposition,
            base_weee_tax_row_disposition: orderItem.base_weee_tax_row_disposition,
            weee_tax_row_disposition: orderItem.weee_tax_row_disposition,
            pos_base_original_price_excl_tax: orderItem.pos_base_original_price_excl_tax,
            pos_original_price_excl_tax: orderItem.pos_original_price_excl_tax,
            pos_base_original_price_incl_tax: orderItem.pos_base_original_price_incl_tax,
            pos_original_price_incl_tax: orderItem.pos_original_price_incl_tax,
        };
    }

    /**
     * Initialize creditmemo state based on requested parameters
     *
     * @param creditmemo
     * @param data
     */
    initData(creditmemo, data) {
        if (typeof data[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] !== 'undefined') {
            creditmemo[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] =
                +data[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY];
        }
        if (typeof data[CreateCreditmemoConstant.ADJUSTMENT_POSITIVE_KEY] !== 'undefined') {
            creditmemo[CreateCreditmemoConstant.ADJUSTMENT_POSITIVE_KEY] =
                data[CreateCreditmemoConstant.ADJUSTMENT_POSITIVE_KEY];
        }
        if (typeof data[CreateCreditmemoConstant.ADJUSTMENT_NEGATIVE_KEY] !== 'undefined') {
            creditmemo[CreateCreditmemoConstant.ADJUSTMENT_NEGATIVE_KEY] =
                data[CreateCreditmemoConstant.ADJUSTMENT_NEGATIVE_KEY];
        }

        /** reward point */
        if (typeof data[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY] !== 'undefined') {
            creditmemo[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY] =
                data[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY];
            creditmemo[CreateCreditmemoConstant.REWARDPOINTS_EARN] =
                creditmemo[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY];
        }
        if (typeof data[CreateCreditmemoConstant.RETURN_SPENT_KEY] !== 'undefined') {
            creditmemo[CreateCreditmemoConstant.RETURN_SPENT_KEY] =
                data[CreateCreditmemoConstant.RETURN_SPENT_KEY];
        }
    }


    /**
     * @param orderItem
     * @param parentQty
     * @return {*}
     */
    calculateProductOptions(orderItem, parentQty) {
        let qty = parentQty;
        let productOptions = orderItem.product_options ? JSON.parse(orderItem.product_options) : {};
        if (productOptions && productOptions.bundle_selection_attributes) {
            qty = NumberHelper.multipleNumber(productOptions.bundle_selection_attributes.qty, parentQty);
        }
        return qty;
    }
}

/** @type CreditmemoFactoryService */
let creditmemoFactoryService = ServiceFactory.get(CreditmemoFactoryService);

export default creditmemoFactoryService;