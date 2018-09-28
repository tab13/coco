import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import GetShippingOnlineEpic from "./shipping/GetShippingOnlineEpic";
import GetListShippingEpic from "./shipping/GetListShippingEpic";
import GetShippingMethodsEpic from "./shipping/GetShippingMethodsEpic";
import SaveShippingEpic from "./shipping/SaveShippingEpic";

/**
 * Combine all shipping epic
 * @type {Epic<Action, any, any, T> | any}
 */
const shippingEpic = combineEpics(
    EpicFactory.get(GetShippingOnlineEpic),
    EpicFactory.get(GetListShippingEpic),
    EpicFactory.get(GetShippingMethodsEpic),
    EpicFactory.get(SaveShippingEpic)
);

export default shippingEpic;
