import {combineEpics} from 'redux-observable';
import EpicFactory from "../../../framework/factory/EpicFactory";
import GiftcardSalesQuoteCollectTotalBeforeEpic from "./giftcard/GiftcardSalesQuoteCollectTotalBeforeEpic";
import RemoveGiftcarDataFromQuoteEpic from "./giftcard/RemoveGiftcarDataFromQuoteEpic";
import GiftcardRefundOperationRefundAfterEpic from "./giftcard/GiftcardRefundOperationRefundAfterEpic";
import GiftcardRefundCreateActionLogBeforeEpic from "./giftcard/GiftcardRefundCreateActionLogBeforeEpic";
import GiftcardQuotePlaceOrderBeforeBeforeEpic from "./giftcard/GiftcardQuotePlaceOrderBeforeBeforeEpic";

/**
 * Combine all order epic
 * @type {Epic<Action, any, any, T> | any}
 */
const giftcardEpic = combineEpics(
    EpicFactory.get(GiftcardSalesQuoteCollectTotalBeforeEpic),
    EpicFactory.get(RemoveGiftcarDataFromQuoteEpic),
    EpicFactory.get(GiftcardRefundOperationRefundAfterEpic),
    EpicFactory.get(GiftcardRefundCreateActionLogBeforeEpic),
    EpicFactory.get(GiftcardQuotePlaceOrderBeforeBeforeEpic)
);

export default giftcardEpic;


