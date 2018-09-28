import {combineEpics} from 'redux-observable';
import EpicFactory from "../../../framework/factory/EpicFactory";
import PlaceOrderAfterEpic from "./stock/PlaceOrderAfterEpic";
import CreateCreditmemoAfterEpic from "./stock/CreateCreditmemoAfterEpic";

/**
 * Combine all stock epic
 * @type {Epic<Action, any, any, T> | any}
 */
const stockEpic = combineEpics(
    EpicFactory.get(PlaceOrderAfterEpic),
    EpicFactory.get(CreateCreditmemoAfterEpic)
);

export default stockEpic;


