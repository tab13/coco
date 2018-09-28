import {AbstractOrderService} from "../../AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../helper/NumberHelper";
import OrderItemService from "../OrderItemService";
import InvoicePriceService from "./InvoicePriceService";

export class InvoiceItemService extends AbstractOrderService {
    static className = 'InvoiceItemService';

    /**
     * Invoice item row total calculation
     *
     * @param item
     * @param invoice
     * @return {*}
     */
    calcRowTotal(item, invoice) {
        let orderItem = item.order_item;
        let qtyOrdered = orderItem.qty_ordered;

        let rowTotal = NumberHelper.minusNumber(orderItem.row_total, orderItem.row_invoiced);
        let baseRowTotal = NumberHelper.minusNumber(orderItem.base_row_total, orderItem.base_row_invoiced);
        let rowTotalInclTax = orderItem.row_total_incl_tax;
        let baseRowTotalInclTax = orderItem.base_row_total_incl_tax;

        if (!this.isLast(item, invoice)) {
            let availableQty = NumberHelper.minusNumber(qtyOrdered, orderItem.qty_invoiced);
            rowTotal = InvoicePriceService.roundPrice(rowTotal / availableQty * item.qty);
            baseRowTotal = InvoicePriceService.roundPrice(baseRowTotal / availableQty * item.qty, 'base');
        }

        item.row_total = rowTotal;
        item.base_row_total = baseRowTotal;

        if (rowTotalInclTax && baseRowTotalInclTax) {
            item.row_total_incl_tax = InvoicePriceService.roundPrice(
                rowTotalInclTax / qtyOrdered * item.qty, 'including'
            );
            item.base_row_total_incl_tax = InvoicePriceService.roundPrice(
                baseRowTotalInclTax / qtyOrdered * item.qty, 'including_base'
            );
        }
        return item;
    }

    /**
     * Checking if the item is last
     *
     * @param item
     * @param invoice
     * @return {boolean}
     */
    isLast(item, invoice) {
        return +item.qty === +OrderItemService.getQtyToInvoice(item.order_item, invoice.order);
    }

    /**
     * Applying qty to order item
     *
     * @param item
     * @return {*}
     */
    register(item) {
        let orderItem = item.order_item;
        orderItem.qty_invoiced = NumberHelper.addNumber(orderItem.qty_invoiced, item.qty);
        orderItem.base_tax_invoiced = NumberHelper.addNumber(orderItem.base_tax_invoiced, item.base_tax_amount);
        orderItem.tax_invoiced = NumberHelper.addNumber(orderItem.tax_invoiced, item.tax_amount);
        orderItem.base_discount_tax_compensation_invoiced = NumberHelper.addNumber(
            orderItem.base_discount_tax_compensation_invoiced, item.base_discount_tax_compensation_amount
        );
        orderItem.discount_tax_compensation_invoiced = NumberHelper.addNumber(
            orderItem.discount_tax_compensation_invoiced, item.discount_tax_compensation_amount
        );
        orderItem.base_discount_invoiced = NumberHelper.addNumber(
            orderItem.base_discount_invoiced, item.base_discount_amount
        );
        orderItem.discount_invoiced = NumberHelper.addNumber(orderItem.discount_invoiced, item.discount_amount)
        orderItem.base_row_invoiced = NumberHelper.addNumber(orderItem.base_row_invoiced, item.base_row_total)
        orderItem.row_invoiced = NumberHelper.addNumber(orderItem.row_invoiced, item.row_total);
        return item;
    }
}

/** @type InvoiceItemService */
let invoiceItemService = ServiceFactory.get(InvoiceItemService);

export default invoiceItemService;