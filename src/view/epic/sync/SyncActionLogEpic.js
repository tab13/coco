import SyncConstant from "../../constant/SyncConstant";
import ActionLogService from "../../../service/sync/ActionLogService";
import Config from "../../../config/Config";
import ActionLogAction from "../../action/ActionLogAction";

/**
 * Sync data action log
 * @param action$
 * @returns {*}
 */
export default function syncActionLog(action$) {
    return action$.ofType(SyncConstant.SYNC_ACTION_LOG)
        .switchMap(async function() {
            if (window.navigator.onLine) {
                if (Config.isSyncingActionLog === SyncConstant.NOT_SYNCING_ACTION_LOG) {
                    try {
                        if (Config.firstLoad) {
                            await ActionLogService.resetActionsStatus();
                            Config.firstLoad = false;
                        }

                        ActionLogService.saveIsSyncingActionLog(SyncConstant.SYNCING_ACTION_LOG);
                        await ActionLogService.syncActionLog();
                        let data = await ActionLogService.getAllDataActionLog();
                        if (data.some(item => item.status === SyncConstant.STATUS_REQUESTING)) {
                            return {type: "[SYNC] EMPTY"};
                        }

                        if (data.some(item => item.status === SyncConstant.STATUS_PENDING)) {
                            ActionLogService.saveIsSyncingActionLog(SyncConstant.NOT_SYNCING_ACTION_LOG);
                            return ActionLogAction.syncActionLog();
                        }
                    } catch (e) {
                        return ActionLogAction.syncActionLogSuccess();
                    }
                }
            }
            return ActionLogAction.syncActionLogSuccess();
        });

}