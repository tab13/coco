import PaymentConstant from "../../constant/PaymentConstant";
import CheckoutConstant from "../../constant/CheckoutConstant";
import OrderConstant from "../../constant/OrderConstant";
import {Observable} from 'rxjs';
import EpicFactory from "../../../framework/factory/EpicFactory";

import {combineEpics} from "redux-observable";
import AuthorizeNetEpic from "./type/AuthorizeNetEpic";
import BamboraEpic from "./type/BamboraEpic";
import CashEpic from "./type/CashEpic";
import CreditCardEpic from "./type/CreditCardEpic";
import PaypalDirectEpic from "./type/PaypalDirectEpic";
import StripeEpic from "./type/StripeEpic";
import StoreCreditEpic from "./type/StoreCreditEpic";
import TyroEpic from "./type/TyroEpic";
import PaymentHelper from "../../../helper/PaymentHelper";
import AppStore from "../../../view/store/store";
import PaymentAction from "../../action/PaymentAction";
import CreditmemoConstant from "../../constant/order/CreditmemoConstant";

/**
 * checkout place order epic
 * @param action$
 * @returns {*}
 */
export function processPayment(action$) {
    return action$.ofType(
        CheckoutConstant.CHECKOUT_PROCESS_PAYMENT,
        CreditmemoConstant.CREDITMEMO_PROCESS_PAYMENT,
        OrderConstant.TAKE_PAYMENT_PROCESS_PAYMENT
    )
        .mergeMap(action => Observable.from(Promise.resolve())
            .mergeMap(() => {
                const object    = action.quote || action.order || action.creditmemo;
                let listEpic    = [];
                object.payments = object.payments.map((payment, index) => {
                    if (PaymentHelper.PROCESSED_STATUS.indexOf(payment.status) !== -1) {
                        return payment;
                    }

                    if (payment.status === PaymentConstant.PROCESS_PAYMENT_PROCESSING) {
                        return payment;
                    }

                    let existedPendingTerminal = listEpic.find(
                        epic => PaymentHelper.hasUsingTerminal(epic.payment.method)
                    );
                    if (existedPendingTerminal) return payment;

                    if (payment.status === PaymentConstant.PROCESS_PAYMENT_PENDING) {
                        AppStore.dispatch(PaymentAction.paymentStatusToProcessing(payment, index));
                    }

                    payment.status = PaymentConstant.PROCESS_PAYMENT_PROCESSING;
                    listEpic.push(PaymentAction.startProcessSinglePayment(payment, index, object));
                    return payment;
                });

                return [
                    ...listEpic
                ];
            })
        );
}


/**
 * Combine all payment epic
 * @type {Epic<Action, any, any, T> | any}
 */
const paymentEpic = combineEpics(
    EpicFactory.get(AuthorizeNetEpic),
    EpicFactory.get(BamboraEpic),
    EpicFactory.get(CashEpic),
    EpicFactory.get(CreditCardEpic),
    EpicFactory.get(PaypalDirectEpic),
    EpicFactory.get(StripeEpic),
    EpicFactory.get(StoreCreditEpic),
    EpicFactory.get(TyroEpic),
    EpicFactory.get(processPayment)
);

export default paymentEpic;