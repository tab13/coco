import {combineEpics} from 'redux-observable';
import EpicFactory from "../../../framework/factory/EpicFactory";
import PlaceOrderAfterEpic from "./order/PlaceOrderAfterEpic";

/**
 * Combine all order epic
 * @type {Epic<Action, any, any, T> | any}
 */
const productEpic = combineEpics(
    EpicFactory.get(PlaceOrderAfterEpic)
);

export default productEpic;


