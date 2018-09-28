import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import SearchOrderEpic from "./order/SearchOrderEpic";
import SyncOrderUpdateDataFinishEpic from "./order/SyncOrderUpdateDataFinishEpic";
import TakePaymentEpic from "./order/TakePaymentEpic";
import CreditmemoEpic from "./order/CreditmemoEpic";
import SendEmailOrderEpic from "./order/SendEmailOrderEpic";
import AddCommentOrderEpic from "./order/AddCommentOrderEpic";
import CancelOrderEpic from "./order/CancelOrderEpic";
import SendEmailCreditmemoEpic from "./order/SendEmailCreditmemoEpic";
import CreditmemoCreateCustomerEpic from "./order/CreditmemoCreateCustomerEpic";
import GetListOrderStatusesEpic from "./order/GetListOrderStatusesEpic";
import SyncDeletedOrderFinishEpic from "./order/SyncDeletedOrderFinishEpic";

/**
 * Combine all product epic
 * @type {Epic<Action, any, any, T> | any}
 */
const orderEpic = combineEpics(
    EpicFactory.get(SearchOrderEpic),
    EpicFactory.get(SyncOrderUpdateDataFinishEpic),
    EpicFactory.get(TakePaymentEpic),
    EpicFactory.get(CreditmemoEpic),
    EpicFactory.get(SendEmailOrderEpic),
    EpicFactory.get(AddCommentOrderEpic),
    EpicFactory.get(CancelOrderEpic),
    EpicFactory.get(SendEmailCreditmemoEpic),
    EpicFactory.get(CreditmemoCreateCustomerEpic),
    EpicFactory.get(GetListOrderStatusesEpic),
    EpicFactory.get(SyncDeletedOrderFinishEpic),
);

export default orderEpic;


