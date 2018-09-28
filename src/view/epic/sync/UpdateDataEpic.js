import {Observable} from 'rxjs';
import Config from "../../../config/Config";
import SyncService from "../../../service/sync/SyncService";
import SyncConstant from "../../constant/SyncConstant";
import SyncAction from "../../action/SyncAction";
import SessionHelper from "../../../helper/SessionHelper";

/**
 * Receive action type(UPDATE_DATA) and update data from server
 * @param action$
 */
export default function updateData(action$) {
    let counter = 0;
    return action$.ofType(SyncConstant.UPDATE_DATA)
        .mergeMap(action => {
            if (!window.navigator.onLine || Config.mode === SyncConstant.ONLINE_MODE) {
                return Observable.empty();
            }
            return Observable.from(SyncService.getAll())
                .mergeMap(data => {
                    let actions = [];
                    for (let syncData of data) {
                        if (syncData.updating) {
                            continue;
                        }

                        if (
                            syncData.type === SyncConstant.TYPE_SESSION
                            && !SessionHelper.isEnableSession()
                        ) {
                            continue;
                        }

                        // Read config
                        let path = 'webpos/offline/' + syncData.type;
                        if (syncData.type === SyncConstant.TYPE_STOCK) {
                            path += '_item';
                        }
                        path += '_time';

                        let time;
                        if (syncData.type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE) {
                            time = 1;
                        } else {
                            time = parseInt(Config.config.settings.filter(
                                x => x.path === path
                            )[0].value, 10);
                        }

                        if (0 === counter % time) {
                            // Update Data
                            syncData.updating = true;
                            actions.push(syncData);
                        }
                    }
                    counter++; // increase counter every minute

                    // Save updating to database
                    actions.length && SyncService.saveToDb(actions);

                    // Dispatch sync actions
                    return actions.map(syncData => SyncAction.updateDataWithType(syncData));
                })
                .catch(() => Observable.empty());
        });
}
