import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import GetListSessionEpic from "./session/GetListSessionEpic";
import SyncSessionUpdateDataFinishEpic from "./session/SyncSessionUpdateDataFinishEpic";
import SyncDeletedSessionFinishEpic from "./session/SyncDeletedSessionFinishEpic";
import OpenSessionEpic from "./session/OpenSessionEpic";
import PutMoneyInEpic from "./session/PutMoneyInEpic";
import TakeMoneyOutEpic from "./session/TakeMoneyOutEpic";
import SetCloseSessionEpic from "./session/SetCloseSessionEpic";
import GetCurrentSessionEpic from "./session/GetCurrentSessionEpic";
import CloseSessionEpic from "./session/CloseSessionEpic";

const sessionEpic = combineEpics(
    EpicFactory.get(GetListSessionEpic),
    EpicFactory.get(SyncSessionUpdateDataFinishEpic),
    EpicFactory.get(OpenSessionEpic),
    EpicFactory.get(PutMoneyInEpic),
    EpicFactory.get(TakeMoneyOutEpic),
    EpicFactory.get(SetCloseSessionEpic),
    EpicFactory.get(GetCurrentSessionEpic),
    EpicFactory.get(CloseSessionEpic),
    EpicFactory.get(SyncDeletedSessionFinishEpic),
);

export default sessionEpic;


