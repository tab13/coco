import OrderConstant from '../../../constant/OrderConstant';
import CustomerService from "../../../../service/customer/CustomerService";
import ConfigHelper from "../../../../helper/ConfigHelper";
import PaymentConstant from "../../../constant/PaymentConstant";
import CreditmemoConstant from "../../../constant/order/CreditmemoConstant";
import toInteger from "lodash/toInteger";
import CreateCreditmemoConstant from "../../../constant/order/creditmemo/CreateCreditmemoConstant";
import {RewardPointHelper} from "../../../../helper/RewardPointHelper";
import Action from "../../../action";

/**
 * Receive action type(PLACE_ORDER_AFTER | CREATE_CREDITMEMO_AFTER) and request
 * @param action$
 */
export default function UpdateLoyaltyEpic(action$) {
    return action$.ofType(OrderConstant.PLACE_ORDER_AFTER, CreditmemoConstant.CREATE_CREDITMEMO_AFTER)
        .mergeMap(async action => {
            const object = action.order || action.creditmemo;

            if (Array.isArray(object.payments)) {
                let customerId = object.customer_id;
                if (action.type === CreditmemoConstant.CREATE_CREDITMEMO_AFTER) {
                    customerId = object.order.customer_id;
                }
                let store_credit = object.payments.find((payment) => payment.method === PaymentConstant.STORE_CREDIT);
                if (ConfigHelper.isEnableStoreCredit() && customerId && store_credit) {
                    let base_amount_paid = store_credit.base_amount_paid;
                    if (action.type === CreditmemoConstant.CREATE_CREDITMEMO_AFTER) {
                        base_amount_paid = -base_amount_paid;
                    }
                    await CustomerService.updateCustomerCredit(customerId, base_amount_paid);
                }
            }

            if (!RewardPointHelper.isEnabledRewardPoint()) {
                return Action.empty();
            }

            if (!action.creditmemo) {
                return Action.empty();
            }

            /** reward point  */
            const creditmemo = object;
            const {order}      = creditmemo;

            if (order.customer_is_guest || !order.customer_id) {
                return Action.empty();
            }

            let adjustBalance = -(creditmemo[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY] || 0)
                + toInteger(creditmemo[CreateCreditmemoConstant.RETURN_SPENT_KEY] || 0);

            CustomerService.rewardCustomerWithPoint(
                order.customer_id,
                adjustBalance
            );

            return Action.empty();
        });
}
