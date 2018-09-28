import {CreditmemoAbstractTotalService} from "../../../sales/order/creditmemo/total/AbstractTotalService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import OrderItemService from "../../../sales/order/OrderItemService";
import CreditmemoPriceService from "../../../sales/order/creditmemo/CreditmemoPriceService";
import OrderWeeeDataService from "../../OrderWeeeDataService";
import NumberHelper from "../../../../helper/NumberHelper";
import CreditmemoItemService from "../../../sales/order/creditmemo/CreditmemoItemService";
import QuoteTotalWeeeService from "../../quote/total/WeeeService";
import WeeeHelper from "../../../../helper/WeeeHelper";

export class CreditmemoWeeeService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoWeeeService';

    /**
     * Collect creditmemo weee
     *
     * @param creditmemo
     * @return {CreditmemoWeeeService}
     */
    collect(creditmemo) {
        let totalWeeeAmount = 0,
            baseTotalWeeeAmount = 0,
            totalWeeeAmountInclTax = 0,
            baseTotalWeeeAmountInclTax = 0,
            totalTaxAmount = 0,
            baseTotalTaxAmount = 0;

        let order = creditmemo.order;

        creditmemo.items.forEach(item => {
            let orderItem = item.order_item;
            let orderItemQty = orderItem.qty_ordered;
            if (!orderItemQty || OrderItemService.isDummy(item, order) || item.qty < 0) {
                return false;
            }
            let ratio = item.qty / orderItemQty;

            let orderItemWeeeAmountExclTax = orderItem.weee_tax_applied_row_amount;
            let orderItemBaseWeeeAmountExclTax = orderItem.base_weee_tax_applied_row_amnt;
            let weeeAmountExclTax = CreditmemoPriceService.roundPrice(orderItemWeeeAmountExclTax * ratio);
            let baseWeeeAmountExclTax = CreditmemoPriceService.roundPrice(
                orderItemBaseWeeeAmountExclTax * ratio, 'base'
            );

            let orderItemWeeeAmountInclTax = OrderWeeeDataService.getRowWeeeTaxInclTax(orderItem, order);
            let orderItemBaseWeeeAmountInclTax = OrderWeeeDataService.getRowWeeeTaxInclTax(
                orderItem, order, true
            );
            let weeeAmountInclTax = CreditmemoPriceService.roundPrice(orderItemWeeeAmountInclTax * ratio);
            let baseWeeeAmountInclTax = CreditmemoPriceService.roundPrice(
                orderItemBaseWeeeAmountInclTax * ratio, 'base'
            );

            let itemTaxAmount = NumberHelper.minusNumber(weeeAmountInclTax, weeeAmountExclTax);
            let itemBaseTaxAmount = NumberHelper.minusNumber(baseWeeeAmountInclTax, baseWeeeAmountExclTax);

            let weeeAmountAvailable = OrderWeeeDataService.getWeeeAmountInvoiced(orderItem, order) -
                OrderWeeeDataService.getWeeeAmountRefunded(orderItem, order);
            let baseWeeeAmountAvailable = OrderWeeeDataService.getWeeeAmountInvoiced(orderItem, order, true) -
                OrderWeeeDataService.getWeeeAmountRefunded(orderItem, order, true);
            let weeeTaxAmountAvailable = OrderWeeeDataService.getWeeeTaxAmountInvoiced(orderItem, order) -
                OrderWeeeDataService.getWeeeTaxAmountRefunded(orderItem, order);
            let baseWeeeTaxAmountAvailable = OrderWeeeDataService.getWeeeTaxAmountInvoiced(orderItem, order, true) -
                OrderWeeeDataService.getWeeeTaxAmountRefunded(orderItem, order, true);

            if (CreditmemoItemService.isLast(item, creditmemo)) {
                weeeAmountExclTax = weeeAmountAvailable;
                baseWeeeAmountExclTax = baseWeeeAmountAvailable;
                itemTaxAmount = weeeTaxAmountAvailable;
                itemBaseTaxAmount = baseWeeeTaxAmountAvailable;
            } else {
                weeeAmountExclTax = Math.min(weeeAmountExclTax, weeeAmountAvailable);
                baseWeeeAmountExclTax = Math.min(baseWeeeAmountExclTax, baseWeeeAmountAvailable);
                itemTaxAmount = Math.min(itemTaxAmount, weeeTaxAmountAvailable);
                itemBaseTaxAmount = Math.min(itemBaseTaxAmount, baseWeeeTaxAmountAvailable);
            }

            totalWeeeAmount = NumberHelper.addNumber(totalWeeeAmount, weeeAmountExclTax);
            baseTotalWeeeAmount = NumberHelper.addNumber(baseTotalWeeeAmount, baseWeeeAmountExclTax);

            item.weee_tax_applied_row_amount = weeeAmountExclTax;
            item.base_weee_tax_applied_row_amount = baseWeeeAmountExclTax;

            totalTaxAmount = NumberHelper.addNumber(totalTaxAmount, itemTaxAmount);
            baseTotalTaxAmount = NumberHelper.addNumber(baseTotalTaxAmount, itemBaseTaxAmount);
            item.weee_tax_tax_amount = itemTaxAmount;
            item.base_weee_tax_tax_amount = itemBaseTaxAmount;

            let orderItemTaxAmount = NumberHelper.minusNumber(orderItemWeeeAmountInclTax, orderItemWeeeAmountExclTax);

            if (orderItemTaxAmount !== 0) {
                let taxRatio = {};
                if (item.tax_ratio) {
                    taxRatio = JSON.parse(item.tax_ratio);
                }
                taxRatio[QuoteTotalWeeeService.ITEM_TYPE] = itemTaxAmount / orderItemTaxAmount;
                item.tax_ratio = JSON.stringify(taxRatio);
            }

            totalWeeeAmountInclTax = NumberHelper.addNumber(totalWeeeAmountInclTax, weeeAmountInclTax);
            baseTotalWeeeAmountInclTax = NumberHelper.addNumber(baseTotalWeeeAmountInclTax, baseWeeeAmountInclTax);

            let newApplied = [];
            let applied = OrderWeeeDataService.getApplied(orderItem, order);
            applied.forEach(one => {
                let title = one.title;
                one.base_row_amount = CreditmemoPriceService.roundPrice(
                    (one.base_row_amount ? one.base_row_amount : 0) * ratio, title + '_base'
                );
                one.row_amount = CreditmemoPriceService.roundPrice(
                    (one.row_amount ? one.row_amount : 0) * ratio, title
                );
                one.base_row_amount_incl_tax = CreditmemoPriceService.roundPrice(
                    (one.base_row_amount_incl_tax ? one.base_row_amount_incl_tax : 0) * ratio, title + '_base'
                );
                one.row_amount_incl_tax = CreditmemoPriceService.roundPrice(
                    (one.row_amount_incl_tax ? one.row_amount_incl_tax : 0) * ratio, title
                );
                newApplied.push(one);
            });
            OrderWeeeDataService.setApplied(item, newApplied);

            /*Update order item*/
            newApplied = [];
            applied = OrderWeeeDataService.getApplied(orderItem, order);
            applied.forEach(one => {
                one[OrderWeeeDataService.KEY_BASE_WEEE_AMOUNT_REFUNDED] = NumberHelper.addNumber(
                    one[OrderWeeeDataService.KEY_BASE_WEEE_AMOUNT_REFUNDED], baseWeeeAmountExclTax
                );
                one[OrderWeeeDataService.KEY_WEEE_AMOUNT_REFUNDED] = NumberHelper.addNumber(
                    one[OrderWeeeDataService.KEY_WEEE_AMOUNT_REFUNDED], weeeAmountExclTax
                );
                one[OrderWeeeDataService.KEY_BASE_WEEE_TAX_AMOUNT_REFUNDED] = NumberHelper.addNumber(
                    one[OrderWeeeDataService.KEY_BASE_WEEE_TAX_AMOUNT_REFUNDED], itemBaseTaxAmount
                );
                one[OrderWeeeDataService.KEY_WEEE_TAX_AMOUNT_REFUNDED] = NumberHelper.addNumber(
                    one[OrderWeeeDataService.KEY_WEEE_TAX_AMOUNT_REFUNDED], itemTaxAmount
                );
                newApplied.push(one);
            });
            OrderWeeeDataService.setApplied(orderItem, newApplied);
            item.weee_tax_row_disposition = NumberHelper.multipleNumber(item.weee_tax_disposition, item.qty);
            item.base_weee_tax_row_disposition = NumberHelper.multipleNumber(item.base_weee_tax_disposition, item.qty);
        });
        if (WeeeHelper.includeInSubtotalInPOS()) {
            creditmemo.subtotal = NumberHelper.addNumber(creditmemo.subtotal, totalWeeeAmount);
            creditmemo.base_subtotal = NumberHelper.addNumber(creditmemo.base_subtotal, baseTotalWeeeAmount);
        }

        creditmemo.total_weee_amount = totalWeeeAmount;
        creditmemo.base_total_weee_amount = baseTotalWeeeAmount;

        creditmemo.tax_amount = NumberHelper.addNumber(creditmemo.tax_amount, totalTaxAmount);
        creditmemo.base_tax_amount = NumberHelper.addNumber(creditmemo.base_tax_amount, baseTotalTaxAmount);

        creditmemo.subtotal_incl_tax = NumberHelper.addNumber(creditmemo.subtotal_incl_tax, totalWeeeAmountInclTax);
        creditmemo.base_subtotal_incl_tax = NumberHelper.addNumber(
            creditmemo.base_subtotal_incl_tax, baseTotalWeeeAmountInclTax
        );

        creditmemo.grand_total = NumberHelper.addNumber(creditmemo.grand_total, totalWeeeAmount, totalTaxAmount);
        creditmemo.base_grand_total = NumberHelper.addNumber(
            creditmemo.base_grand_total, baseTotalWeeeAmount, baseTotalTaxAmount
        );

        return this;
    }
}

/** @type CreditmemoWeeeService */
let creditmemoWeeeService = ServiceFactory.get(CreditmemoWeeeService);

export default creditmemoWeeeService;