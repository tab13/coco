import SearchCustomerEpic from './customer/SearchCustomerEpic';
import {combineEpics} from 'redux-observable';
import EpicFactory from "../../framework/factory/EpicFactory";
import CreateCustomerEpic from "./customer/CreateCustomerEpic";
import EditCustomerEpic from "./customer/EditCustomerEpic";
import SyncCustomerUpdateDataFinishEpic from "./customer/SyncCustomerUpdateDataFinishEpic";
import SyncDeletedCustomerEpic from "./customer/SyncDeletedCustomerEpic";

/**
 * Combine all customer epic
 * @type {Epic<Action, any, any, T> | any}
 */
const customerEpic = combineEpics(
    EpicFactory.get(SearchCustomerEpic),
    EpicFactory.get(CreateCustomerEpic),
    EpicFactory.get(EditCustomerEpic),
    EpicFactory.get(SyncCustomerUpdateDataFinishEpic),
    EpicFactory.get(SyncDeletedCustomerEpic),
);

export default customerEpic;