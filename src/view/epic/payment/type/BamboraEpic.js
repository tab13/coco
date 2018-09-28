import CheckoutAction from "../../../action/CheckoutAction";
import {Observable} from 'rxjs';
import PaymentService from "../../../../service/payment/PaymentService";
import OrderAction from "../../../action/OrderAction";
import PaymentConstant from "../../../constant/PaymentConstant";
import CreditmemoAction from "../../../action/order/CreditmemoAction";

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const checkoutResult = (result, action) => {
    return [
        CheckoutAction.processSinglePaymentResult(result, action.payment, action.index),
        CheckoutAction.processPayment(action.object)
    ]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const checkoutError = (result, action) => {
    return [
        CheckoutAction.processSinglePaymentError(result, action.payment, action.index),
        OrderAction.processPayment(action.object)
    ]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const takePaymentResult = (result, action) => {
    return [
        OrderAction.processSinglePaymentResult(result, action.payment, action.index),
        OrderAction.processPayment(action.object)
    ];
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const takePaymentError = (result, action) => {
    return [
        OrderAction.processSinglePaymentError(result, action.payment, action.index),
        OrderAction.processPayment(action.object)
    ];
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const creditmemoResult = (result, action) => {
    return [
        CreditmemoAction.processSinglePaymentResult(result, action.payment, action.index),
        CreditmemoAction.processPayment(action.object)
    ]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const creditmemoError = (result, action) => {
    return [
        CreditmemoAction.processSinglePaymentError(result, action.payment, action.index),
        CreditmemoAction.processPayment(action.object)
    ]
};
/**
 * checkout place order bambora payment epic
 *
 * @param action$
 * @returns {*}
 */
export default function bamboraEpic(action$) {
    return action$.ofType(PaymentConstant.START_PROCESS_SINGLE_PAYMENT)
        .mergeMap(action => {
            if (action.payment.method !== PaymentConstant.BAMBORA_INTEGRATION)
                return Observable.empty();
            const isCreditmemo   = action.object.isCreditmemo;
            const isCheckoutMode = !action.object.increment_id && !isCreditmemo;

            if (action.payment.reference_number) {
                let result = {
                    error: false,
                    reference_number: action.payment.reference_number
                };

                if (isCheckoutMode) {
                    return checkoutResult(result, action);
                }

                if (isCreditmemo) {
                    return creditmemoResult(result, action);
                }

                return takePaymentResult(result, action);

            }
            return Observable.from(PaymentService.processSinglePayment(
                action.payment,
                action.index,
                action.object
            )).mergeMap((result) => {
                if (result.error) {
                    if (isCheckoutMode) {
                        return checkoutError(result, action);
                    }

                    if (isCreditmemo) {
                        return creditmemoError(result, action);
                    }

                    return takePaymentError(result, action);
                }

                if (isCheckoutMode) {
                    return checkoutResult(result, action);
                }

                if (isCreditmemo) {
                    return creditmemoResult(result, action);
                }

                return takePaymentResult(result, action);
            }).catch(result => {
                if (isCheckoutMode) {
                    return checkoutError(result, action);
                }

                if (isCreditmemo) {
                    return creditmemoError(result, action);
                }

                return takePaymentError(result, action);
            })

        })

}
