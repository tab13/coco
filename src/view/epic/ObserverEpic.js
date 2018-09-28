import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import OrderEpic from "./observer/OrderEpic";
import stockEpic from "./observer/StockEpic";
import productEpic from "./observer/ProductEpic";
import UpdateLoyaltyEpic from "./observer/loyalty/UpdateLoyaltyEpic";
import UpdateSessionEpic from "./observer/session/UpdateSessionEpic";
import GiftcardEpic from "./observer/GiftcardEpic";

/**
 * Combine all observer epic
 * @type {Epic<Action, any, any, T> | any}
 */
const observerEpic = combineEpics(
    EpicFactory.get(OrderEpic),
    EpicFactory.get(stockEpic),
    EpicFactory.get(productEpic),
    EpicFactory.get(UpdateLoyaltyEpic),
    EpicFactory.get(UpdateSessionEpic),
    EpicFactory.get(GiftcardEpic)
);

export default observerEpic;


