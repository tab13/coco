import {CreditmemoAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import OrderItemService from "../../OrderItemService";
import CreditmemoItemService from "../CreditmemoItemService";
import CreditmemoPriceService from "../CreditmemoPriceService";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import CreateCreditmemoConstant from "../../../../../view/constant/order/creditmemo/CreateCreditmemoConstant";

export class CreditmemoDiscountService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoDiscountService';

    /**
     * Collect creditmemo discount
     *
     * @param creditmemo
     * @return {CreditmemoDiscountService}
     */
    collect(creditmemo) {
        creditmemo.discount_amount = 0;
        creditmemo.base_discount_amount = 0;

        let order = creditmemo.order,
            totalDiscountAmount = 0,
            baseTotalDiscountAmount = 0;

        let shippingAmount = creditmemo.shipping_amount ? +creditmemo.shipping_amount : 0;
        if (typeof creditmemo[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] !== 'undefined') {
            shippingAmount = CurrencyHelper.roundToFloat(
                creditmemo[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY]
            );
        }
        let baseShippingAmount = CurrencyHelper.convertToBase(shippingAmount);
        if (baseShippingAmount) {
            let baseShippingDiscount = NumberHelper.multipleNumber(
                baseShippingAmount,
                order.base_shipping_discount_amount / order.base_shipping_amount
            );
            let shippingDiscount = NumberHelper.multipleNumber(
                shippingAmount,
                order.shipping_discount_amount / order.shipping_amount
            );
            totalDiscountAmount = NumberHelper.addNumber(totalDiscountAmount, shippingDiscount);
            baseTotalDiscountAmount = NumberHelper.addNumber(baseTotalDiscountAmount, baseShippingDiscount);
        }

        creditmemo.items.forEach(item => {
            let orderItem = item.order_item;

            if (OrderItemService.isDummy(orderItem, creditmemo.order)) {
                return false;
            }

            let orderItemDiscount = +orderItem.discount_invoiced;
            let baseOrderItemDiscount = +orderItem.base_discount_invoiced;
            let orderItemQty = orderItem.qty_invoiced;

            if (orderItemDiscount && orderItemQty) {
                let discount = NumberHelper.minusNumber(orderItemDiscount, orderItem.discount_refunded);
                let baseDiscount = NumberHelper.minusNumber(baseOrderItemDiscount, orderItem.base_discount_refunded);
                if (!CreditmemoItemService.isLast(item, creditmemo)) {
                    let availableQty = NumberHelper.minusNumber(orderItemQty, orderItem.qty_refunded);
                    discount = CreditmemoPriceService.roundPrice(discount / availableQty * item.qty, 'regular', true);
                    baseDiscount = CreditmemoPriceService.roundPrice(
                        baseDiscount / availableQty * item.qty, 'base', true
                    );
                }

                item.discount_amount = discount;
                item.base_discount_amount = baseDiscount;

                totalDiscountAmount = NumberHelper.addNumber(totalDiscountAmount, discount);
                baseTotalDiscountAmount = NumberHelper.addNumber(baseTotalDiscountAmount, baseDiscount);
            }
        });

        creditmemo.discount_amount = -totalDiscountAmount;
        creditmemo.base_discount_amount = -baseTotalDiscountAmount;

        creditmemo.grand_total = NumberHelper.minusNumber(creditmemo.grand_total, totalDiscountAmount);
        creditmemo.base_grand_total = NumberHelper.minusNumber(creditmemo.base_grand_total, baseTotalDiscountAmount);

        return this;
    }
}

/** @type CreditmemoDiscountService */
let creditmemoDiscountService = ServiceFactory.get(CreditmemoDiscountService);

export default creditmemoDiscountService;