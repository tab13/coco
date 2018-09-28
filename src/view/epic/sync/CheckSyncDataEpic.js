import {Observable} from 'rxjs';
import SyncService from "../../../service/sync/SyncService";
import SyncConstant from "../../constant/SyncConstant";
import SyncAction from "../../action/SyncAction";
import ProductService from "../../../service/catalog/ProductService";
import CustomerService from "../../../service/customer/CustomerService";
import OrderService from "../../../service/sales/OrderService";
import SessionHelper from "../../../helper/SessionHelper";

/**
 * Receive action type(CHECK_SYNC_DATA_FINISH) and send action check change mode(online or offline)
 * @param action$
 */
export default function checkSyncData(action$) {
    return action$.ofType(SyncConstant.CHECK_SYNC_DATA_FINISH)
        .mergeMap(action => {
                if (action.isSyncDb) {
                    return SyncService.getAll()
                        .then(async data => {
                            let isFinished = await checkSyncDataFinish(data);
                            return SyncAction.syncDataFinishResult(
                                isFinished ? SyncConstant.OFFLINE_MODE : SyncConstant.ONLINE_MODE
                            );
                        })
                        .catch(error => Observable.of(SyncAction.syncDataFinishResult(SyncConstant.ONLINE_MODE)))
                } else {
                    return Observable.of(SyncAction.syncDataFinishResult(SyncConstant.OFFLINE_MODE));
                }
            }
        );
}

/**
 * Check sync data finish
 * @param data
 * @returns {boolean}
 */
async function checkSyncDataFinish(data) {
    var is_sync_finish = true;

    for (let syncData of data) {
        if (
            syncData.type === SyncConstant.TYPE_SESSION
            && !SessionHelper.isEnableSession()
        ) {
            continue;
        }
        var count = syncData.count;
        var total = syncData.total;
        if (total === SyncConstant.DEFAULT_TOTAL) {
            is_sync_finish = false;
        } else {
            if (count < total) {
                is_sync_finish = false;
            }
        }
    }

    if (is_sync_finish) {
        // Finish sync and start index data
        await ProductService.reindexTable();
        await CustomerService.reindexTable();
        await OrderService.reindexTable();
    }

    return is_sync_finish;
}
