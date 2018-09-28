import QuoteEpic from './checkout/QuoteEpic';
import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import PlaceOrderEpic from "./checkout/PlaceOrderEpic";

/**
 * Combine all product epic
 * @type {Epic<Action, any, any, T> | any}
 */
const checkoutEpic = combineEpics(
    EpicFactory.get(QuoteEpic),
    EpicFactory.get(PlaceOrderEpic)
);

export default checkoutEpic;


