import {Observable} from 'rxjs';
import SyncConstant from "../../constant/SyncConstant";
import SyncAction from "../../action/SyncAction";
import SyncService from "../../../service/sync/SyncService";
import UserService from "../../../service/user/UserService";

/**
 * Receive action type(CHECK_SYNC_DATA_FINISH_RESULT) and send action to update data every 3 seconds
 * @param action$
 */
export default function scheduleUpdateData(action$) {
    let isRunning = false;
    return action$.ofType(SyncConstant.CHECK_SYNC_DATA_FINISH_RESULT)
        .mergeMap(action => {
            if (isRunning) {
                return Observable.empty();
            } else {
                isRunning = true;
                // Reset all error updating
                SyncService.getAll().then(data => {
                    SyncService.saveToDb(data.map(syncData => {
                        syncData.updating = false;
                        return syncData;
                    }));
                });
                return Observable.concat(
                    Observable.of(SyncAction.updateData()),
                    Observable.interval(60000)
                      .takeWhile(() => {
                          let session = UserService.getSession();
                          if (!session) {
                              isRunning = false;
                              return false;
                          }
                          return true;
                      })
                      .map(() => SyncAction.updateData())
                );
            }
        });
}
