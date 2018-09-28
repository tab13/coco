import CheckoutAction from "../../../action/CheckoutAction";
import {Observable} from 'rxjs';
import {toast} from "react-toastify";
import i18n from "../../../../config/i18n";
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
    return [CheckoutAction.processSinglePaymentResult(result, action.payment, action.index)]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const checkoutError = (result, action) => {
    return [CheckoutAction.processSinglePaymentError(result, action.payment, action.index)]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const takePaymentResult = (result, action) => {
    return [OrderAction.processSinglePaymentResult(result, action.payment, action.index)]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const takePaymentError = (result, action) => {
    return [OrderAction.processSinglePaymentError(result, action.payment, action.index)]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const creditmemoResult = (result, action) => {
    return [CreditmemoAction.processSinglePaymentResult(result, action.payment, action.index)]
};

/**
 *
 * @param result
 * @param action
 * @return {*[]}
 */
const creditmemoError = (result, action) => {
    return [CreditmemoAction.processSinglePaymentError(result, action.payment, action.index)]
};

/**
 * checkout place order epic
 * @param action$
 * @returns {*}
 */
export default function processPayment(action$) {
    return action$.ofType(PaymentConstant.START_PROCESS_SINGLE_PAYMENT)
        .mergeMap(action => {
            if (action.payment.method !== PaymentConstant.CREDIT_CARD)
                return Observable.empty();
            return Observable.from(PaymentService.processSinglePayment(
                action.payment,
                action.index,
                action.object
            )).mergeMap((result) => {
                const isCreditmemo   = action.object.isCreditmemo;
                const isCheckoutMode = !action.object.increment_id && !isCreditmemo;

                if (result.error) {
                    toast.error(
                        i18n.translator.translate(result.message),
                        {className: 'wrapper-messages messages-warning'}
                    );

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
                const isCreditmemo   = action.object.isCreditmemo;
                const isCheckoutMode = !action.object.increment_id && !isCreditmemo;

                toast.error(
                    i18n.translator.translate(result.message),
                    {className: 'wrapper-messages messages-warning'}
                );


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
