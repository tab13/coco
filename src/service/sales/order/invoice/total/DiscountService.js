import {InvoiceAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import OrderItemService from "../../OrderItemService";
import InvoicePriceService from "../InvoicePriceService";
import InvoiceItemService from "../InvoiceItemService";

export class InvoiceDiscountService extends InvoiceAbstractTotalService {
    static className = 'InvoiceDiscountService';

    /**
     * Collect invoice discount
     *
     * @param invoice
     * @return {InvoiceDiscountService}
     */
    collect(invoice) {
        let order = invoice.order;
        invoice.discount_amount = 0;
        invoice.base_discount_amount = 0;

        let totalDiscountAmount = 0,
            baseTotalDiscountAmount = 0;
        let addShippingDiscount = order.base_discount_invoiced && order.base_discount_invoiced > 0;

        if (addShippingDiscount) {
            totalDiscountAmount = NumberHelper.addNumber(totalDiscountAmount, order.shipping_discount_amount);
            baseTotalDiscountAmount = NumberHelper.addNumber(
                baseTotalDiscountAmount, order.base_shipping_discount_amount
            );
        }

        if (invoice.items && invoice.items.length) {
            invoice.items.forEach(item => {
                let orderItem = item.order_item;
                if (OrderItemService.isDummy(orderItem, order)) {
                    return false;
                }
                let orderItemDiscount = orderItem.discount_amount,
                    baseOrderItemDiscount = orderItem.base_discount_amount,
                    qtyOrdered = orderItem.qty_ordered;
                if (orderItemDiscount && qtyOrdered) {
                    let discount = NumberHelper.minusNumber(orderItemDiscount, orderItem.discount_invoiced),
                        baseDiscount = NumberHelper.minusNumber(
                            baseOrderItemDiscount, orderItem.base_discount_invoiced
                        );

                    if (!InvoiceItemService.isLast(item, invoice)) {
                        let activeQty = NumberHelper.minusNumber(qtyOrdered, orderItem.qty_invoiced);
                        discount = InvoicePriceService.roundPrice(discount / activeQty * item.qty, 'regular', true);
                        baseDiscount = InvoicePriceService.roundPrice(
                            baseDiscount / activeQty * item.qty, 'base', true
                        );
                    }

                    item.discount_amount = discount;
                    item.base_discount_amount = baseDiscount;
                    totalDiscountAmount = NumberHelper.addNumber(totalDiscountAmount, discount);
                    baseTotalDiscountAmount = NumberHelper.addNumber(baseTotalDiscountAmount, baseDiscount);
                }
            });
        }

        invoice.discount_amount = -totalDiscountAmount;
        invoice.base_discount_amount = -baseTotalDiscountAmount;

        invoice.grand_total = NumberHelper.minusNumber(invoice.grand_total, totalDiscountAmount);
        invoice.base_grand_total = NumberHelper.minusNumber(invoice.base_grand_total, baseTotalDiscountAmount);
        return this;
    }
}

/** @type InvoiceDiscountService */
let invoiceDiscountService = ServiceFactory.get(InvoiceDiscountService);

export default invoiceDiscountService;