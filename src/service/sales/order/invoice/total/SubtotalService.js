import {InvoiceAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import OrderItemService from "../../OrderItemService";
import InvoiceItemService from "../InvoiceItemService";
import NumberHelper from "../../../../../helper/NumberHelper";

export class InvoiceSubtotalService extends InvoiceAbstractTotalService {
    static className = 'InvoiceSubtotalService';

    /**
     * Collect invoice subtotal
     *
     * @param invoice
     * @return {InvoiceSubtotalService}
     */
    collect(invoice) {
        let subtotal = 0,
            baseSubtotal = 0,
            subtotalInclTax = 0,
            baseSubtotalInclTax = 0;
        let order = invoice.order;
        if (invoice.items && invoice.items.length) {
            invoice.items.forEach(item => {
                if (OrderItemService.isDummy(item.order_item, order)) {
                    return false;
                }

                InvoiceItemService.calcRowTotal(item, invoice);
                subtotal = NumberHelper.addNumber(subtotal, item.row_total);
                baseSubtotal = NumberHelper.addNumber(baseSubtotal, item.base_row_total);
                subtotalInclTax = NumberHelper.addNumber(subtotalInclTax, item.row_total_incl_tax);
                baseSubtotalInclTax = NumberHelper.addNumber(baseSubtotalInclTax, item.base_row_total_incl_tax);
            });
        }
        let allowedSubtotal = NumberHelper.minusNumber(order.subtotal, order.subtotal_invoiced);
        let baseAllowedSubtotal = NumberHelper.minusNumber(order.base_subtotal, order.base_subtotal_invoiced);

        if (this.isLast(invoice)) {
            subtotal = allowedSubtotal;
            baseSubtotal = baseAllowedSubtotal;
        } else {
            subtotal = Math.min(subtotal, allowedSubtotal);
            baseSubtotal = Math.min(baseSubtotal, baseAllowedSubtotal);
        }

        invoice.subtotal = subtotal;
        invoice.base_subtotal = baseSubtotal;
        invoice.subtotal_incl_tax = subtotalInclTax;
        invoice.base_subtotal_incl_tax = baseSubtotalInclTax;

        invoice.grand_total = NumberHelper.addNumber(invoice.grand_total, subtotal);
        invoice.base_grand_total = NumberHelper.addNumber(invoice.base_grand_total, baseSubtotal);
        return this;
    }
}

/** @type InvoiceSubtotalService */
let invoiceSubtotalService = ServiceFactory.get(InvoiceSubtotalService);

export default invoiceSubtotalService;