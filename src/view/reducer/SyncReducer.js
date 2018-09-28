import SyncConstant from '../constant/SyncConstant';
import LocalStorageHelper from '../../helper/LocalStorageHelper';
import SyncService from "../../service/sync/SyncService";
import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import ActionLogService from "../../service/sync/ActionLogService";

let mode = LocalStorageHelper.get(LocalStorageHelper.MODE);
if (!mode) {
    mode = SyncConstant.ONLINE_MODE;
}

const initialState = {
    mode: mode
};
/**
 * receive action from Sync Action
 * 
 * @param state = {sync: []}
 * @param action
 * @returns {*}
 */
const syncReducer = function (state = initialState, action) {
    switch (action.type) {
        case SyncConstant.CHANGE_MODE:
            //save mode
            SyncService.saveMode(action.mode);
            return {...state, mode: action.mode};
        case SyncConstant.CHECK_SYNC_DATA_FINISH_RESULT:
            //save mode
            SyncService.saveMode(action.isSync);
            return {...state, mode: action.isSync};
        case SyncConstant.SYNC_ACTION_LOG_SUCCESS:
            ActionLogService.saveIsSyncingActionLog(SyncConstant.NOT_SYNCING_ACTION_LOG);
            return state;
        case LogoutPopupConstant.FINISH_LOGOUT_REQUESTING:
            return initialState;
        default:
            return state;
    }
};

export default syncReducer;