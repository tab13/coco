import {Observable} from 'rxjs';
import SyncService from "../../../service/sync/SyncService";
import SyncConstant from "../../constant/SyncConstant";
import SyncAction from "../../action/SyncAction";

/**
 * Set default data of syncDb
 * @param action$
 * @returns {Observable<any>}
 */
export default function setDefaultSyncDB(action$) {
    return action$.ofType(SyncConstant.SET_DEFAULT_SYNC_DB)
        .mergeMap(() => {
                SyncService.setDefaultData();
                return Observable.of(SyncAction.setDefaultSyncDBSuccess());
            }
        );
}