import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import HoldOrderEpic from "./onHoldOrder/HoldOrderEpic";
import SearchHoldOrderEpic from "./onHoldOrder/SearchHoldOrderEpic";
import SyncHoldOrderUpdateDataFinishEpic from "./onHoldOrder/SyncHoldOrderUpdateDataFinishEpic";
import DeleteHoldOrderEpic from "./onHoldOrder/DeleteHoldOrderEpic";
import SyncDeletedHoldOrderFinishEpic from "./onHoldOrder/SyncDeletedHoldOrderFinishEpic";

const onHoldOrderEpic = combineEpics(
    EpicFactory.get(HoldOrderEpic),
    EpicFactory.get(SearchHoldOrderEpic),
    EpicFactory.get(SyncHoldOrderUpdateDataFinishEpic),
    EpicFactory.get(DeleteHoldOrderEpic),
    EpicFactory.get(SyncDeletedHoldOrderFinishEpic),
);

export default onHoldOrderEpic;


