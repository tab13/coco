import {Observable} from "rxjs";
import CreditmemoConstant from "../../../constant/order/CreditmemoConstant";
import NumberHelper from "../../../../helper/NumberHelper";

/**
 * Receive action type(REFUND_OPERATION_REFUND_AFTER
 * @param action$
 */
export default (action$) => {
    return action$.ofType(CreditmemoConstant.REFUND_OPERATION_REFUND_AFTER)
        .mergeMap(action => {
            let creditmemo = action.creditmemo;
            let order = action.order;
            let refundAmounts = creditmemo.gift_voucher_gift_codes_refund_amount;
            let giftVoucherGiftCodesAvailableRefund = order.gift_voucher_gift_codes_available_refund;
            if (refundAmounts && giftVoucherGiftCodesAvailableRefund) {
                refundAmounts = refundAmounts.split(',');
                giftVoucherGiftCodesAvailableRefund = giftVoucherGiftCodesAvailableRefund.split(',');
                if (Array.isArray(refundAmounts) && refundAmounts.length &&
                    Array.isArray(giftVoucherGiftCodesAvailableRefund) && giftVoucherGiftCodesAvailableRefund.length) {
                    refundAmounts.forEach((refundAmount, index) => {
                        if (refundAmount && refundAmount > 0) {
                            let availableRefund = giftVoucherGiftCodesAvailableRefund[index];
                            availableRefund = Math.max(0, NumberHelper.minusNumber(availableRefund, refundAmount));
                            giftVoucherGiftCodesAvailableRefund[index] = availableRefund;
                        }
                    });
                    giftVoucherGiftCodesAvailableRefund.join(',');
                }
            }
            order.gift_voucher_gift_codes_available_refund = giftVoucherGiftCodesAvailableRefund;
            return Observable.empty();
        });
}
