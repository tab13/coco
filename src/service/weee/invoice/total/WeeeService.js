import {InvoiceAbstractTotalService} from "../../../sales/order/invoice/total/AbstractTotalService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import OrderItemService from "../../../sales/order/OrderItemService";
import InvoicePriceService from "../../../sales/order/invoice/InvoicePriceService";
import OrderWeeeDataService from "../../OrderWeeeDataService";
import NumberHelper from "../../../../helper/NumberHelper";
import InvoiceItemService from "../../../sales/order/invoice/InvoiceItemService";
import QuoteTotalWeeeService from "../../quote/total/WeeeService";
import WeeeHelper from "../../../../helper/WeeeHelper";

export class InvoiceWeeeService extends InvoiceAbstractTotalService {
    static className = 'InvoiceWeeeService';

    /**
     * Collect invoice weee
     *
     * @param invoice
     * @return {InvoiceWeeeService}
     */
    collect(invoice) {
        let order = invoice.order;

        let totalWeeeAmount = 0,
            baseTotalWeeeAmount = 0,
            totalWeeeAmountInclTax = 0,
            baseTotalWeeeAmountInclTax = 0,
            totalWeeeTaxAmount = 0,
            baseTotalWeeeTaxAmount = 0;

        if (invoice && invoice.items && invoice.items.length) {
            invoice.items.forEach(item => {
                let orderItem = item.order_item;
                let qtyOrdered = orderItem.qty_ordered;
                if (!qtyOrdered || OrderItemService.isDummy(orderItem, order) || item.qty < 0) {
                    return false;
                }
                let ratio = item.qty / qtyOrdered;

                let orderItemWeeeAmount = orderItem.weee_tax_applied_row_amount,
                    orderItemBaseWeeeAmount = orderItem.base_weee_tax_applied_row_amnt;
                let weeeAmount = InvoicePriceService.roundPrice(orderItemWeeeAmount * ratio),
                    baseWeeeAmount = InvoicePriceService.roundPrice(orderItemBaseWeeeAmount * ratio, 'base');

                let orderItemWeeeInclTax = OrderWeeeDataService.getRowWeeeTaxInclTax(orderItem, order),
                    orderItemBaseWeeeInclTax = OrderWeeeDataService.getRowWeeeTaxInclTax(orderItem, order, true);
                let weeeAmountInclTax = InvoicePriceService.roundPrice(orderItemWeeeInclTax * ratio),
                    baseWeeeAmountInclTax = InvoicePriceService.roundPrice(orderItemBaseWeeeInclTax * ratio, 'base');

                let orderItemWeeeTax = NumberHelper.minusNumber(orderItemWeeeInclTax, orderItemWeeeAmount),
                    orderBaseItemWeeeTax = NumberHelper.minusNumber(orderItemBaseWeeeInclTax, orderItemBaseWeeeAmount),
                    itemWeeeTax = NumberHelper.minusNumber(weeeAmountInclTax, weeeAmount),
                    itemBaseWeeeTax = NumberHelper.minusNumber(baseWeeeAmountInclTax, baseWeeeAmount);

                if (InvoiceItemService.isLast(item, invoice)) {
                    weeeAmount = NumberHelper.minusNumber(
                        orderItemWeeeAmount, OrderWeeeDataService.getWeeeAmountInvoiced(orderItem, order)
                    );
                    baseWeeeAmount = NumberHelper.minusNumber(
                        orderItemBaseWeeeAmount, OrderWeeeDataService.getWeeeAmountInvoiced(orderItem, order, true)
                    );
                    itemWeeeTax = NumberHelper.minusNumber(
                        orderItemWeeeTax, OrderWeeeDataService.getWeeeTaxAmountInvoiced(orderItem, order)
                    );
                    itemBaseWeeeTax = NumberHelper.minusNumber(
                        orderBaseItemWeeeTax, OrderWeeeDataService.getWeeeTaxAmountInvoiced(orderItem, order, true)
                    );
                }
                totalWeeeTaxAmount = NumberHelper.addNumber(totalWeeeTaxAmount, itemWeeeTax);
                baseTotalWeeeTaxAmount = NumberHelper.addNumber(baseTotalWeeeTaxAmount, itemBaseWeeeTax);

                if (orderItemWeeeTax !== 0) {
                    let taxRatio = {};
                    if (item.tax_ratio) {
                        taxRatio = JSON.parse(item.tax_ratio);
                    }
                    taxRatio[QuoteTotalWeeeService.ITEM_TYPE] = itemWeeeTax / orderItemWeeeTax;
                    item.tax_ratio = JSON.stringify(taxRatio);
                }

                item.weee_tax_applied_row_amount = weeeAmount;
                item.base_weee_tax_applied_row_amount = baseWeeeAmount;

                let newApplied = [];
                let applied = OrderWeeeDataService.getApplied(orderItem, order);
                applied.forEach(one => {
                    let title = one.title;
                    one.base_row_amount = InvoicePriceService.roundPrice(
                        (one.base_row_amount ? one.base_row_amount : 0) * ratio, title + '_base'
                    );
                    one.row_amount = InvoicePriceService.roundPrice(
                        (one.row_amount ? one.row_amount : 0) * ratio, title
                    );
                    one.base_row_amount_incl_tax = InvoicePriceService.roundPrice(
                        (one.base_row_amount_incl_tax ? one.base_row_amount_incl_tax : 0) * ratio, title + '_base'
                    );
                    one.row_amount_incl_tax = InvoicePriceService.roundPrice(
                        (one.row_amount_incl_tax ? one.row_amount_incl_tax : 0) * ratio, title
                    );
                    newApplied.push(one);
                });
                OrderWeeeDataService.setApplied(item, newApplied);

                /*Update order item*/
                newApplied = [];
                applied = OrderWeeeDataService.getApplied(orderItem, order);
                applied.forEach(one => {
                    one[OrderWeeeDataService.KEY_BASE_WEEE_AMOUNT_INVOICED] = NumberHelper.addNumber(
                        one[OrderWeeeDataService.KEY_BASE_WEEE_AMOUNT_INVOICED], baseWeeeAmount
                    );
                    one[OrderWeeeDataService.KEY_WEEE_AMOUNT_INVOICED] = NumberHelper.addNumber(
                        one[OrderWeeeDataService.KEY_WEEE_AMOUNT_INVOICED], weeeAmount
                    );
                    one[OrderWeeeDataService.KEY_BASE_WEEE_TAX_AMOUNT_INVOICED] = NumberHelper.addNumber(
                        one[OrderWeeeDataService.KEY_BASE_WEEE_TAX_AMOUNT_INVOICED], itemBaseWeeeTax
                    );
                    one[OrderWeeeDataService.KEY_WEEE_TAX_AMOUNT_INVOICED] = NumberHelper.addNumber(
                        one[OrderWeeeDataService.KEY_WEEE_TAX_AMOUNT_INVOICED], itemWeeeTax
                    );
                    newApplied.push(one);
                });
                OrderWeeeDataService.setApplied(orderItem, newApplied);

                item.weee_tax_row_disposition = NumberHelper.multipleNumber(item.weee_tax_disposition, item.qty);
                item.base_weee_tax_row_disposition = NumberHelper.multipleNumber(
                    item.base_weee_tax_disposition, item.qty
                );

                totalWeeeAmount = NumberHelper.addNumber(totalWeeeAmount, weeeAmount);
                baseTotalWeeeAmount = NumberHelper.addNumber(baseTotalWeeeAmount, baseWeeeAmount);

                totalWeeeAmountInclTax = NumberHelper.addNumber(totalWeeeAmountInclTax, weeeAmountInclTax);
                baseTotalWeeeAmountInclTax = NumberHelper.addNumber(baseTotalWeeeAmountInclTax, baseWeeeAmountInclTax);
            });

            let allowedTax = NumberHelper.addNumber(order.tax_amount, -order.tax_invoiced, -invoice.tax_amount),
                allowedBaseTax = NumberHelper.addNumber(
                    order.base_tax_amount, -order.base_tax_invoiced, -invoice.base_tax_amount
                );
            totalWeeeTaxAmount = Math.min(totalWeeeTaxAmount, allowedTax);
            baseTotalWeeeTaxAmount = Math.min(baseTotalWeeeTaxAmount, allowedBaseTax);

            invoice.tax_amount = NumberHelper.addNumber(invoice.tax_amount, totalWeeeTaxAmount);
            invoice.base_tax_amount = NumberHelper.addNumber(invoice.base_tax_amount, baseTotalWeeeTaxAmount);
        }

        /*Add FPT to subtotal and grand total*/
        if (WeeeHelper.includeInSubtotalInPOS()) {
            let allowedSubtotal = NumberHelper.addNumber(order.subtotal, -order.subtotal_invoiced, -invoice.subtotal);
            let allowedBaseSubtotal = NumberHelper.addNumber(
                order.base_subtotal, -order.base_subtotal_invoiced, -invoice.base_subtotal
            );
            totalWeeeAmount = Math.min(allowedSubtotal, totalWeeeAmount);
            baseTotalWeeeAmount = Math.min(allowedBaseSubtotal, baseTotalWeeeAmount);

            invoice.subtotal = NumberHelper.addNumber(invoice.subtotal, totalWeeeAmount);
            invoice.base_subtotal = NumberHelper.addNumber(invoice.base_subtotal, baseTotalWeeeAmount);
        }

        if (!this.isLast(invoice)) {
            invoice.subtotal_incl_tax = NumberHelper.addNumber(invoice.subtotal_incl_tax, totalWeeeAmountInclTax);
            invoice.base_subtotal_incl_tax = NumberHelper.addNumber(
                invoice.base_subtotal_incl_tax, baseTotalWeeeAmountInclTax
            );
        } else {
            invoice.subtotal_incl_tax = NumberHelper.addNumber(invoice.subtotal_incl_tax, totalWeeeAmount);
            invoice.base_subtotal_incl_tax = NumberHelper.addNumber(
                invoice.base_subtotal_incl_tax, baseTotalWeeeAmount
            );
        }

        invoice.grand_total = NumberHelper.addNumber(invoice.grand_total, totalWeeeAmount, totalWeeeTaxAmount);
        invoice.base_grand_total = NumberHelper.addNumber(
            invoice.base_grand_total, baseTotalWeeeAmount, baseTotalWeeeTaxAmount
        );

        return this;
    }
}

/** @type InvoiceWeeeService */
let invoiceWeeeService = ServiceFactory.get(InvoiceWeeeService);

export default invoiceWeeeService;