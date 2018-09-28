import {InvoiceAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";

export class InvoiceShippingService extends InvoiceAbstractTotalService {
    static className = 'InvoiceShippingService';

    /**
     * Collect invoice shipping
     *
     * @param invoice
     * @return {InvoiceShippingService}
     */
    collect(invoice) {
        invoice.shipping_amount = 0;
        invoice.base_shipping_amount = 0;
        let order = invoice.order;

        let orderShippingAmount = order.shipping_amount,
            baseOrderShippingAmount = order.base_shipping_amount,
            shippingInclTax = order.shipping_incl_tax,
            baseShippingInclTax = order.base_shipping_incl_tax;
        if (orderShippingAmount) {
            if (order.shipping_invoiced) {
                return this;
            }
            invoice.shipping_amount = orderShippingAmount;
            invoice.base_shipping_amount = baseOrderShippingAmount;
            invoice.shipping_incl_tax = shippingInclTax;
            invoice.base_shipping_incl_tax = baseShippingInclTax;

            invoice.grand_total = NumberHelper.addNumber(invoice.grand_total, orderShippingAmount);
            invoice.base_grand_total = NumberHelper.addNumber(invoice.base_grand_total, baseOrderShippingAmount);
        }
        return this;
    }
}

/** @type InvoiceShippingService */
let invoiceShippingService = ServiceFactory.get(InvoiceShippingService);

export default invoiceShippingService;