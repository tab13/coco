import {Observable} from "rxjs";
import CreditmemoConstant from "../../../constant/order/CreditmemoConstant";

/**
 * Receive action type(REFUND_OPERATION_REFUND_AFTER
 * @param action$
 */
export default (action$) => {
    return action$.ofType(CreditmemoConstant.CREDITMEMO_CREATE_ACTION_LOG_BEFORE)
        .mergeMap(action => {
            let creditmemo = action.creditmemo;
            delete creditmemo.gift_voucher_gift_codes;
            delete creditmemo.gift_voucher_gift_codes_refund_amount;
            delete creditmemo.gift_voucher_discount;
            delete creditmemo.base_gift_voucher_discount;
            return Observable.empty();
        });
}
