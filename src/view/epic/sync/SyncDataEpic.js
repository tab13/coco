import {Observable} from 'rxjs';
import SyncService from "../../../service/sync/SyncService";
import SyncConstant from "../../constant/SyncConstant";
import SyncAction from "../../action/SyncAction";
import SessionHelper from "../../../helper/SessionHelper";
import AppStore from "../../store/store";
import Config from "../../../config/Config";

/**
 * Check table Sync and request sync data
 * @param action$
 * @returns {*}
 */
export default function syncData(action$) {
    return action$.ofType(SyncConstant.SYNC_DATA)
        .switchMap(() => Observable.from(SyncService.getAll())
                .switchMap(data => {
                        if (!Config.session) {
                            return Observable.empty();
                        }
                        if (!data.length) {
                            SyncService.setDefaultData().then(() => {
                                AppStore.dispatch(SyncAction.syncData());
                            });
                            return Observable.empty();
                        }
                        // Check have sync data or not
                        let actions = checkSync(data);
                        if (!actions.length) {
                            return Observable.of(SyncAction.checkSyncDataFinish(false));
                        }
                        return actions;
                    }
                )
                .catch(() => Observable.of(SyncAction.syncData()))
        );

}


/**
 * Check have sync data or not
 * @param data
 * @returns {Array}
 */
function checkSync(data) {
    let actions = [];
    for (let syncData of data) {
        let count = syncData.count;
        let total = syncData.total;

        if (
            syncData.type === SyncConstant.TYPE_SESSION
            && !SessionHelper.isEnableSession()
        ) {
            continue;
        }

        if (total === SyncConstant.DEFAULT_TOTAL) {
            actions.push(SyncAction.syncDataWithType(syncData));
        } else {
            if (count < total) {
                actions.push(SyncAction.syncDataWithType(syncData));
            }
        }
    }
    return actions;
}
