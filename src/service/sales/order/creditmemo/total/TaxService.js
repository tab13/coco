import {CreditmemoAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import OrderItemService from "../../OrderItemService";
import NumberHelper from "../../../../../helper/NumberHelper";
import CreditmemoPriceService from "../CreditmemoPriceService";
import CreditmemoItemService from "../CreditmemoItemService";

export class CreditmemoTaxService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoTaxService';

    /**
     * Collect creditmemo tax
     *
     * @param creditmemo
     * @return {CreditmemoTaxService}
     */
    collect(creditmemo) {
        let shippingTaxAmount = 0,
            baseShippingTaxAmount = 0,
            totalTax = 0,
            baseTotalTax = 0,
            totalDiscountTaxCompensation = 0,
            baseTotalDiscountTaxCompensation = 0;
        let order = creditmemo.order;

        creditmemo.items.forEach(item => {
            let orderItem = item.order_item;
            if (OrderItemService.isDummy(orderItem, creditmemo.order) || item.qty <= 0) {
                return false;
            }
            let orderItemTax = orderItem.tax_invoiced ? +orderItem.tax_invoiced : 0;
            let baseOrderItemTax = orderItem.base_tax_invoiced ? +orderItem.base_tax_invoiced : 0;
            let orderItemQty = orderItem.qty_invoiced ? +orderItem.qty_invoiced : 0;

            if (orderItemTax && orderItemQty) {
                /*Check item tax amount*/
                let tax = NumberHelper.minusNumber(orderItemTax, orderItem.tax_refunded);
                let baseTax = NumberHelper.minusNumber(baseOrderItemTax, orderItem.base_tax_refunded);
                let discountTaxCompensation = NumberHelper.minusNumber(
                    orderItem.discount_tax_compensation_invoiced, orderItem.discount_tax_compensation_refunded
                );
                let baseDiscountTaxCompensation = NumberHelper.minusNumber(
                    orderItem.base_discount_tax_compensation_invoiced, orderItem.base_discount_tax_compensation_refunded
                );
                if (!CreditmemoItemService.isLast(item, creditmemo)) {
                    let availableQty = NumberHelper.minusNumber(orderItemQty, orderItem.qty_refunded);
                    tax = CreditmemoPriceService.roundPrice(tax / availableQty * item.qty);
                    baseTax = CreditmemoPriceService.roundPrice(baseTax / availableQty * item.qty, 'base');
                    discountTaxCompensation = CreditmemoPriceService.roundPrice(
                        discountTaxCompensation / availableQty * item.qty
                    );
                    baseDiscountTaxCompensation = CreditmemoPriceService.roundPrice(
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

        let isPartialShippingRefunded = false;

        let orderShippingAmount = order.shipping_amount;
        let baseOrderShippingAmount = order.base_shipping_amount;

        let orderShippingRefundedAmount = order.shipping_refunded;

        let shippingDiscountTaxCompensationAmount = 0,
            baseShippingDiscountTaxCompensationAmount = 0;

        let shippingDelta = NumberHelper.minusNumber(orderShippingAmount, orderShippingRefundedAmount);

        if (shippingDelta > creditmemo.shipping_amount) {
            let part = creditmemo.shipping_amount / orderShippingAmount;
            let basePart = creditmemo.base_shipping_amount / baseOrderShippingAmount;
            shippingTaxAmount = NumberHelper.multipleNumber(order.shipping_tax_amount, part);
            baseShippingTaxAmount = NumberHelper.multipleNumber(order.base_shipping_tax_amount, basePart);
            shippingDiscountTaxCompensationAmount = NumberHelper.multipleNumber(
                order.shipping_discount_tax_compensation_amount, part
            );
            baseShippingDiscountTaxCompensationAmount = NumberHelper.multipleNumber(
                order.base_shipping_discount_tax_compensation_amnt, basePart
            );
            shippingTaxAmount = CreditmemoPriceService.roundPrice(shippingTaxAmount);
            baseShippingTaxAmount = CreditmemoPriceService.roundPrice(baseShippingTaxAmount, 'base');
            shippingDiscountTaxCompensationAmount = CreditmemoPriceService.roundPrice(
                shippingDiscountTaxCompensationAmount
            );
            baseShippingDiscountTaxCompensationAmount = CreditmemoPriceService.roundPrice(
                baseShippingDiscountTaxCompensationAmount, 'base'
            );
            if (part < 1 && order.shipping_tax_amount > 0) {
                isPartialShippingRefunded = true;
            }
        } else if (shippingDelta === (creditmemo.shipping_amount ? +creditmemo.shipping_amount : 0)) {
            shippingTaxAmount = NumberHelper.minusNumber(order.shipping_tax_amount, order.shipping_tax_refunded);
            baseShippingTaxAmount = NumberHelper.minusNumber(
                order.base_shipping_tax_amount, order.base_shipping_tax_refunded
            );
            shippingDiscountTaxCompensationAmount = NumberHelper.minusNumber(
                order.shipping_discount_tax_compensation_amount, order.shipping_discount_tax_compensation_refunded
            );
            baseShippingDiscountTaxCompensationAmount = NumberHelper.minusNumber(
                order.base_shipping_discount_tax_compensation_amnt,
                order.base_shipping_discount_tax_compensation_refunded
            );
        }
        totalTax = NumberHelper.addNumber(totalTax, shippingTaxAmount);
        baseTotalTax = NumberHelper.addNumber(baseTotalTax, baseShippingTaxAmount);
        totalDiscountTaxCompensation = NumberHelper.addNumber(
            totalDiscountTaxCompensation, shippingDiscountTaxCompensationAmount
        );
        baseTotalDiscountTaxCompensation = NumberHelper.addNumber(
            baseTotalDiscountTaxCompensation, baseShippingDiscountTaxCompensationAmount
        );

        let allowedTax = NumberHelper.addNumber(order.tax_invoiced, -order.tax_refunded, -creditmemo.tax_amount);
        let allowedBaseTax = NumberHelper.addNumber(
            order.base_tax_invoiced, -order.base_tax_refunded, -creditmemo.base_tax_amount
        );
        let allowedDiscountTaxCompensation = NumberHelper.addNumber(
            order.discount_tax_compensation_invoiced,
            order.shipping_discount_tax_compensation_amount,
            (order.discount_tax_compensation_refunded ? -order.discount_tax_compensation_refunded : 0),
            (order.shipping_discount_tax_compensation_refunded ?
                -order.shipping_discount_tax_compensation_refunded : 0),
            (creditmemo.discount_tax_compensation_amount ? -creditmemo.discount_tax_compensation_amount : 0),
            (creditmemo.shipping_discount_tax_compensation_amount ?
                -creditmemo.shipping_discount_tax_compensation_amount : 0)
        );
        let allowedBaseDiscountTaxCompensation = NumberHelper.addNumber(
            order.base_discount_tax_compensation_invoiced,
            order.base_shipping_discount_tax_compensation_amnt,
            (order.base_discount_tax_compensation_refunded ? -order.base_discount_tax_compensation_refunded : 0),
            (order.base_shipping_discount_tax_compensation_refunded ?
                -order.base_shipping_discount_tax_compensation_refunded : 0),
            (creditmemo.base_shipping_discount_tax_compensation_amnt ?
                -creditmemo.base_shipping_discount_tax_compensation_amnt : 0),
            (creditmemo.base_discount_tax_compensation_amount ?
                -creditmemo.base_discount_tax_compensation_amount : 0)
        );

        if (CreditmemoItemService.creditmemoIsLast(creditmemo) && !isPartialShippingRefunded) {
            totalTax = allowedTax;
            baseTotalTax = allowedBaseTax;
            totalDiscountTaxCompensation = allowedDiscountTaxCompensation;
            baseTotalDiscountTaxCompensation = allowedBaseDiscountTaxCompensation;
        } else {
            totalTax = Math.min(allowedTax, totalTax);
            baseTotalTax = Math.min(allowedBaseTax, baseTotalTax);
            totalDiscountTaxCompensation = Math.min(allowedDiscountTaxCompensation, totalDiscountTaxCompensation);
            baseTotalDiscountTaxCompensation = Math.min(
                allowedBaseDiscountTaxCompensation, baseTotalDiscountTaxCompensation
            );
        }

        creditmemo.tax_amount = NumberHelper.addNumber(creditmemo.tax_amount, totalTax);
        creditmemo.base_tax_amount = NumberHelper.addNumber(creditmemo.base_tax_amount, baseTotalTax);
        creditmemo.discount_tax_compensation_amount = totalDiscountTaxCompensation;
        creditmemo.base_discount_tax_compensation_amount = baseTotalDiscountTaxCompensation;

        creditmemo.shipping_tax_amount = shippingTaxAmount;
        creditmemo.base_shipping_tax_amount = baseShippingTaxAmount;

        creditmemo.grand_total = NumberHelper.addNumber(creditmemo.grand_total, totalTax, totalDiscountTaxCompensation);
        creditmemo.base_grand_total = NumberHelper.addNumber(
            creditmemo.base_grand_total, baseTotalTax, baseTotalDiscountTaxCompensation
        );
        return this;
    }
}

/** @type CreditmemoTaxService */
let creditmemoTaxService = ServiceFactory.get(CreditmemoTaxService);

export default creditmemoTaxService;