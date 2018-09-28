import {CreditmemoAbstractTotalService} from "../../../../sales/order/creditmemo/total/AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import OrderItemService from "../../../../sales/order/OrderItemService";
import CreditmemoPriceService from "../../../../sales/order/creditmemo/CreditmemoPriceService";

export class CreditmemoGiftcardTotalService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoGiftcardTotalService';

    /**
     * Collect creditmemo grand total
     *
     * @param creditmemo
     * @return {CreditmemoGrandTotalService}
     */
    collect(creditmemo) {
        let order = creditmemo.order;
        if (!order.gift_voucher_discount) {
            return this;
        }
        let totalDiscountAmountGiftvoucher = 0,
            baseTotalDiscountAmountGiftvoucher = 0;

        let shippingAmount = creditmemo.shipping_amount;
        if (shippingAmount) {
            totalDiscountAmountGiftvoucher = NumberHelper.multipleNumber(
                shippingAmount, order.giftvoucher_discount_for_shipping
            ) / order.shipping_amount;
            baseTotalDiscountAmountGiftvoucher = NumberHelper.multipleNumber(
                creditmemo.base_shipping_amount, order.base_giftvoucher_discount_for_shipping
            ) / order.base_shipping_amount;
        }
        if (creditmemo.items && creditmemo.items.length) {
            creditmemo.items.forEach(item => {
                let orderItem = item.order_item;
                if (OrderItemService.isDummy(orderItem, order)) {
                    return false;
                }
                let orderItemDiscountGiftvoucher = orderItem.gift_voucher_discount,
                    baseOrderItemDiscountGiftvoucher = orderItem.base_gift_voucher_discount;
                let orderItemQty = orderItem.qty_ordered;
                let creditmemoItemQty = item.qty;

                if (orderItemDiscountGiftvoucher && orderItemQty) {
                    let discount = CreditmemoPriceService.roundPrice(
                        orderItemDiscountGiftvoucher / orderItemQty * creditmemoItemQty,
                        'regular'
                    );
                    let baseDiscount = CreditmemoPriceService.roundPrice(
                        baseOrderItemDiscountGiftvoucher / orderItemQty * creditmemoItemQty,
                        'regular'
                    );
                    totalDiscountAmountGiftvoucher = NumberHelper.addNumber(totalDiscountAmountGiftvoucher, discount);
                    baseTotalDiscountAmountGiftvoucher = NumberHelper.addNumber(
                        baseTotalDiscountAmountGiftvoucher, baseDiscount
                    );
                }
            });
        }
        creditmemo.gift_voucher_discount = totalDiscountAmountGiftvoucher;
        creditmemo.base_gift_voucher_discount = baseTotalDiscountAmountGiftvoucher;
        if (totalDiscountAmountGiftvoucher) {
            this.calculateRefundAmountForGiftCode(creditmemo)
        }
        return this;
    }

    /**
     * Calculate refund amount for giftcode
     *
     * @param creditmemo
     */
    calculateRefundAmountForGiftCode(creditmemo) {
        let order = creditmemo.order;
        let baseGiftVoucherDiscountTotal = creditmemo.base_gift_voucher_discount;
        let giftVoucherGiftCodesAvailableRefund = order.gift_voucher_gift_codes_available_refund;
        let codes = order.gift_voucher_gift_codes;
        let refundAmounts = [];
        if (codes && giftVoucherGiftCodesAvailableRefund &&
            baseGiftVoucherDiscountTotal && baseGiftVoucherDiscountTotal > 0) {
            giftVoucherGiftCodesAvailableRefund = giftVoucherGiftCodesAvailableRefund.split(',');
            codes.split(',').forEach((code, index) => {
                if (baseGiftVoucherDiscountTotal === 0) {
                    return false;
                }
                let availableRefund = giftVoucherGiftCodesAvailableRefund[index];
                let refundAmount = 0;
                if (+availableRefund < baseGiftVoucherDiscountTotal) {
                    baseGiftVoucherDiscountTotal = NumberHelper.minusNumber(
                        baseGiftVoucherDiscountTotal, availableRefund
                    );
                    refundAmount = availableRefund;
                } else {
                    refundAmount = baseGiftVoucherDiscountTotal;
                    baseGiftVoucherDiscountTotal = 0;
                }
                refundAmounts.push(refundAmount);
            });
        }
        refundAmounts = refundAmounts.join(',');
        creditmemo.gift_voucher_gift_codes = order.gift_voucher_gift_codes;
        creditmemo.gift_voucher_gift_codes_refund_amount = refundAmounts;
    }
}

/** @type CreditmemoGiftcardTotalService */
let creditmemoGiftcardTotalService = ServiceFactory.get(CreditmemoGiftcardTotalService);

export default creditmemoGiftcardTotalService;