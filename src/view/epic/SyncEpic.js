import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import CheckSyncDataEpic from "./sync/CheckSyncDataEpic";
import SyncDataEpic from "./sync/SyncDataEpic";
import SetDefaultSyncDBEpic from "./sync/SetDefaultSyncDBEpic";
import SyncDataWithTypeEpic from "./sync/SyncDataWithTypeEpic";
import InternetEpic from "./sync/InternetEpic";
import SyncActionLogEpic from "./sync/SyncActionLogEpic";
import ScheduleUpdateDataEpic from "./sync/ScheduleUpdateDataEpic";
import UpdateDataEpic from "./sync/UpdateDataEpic";
import UpdateDataWithTypeEpic from "./sync/UpdateDataWithTypeEpic";
import UpdateProductLocationEpic from "./sync/UpdateProductLocationEpic";

/**
 * Combine all epic sync
 * @type {Epic<Action, any, any, T> | any}
 */
const syncEpic = combineEpics(
    EpicFactory.get(SetDefaultSyncDBEpic),
    EpicFactory.get(SyncDataEpic),
    EpicFactory.get(SyncDataWithTypeEpic),
    EpicFactory.get(CheckSyncDataEpic),
    EpicFactory.get(InternetEpic),
    EpicFactory.get(SyncActionLogEpic),
    EpicFactory.get(ScheduleUpdateDataEpic),
    EpicFactory.get(UpdateDataEpic),
    EpicFactory.get(UpdateDataWithTypeEpic),
    EpicFactory.get(UpdateProductLocationEpic)
);

export default syncEpic;
