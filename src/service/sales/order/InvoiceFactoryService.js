import {AbstractOrderService} from "../AbstractService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import OrderItemService from "./OrderItemService";
import NumberHelper from "../../../helper/NumberHelper";

export class InvoiceFactoryService extends AbstractOrderService {
    static className = 'InvoiceFactoryService';

    /**
     * Prepare invoice
     *
     * @param invoice
     * @param order
     * @param qtys
     * @return {Object|*}
     */
    prepareInvoice(invoice, order, qtys = {}) {
        invoice.items = [];
        invoice = this.convertOrderDataToInvoice(invoice, order);
        let totalQty = 0;
        qtys = this.prepareItemsQty(order, qtys);
        if (order.items && order.items.length) {
            order.items.forEach(orderItem => {
                if (!this._canInvoiceItem(orderItem, order)) {
                    return false;
                }
                let item = this.convertOrderItemDataToInvoiceItem(orderItem);
                let qty = 0;
                if (OrderItemService.isDummy(orderItem, order)) {
                    qty = orderItem.qty_ordered ? orderItem.qty_ordered : 1;
                } else if (typeof qtys[orderItem.item_id] !== 'undefined') {
                    qty = +qtys[orderItem.item_id];
                } else if (!Object.keys(qtys).length) {
                    qty = OrderItemService.getQtyToInvoice(orderItem, order);
                }
                qty = Math.max(qty, 0);
                totalQty = NumberHelper.addNumber(totalQty, qty);
                item.qty = qty;
                if (!invoice.items) {
                    invoice.items = [];
                }
                invoice.items.push(item);
            })
        }
        invoice.total_qty = totalQty;
        return invoice;
    }

    /**
     * Convert order object to invoice
     *
     * @param invoice
     * @param order
     * @return {object} invoice
     */
    convertOrderDataToInvoice(invoice, order) {
        invoice.order_id = order.entity_id;
        invoice.customer_id = order.customer_id;
        invoice.billing_address_id = order.billing_address_id;
        invoice.shipping_address_id = order.shipping_address_id;
        invoice.base_currency_code = order.base_currency_code;
        invoice.order_currency_code = order.order_currency_code;
        invoice.global_currency_code = order.global_currency_code;
        invoice.store_currency_code = order.store_currency_code;
        invoice.store_to_base_rate = order.store_to_base_rate;
        invoice.store_to_order_rate = order.store_to_order_rate;
        invoice.base_to_global_rate = order.base_to_global_rate;
        invoice.base_to_order_rate = order.base_to_order_rate;
        invoice.discount_description = order.discount_description;
        return invoice;
    }

    /**
     * Convert order item object to invoice item
     *
     * @param orderItem
     */
    convertOrderItemDataToInvoiceItem(orderItem) {
        let item = {
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
            weee_tax_row_disposition: orderItem.weee_tax_row_disposition
        };
        return item;
    }

    /**
     * Prepare qty to invoice for parent and child products if theirs qty is not specified in initial request.
     *
     * @param order
     * @param qtys
     * @return {{}}
     */
    prepareItemsQty(order, qtys = {}) {
        if (order && order.items && order.items.length) {
            order.items.forEach(item => {
                if (typeof qtys[item.item_id] === 'undefined') {
                    return false;
                }
                if (OrderItemService.isDummy(item, order)) {
                    if (OrderItemService.getHasChildren(item, order)) {
                        OrderItemService.getChildrenItems(item, order).forEach(child => {
                            if (typeof qtys[child.item_id] === 'undefined') {
                                qtys[child.item_id] = OrderItemService.getQtyToInvoice(child, order);
                            }
                        });
                    } else if (item.parent_item_id) {
                        let parent = OrderItemService.getParentItem(item, order);
                        if (typeof qtys[parent.item_id] === 'undefined') {
                            qtys[parent.item_id] = OrderItemService.getQtyToInvoice(parent, order);
                        }
                    }
                }
            });
        }
        return qtys;
    }

    /**
     * Check if order item can be invoiced. Dummy item can be invoiced or with his children or
     * with parent item which is included to invoice
     *
     * @param item
     * @param order
     * @return {boolean}
     * @private
     */
    _canInvoiceItem(item, order) {
        let qtys = {};
        if (OrderItemService.isDummy(item, order)) {
            if (OrderItemService.getHasChildren(item, order)) {
                let result = false;
                OrderItemService.getChildrenItems(item, order).forEach(child => {
                    if (result === true) {
                        return true;
                    }
                    if (!Object.keys(qtys).length) {
                        if (OrderItemService.getQtyToInvoice(child, order) > 0) {
                            result = true;
                        }
                    } else {
                        if (typeof qtys[child.item_id] !== 'undefined' && qtys[child.item_id] > 0) {
                            result = true;
                        }
                    }
                });
                return result;
            } else if (item.parent_item_id) {
                let parent = OrderItemService.getParentItem(item, order);
                if (!Object.keys(qtys).length) {
                    return OrderItemService.getQtyToInvoice(parent, order) > 0;
                } else {
                    return typeof qtys[parent.item_id] !== 'undefined' && qtys[parent.item_id] > 0;
                }
            }
        } else {
            return OrderItemService.getQtyToInvoice(item, order) > 0;
        }
    }
}

/** @type InvoiceFactoryService */
let invoiceFactoryService = ServiceFactory.get(InvoiceFactoryService);

export default invoiceFactoryService;