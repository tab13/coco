import {combineEpics} from 'redux-observable';
import EpicFactory from "../../../framework/factory/EpicFactory";
import syncActionUpdateDataFinishEpic from "./product/SyncActionUpdateDataFinishEpic";
import syncActionDeletedDataFinishEpic from "./product/SyncActionDeletedDataFinishEpic";

/**
 * Combine all product epic
 * @type {Epic<Action, any, any, T> | any}
 */
const productEpic = combineEpics(
    EpicFactory.get(syncActionUpdateDataFinishEpic),
    EpicFactory.get(syncActionDeletedDataFinishEpic),
);

export default productEpic;


