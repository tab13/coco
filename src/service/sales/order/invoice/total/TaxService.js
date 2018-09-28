import {InvoiceAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import OrderItemService from "../../OrderItemService";
import InvoiceItemService from "../InvoiceItemService";
import InvoicePriceService from "../InvoicePriceService";

export class InvoiceTaxService extends InvoiceAbstractTotalService {
    static className = 'InvoiceTaxService';

    /**
     * Collect invoice tax
     *
     * @param invoice
     * @return {InvoiceTaxService}
     */
    collect(invoice) {
        let totalTax = 0,
            baseTotalTax = 0,
            totalDiscountTaxCompensation = 0,
            baseTotalDiscountTaxCompensation = 0;
        let order = invoice.order;

        if (invoice.items && invoice.items.length) {
            invoice.items.forEach(item => {
                let orderItem = item.order_item;
                let qtyOrdered = orderItem.qty_ordered;
                if ((orderItem.tax_amount || orderItem.discount_tax_compensation_amount) && qtyOrdered) {
                    if (OrderItemService.isDummy(orderItem, order) || item.qty <= 0) {
                        return false;
                    }
                    let tax = NumberHelper.minusNumber(orderItem.tax_amount, orderItem.tax_invoiced);
                    let baseTax = NumberHelper.minusNumber(orderItem.base_tax_amount, orderItem.base_tax_invoiced);
                    let discountTaxCompensation = NumberHelper.minusNumber(
                        orderItem.discount_tax_compensation_amount, orderItem.discount_tax_compensation_invoiced
                    );
                    let baseDiscountTaxCompensation = NumberHelper.minusNumber(
                        orderItem.base_discount_tax_compensation_amount,
                        orderItem.base_discount_tax_compensation_invoiced
                    );
                    if (!InvoiceItemService.isLast(item, invoice)) {
                        let availableQty = qtyOrdered - orderItem.qty_invoiced;
                        tax = InvoicePriceService.roundPrice(tax / availableQty * item.qty);
                        baseTax = InvoicePriceService.roundPrice(baseTax / availableQty * item.qty, 'base');
                        discountTaxCompensation = InvoicePriceService.roundPrice(
                            discountTaxCompensation / availableQty * item.qty
                        );
                        baseDiscountTaxCompensation = InvoicePriceService.roundPrice(
                            baseDiscountTaxCompensation / availableQty * item.qty, 'base'
                        );
                    }
                    item.tax_amount = tax;
                    item.base_tax_amount = baseTax;
                    item.discount_tax_compensation_amount = discountTaxCompensation;
                    item.base_discount_tax_compensation_amount = baseDiscountTaxCompensation;

                    totalTax = NumberHelper.addNumber(totalTax, tax);
                    baseTotalTax = NumberHelper.addNumber(baseTotalTax, baseTax);
                    totalDiscountTaxCompensation = NumberHelper.addNumber(
                        totalDiscountTaxCompensation, discountTaxCompensation
                    );
                    baseTotalDiscountTaxCompensation = NumberHelper.addNumber(
                        baseTotalDiscountTaxCompensation, baseDiscountTaxCompensation
                    );
                }
            });
        }

        if (this._canIncludeShipping(invoice)) {
            totalTax = NumberHelper.addNumber(totalTax, order.shipping_tax_amount);
            baseTotalTax = NumberHelper.addNumber(baseTotalTax, order.base_shipping_tax_amount);
            totalDiscountTaxCompensation = NumberHelper.addNumber(
                totalDiscountTaxCompensation, order.shipping_discount_tax_compensation_amount
            );
            baseTotalDiscountTaxCompensation = NumberHelper.addNumber(
                baseTotalDiscountTaxCompensation, order.base_shipping_discount_tax_compensation_amnt
            );
            invoice.shipping_tax_amount = order.shipping_tax_amount;
            invoice.base_shipping_tax_amount = order.base_shipping_tax_amount;
            invoice.base_shipping_tax_amount = order.base_shipping_tax_amount;
            invoice.shipping_discount_tax_compensation_amount = order.shipping_discount_tax_compensation_amount;
            invoice.base_shipping_discount_tax_compensation_amnt = order.base_shipping_discount_tax_compensation_amnt;
        }
        let allowedTax = NumberHelper.minusNumber(order.tax_amount, order.tax_invoiced);
        let baseAllowedTax = NumberHelper.minusNumber(order.base_tax_amount, order.base_tax_invoiced);
        let allowedDiscountTaxCompensation = NumberHelper.addNumber(
            order.discount_tax_compensation_amount,
            order.shipping_discount_tax_compensation_amount,
            -order.discount_tax_compensation_invoiced,
            -order.shipping_discount_tax_compensation_invoiced
        );
        let baseAllowedDiscountTaxCompensation = NumberHelper.addNumber(
            order.base_discount_tax_compensation_amount,
            order.base_shipping_discount_tax_compensation_amnt,
            -order.base_discount_tax_compensation_invoiced,
            -order.base_shipping_discount_tax_compensation_invoiced
        );

        if (this.isLast(invoice)) {
            totalTax = allowedTax;
            baseTotalTax = baseAllowedTax;
            totalDiscountTaxCompensation = allowedDiscountTaxCompensation;
            baseTotalDiscountTaxCompensation = baseAllowedDiscountTaxCompensation;
        } else {
            totalTax = Math.min(totalTax, allowedTax);
            baseTotalTax = Math.min(baseTotalTax, baseAllowedTax);
            totalDiscountTaxCompensation = Math.min(totalDiscountTaxCompensation, allowedDiscountTaxCompensation);
            baseTotalDiscountTaxCompensation = Math.min(
                baseTotalDiscountTaxCompensation, baseAllowedDiscountTaxCompensation
            );
        }

        invoice.tax_amount = totalTax;
        invoice.base_tax_amount = baseTotalTax;
        invoice.discount_tax_compensation_amount = totalDiscountTaxCompensation;
        invoice.base_discount_tax_compensation_amount = baseTotalDiscountTaxCompensation;

        invoice.grand_total = NumberHelper.addNumber(invoice.grand_total, totalTax, totalDiscountTaxCompensation);
        invoice.base_grand_total = NumberHelper.addNumber(
            invoice.base_grand_total, baseTotalTax, baseTotalDiscountTaxCompensation
        );

        return this;
    }

    /**
     * Check if shipping tax calculation can be included to current invoice
     *
     * @param invoice
     * @return {boolean}
     * @private
     */
    _canIncludeShipping(invoice) {
        return invoice.order.shipping_invoiced ? true : false;
    }
}

/** @type InvoiceTaxService */
let invoiceTaxService = ServiceFactory.get(InvoiceTaxService);

export default invoiceTaxService;