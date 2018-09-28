import {AbstractOrderService} from "../../AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import CreditmemoPriceService from "./CreditmemoPriceService";
import NumberHelper from "../../../../helper/NumberHelper";
import OrderItemService from "../OrderItemService";
import TaxHelper from "../../../../helper/TaxHelper";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import OrderWeeeDataService from "../../../weee/OrderWeeeDataService";
import WeeeHelper from "../../../../helper/WeeeHelper";

export class CreditmemoItemService extends AbstractOrderService {
    static className = 'CreditmemoItemService';

    /**
     * Invoice item row total calculation
     *
     * @param item
     * @param creditmemo
     * @return {CreditmemoItemService}
     */
    calcRowTotal(item, creditmemo) {
        let orderItem = item.order_item;
        let orderItemQtyInvoiced = orderItem.qty_invoiced;

        let rowTotal = NumberHelper.minusNumber(orderItem.row_invoiced, orderItem.amount_refunded);
        let baseRowTotal = NumberHelper.minusNumber(orderItem.base_row_invoiced, orderItem.base_amount_refunded);
        let rowTotalInclTax = orderItem.row_total_incl_tax;
        let baseRowTotalInclTax = orderItem.base_row_total_incl_tax;
        let qty = this.processQty(item, creditmemo);

        if (!this.isLast(item, creditmemo) && orderItemQtyInvoiced > 0 && qty >= 0) {
            let availableQty = NumberHelper.minusNumber(orderItemQtyInvoiced, orderItem.qty_refunded);
            rowTotal = CreditmemoPriceService.roundPrice(rowTotal / availableQty * qty);
            baseRowTotal = CreditmemoPriceService.roundPrice(baseRowTotal / availableQty * qty, 'base');
        }
        item.row_total = rowTotal;
        item.base_row_total = baseRowTotal;

        if (rowTotalInclTax && baseRowTotalInclTax) {
            let orderItemQty = orderItem.qty_ordered;
            item.row_total_incl_tax = CreditmemoPriceService.roundPrice(
                rowTotalInclTax / orderItemQty * qty, 'including'
            );
            item.base_row_total_incl_tax = CreditmemoPriceService.roundPrice(
                baseRowTotalInclTax / orderItemQty * qty, 'including_base'
            );
        }

        return this;
    }

    /**
     * Checks if quantity available for refund
     *
     * @param qty
     * @param orderItem
     * @param creditmemo
     * @return {boolean}
     */
    isQtyAvailable(qty, orderItem, creditmemo) {
        return qty <= OrderItemService.getQtyToRefund(orderItem, creditmemo.order) ||
            OrderItemService.isDummy(orderItem, creditmemo.order);
    }

    /**
     * @param item
     * @param creditmemo
     * @return {number}
     */
    processQty(item, creditmemo) {
        let orderItem = item.order_item;
        let qty = item.qty;
        qty = qty > 0 ? qty : 0;
        if (this.isQtyAvailable(qty, orderItem, creditmemo)) {
            return qty;
        }
        return 0;
    }

    /**
     * Check creditmemo is last
     *
     * @param creditmemo
     */
    creditmemoIsLast(creditmemo) {
        let result = true;
        let items = creditmemo.items;
        if (items && items.length) {
            items.forEach(item => {
                if (!result) {
                    return false;
                }
                if (!this.isLast(item, creditmemo)) {
                    result = false;
                }
            });
        }
        return result;
    }

    /**
     * Checking if the item is last
     *
     * @param item
     * @param creditmemo
     * @return {boolean}
     */
    isLast(item, creditmemo) {
        let orderItem = item.order_item;
        let qty = this.processQty(item, creditmemo);
        return qty === OrderItemService.getQtyToRefund(orderItem, creditmemo.order);
    }

    /**
     * Applying qty to order item
     *
     * @param item
     * @param creditmemo
     */
    register(item, creditmemo) {
        let orderItem = item.order_item;
        let qty = this.processQty(item, creditmemo);
        orderItem.qty_refunded = NumberHelper.addNumber(orderItem.qty_refunded, qty);
        orderItem.tax_refunded = NumberHelper.addNumber(orderItem.tax_refunded, item.tax_amount);
        orderItem.base_tax_refunded = NumberHelper.addNumber(orderItem.base_tax_refunded, item.base_tax_amount);
        orderItem.discount_tax_compensation_refunded = NumberHelper.addNumber(
            orderItem.discount_tax_compensation_refunded, item.discount_tax_compensation_amount
        );
        orderItem.base_discount_tax_compensation_refunded = NumberHelper.addNumber(
            orderItem.base_discount_tax_compensation_refunded, item.base_discount_tax_compensation_amount
        );
        orderItem.amount_refunded = NumberHelper.addNumber(orderItem.amount_refunded, item.row_total);
        orderItem.base_amount_refunded = NumberHelper.addNumber(orderItem.base_amount_refunded, item.base_row_total);
        orderItem.discount_refunded = NumberHelper.addNumber(orderItem.discount_refunded, item.discount_amount);
        orderItem.base_discount_refunded = NumberHelper.addNumber(
            orderItem.base_discount_refunded, item.base_discount_amount
        );
    }

    /**
     * Format price
     *
     * @param price
     * @param creditmemo
     * @return {*|string}
     */
    formatPrice(price, creditmemo) {
        return CurrencyHelper.format(price, creditmemo.order_currency_code, null);
    }

    /**
     * Get creditmemo item price
     *
     * @param item
     * @return {*|number}
     */
    getPrice(item) {
        let displayInclTax = TaxHelper.orderDisplayPriceIncludeTax();
        let price = displayInclTax ? item.price_incl_tax : item.price;
        if (WeeeHelper.priceDisplayTypeIncludeFPT()) {
            if(displayInclTax) {
                let orderItem = item.order_item;
                let weeeTaxAppliedAmounts = OrderWeeeDataService.getApplied(orderItem);
                if(Array.isArray(weeeTaxAppliedAmounts) && weeeTaxAppliedAmounts.length) {
                    weeeTaxAppliedAmounts.forEach(weeeTaxAppliedAmount => {
                        price = NumberHelper.addNumber(price, weeeTaxAppliedAmount.amount_incl_tax);
                    });
                }
            } else {
                price = NumberHelper.addNumber(price, item.weee_tax_applied_amount);
            }

        }
        return price;
    }

    /**
     * Get creditmemo item fpt
     *
     * @param item
     * @return {*|number}
     */
    getFPT(item) {
        return item.weee_tax_applied_row_amount || 0;
    }

    /**
     * Get creditmemo item tax
     *
     * @param item
     * @return {*|number}
     */
    getTax(item) {
        return NumberHelper.addNumber(item.tax_amount, item.weee_tax_tax_amount);
    }

    /**
     * Get creditmemo item discount
     *
     * @param item
     * @return {*|number}
     */
    getDiscount(item) {
        return Math.abs(item.discount_amount) || 0;
    }

    /**
     * Get total amount
     *
     * @param item
     * @return {*}
     */
    getTotalAmount(item, creditmemo) {
        return NumberHelper.addNumber(
            item.row_total,
            -item.discount_amount,
            item.tax_amount,
            item.discount_tax_compensation_amount,
            OrderWeeeDataService.getRowWeeeTaxInclTax(item, creditmemo)
        );
    }
}

/** @type CreditmemoItemService */
let creditmemoItemService = ServiceFactory.get(CreditmemoItemService);

export default creditmemoItemService;