import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import GetPaymentOnlineEpic from "./payment/GetPaymentOnlineEpic";
import GetListPaymentEpic from "./payment/GetListPaymentEpic";
import ClearPaymentDataEpic from "./payment/ClearPaymentDataEpic";
import ProcessPaymentEpic from "./payment/ProcessPaymentEpic";

/**
 * Combine all payment epic
 * @type {Epic<Action, any, any, T> | any}
 */
const paymentEpic = combineEpics(
    EpicFactory.get(GetPaymentOnlineEpic),
    EpicFactory.get(GetListPaymentEpic),
    EpicFactory.get(ClearPaymentDataEpic),
    EpicFactory.get(ProcessPaymentEpic)
);

export default paymentEpic;