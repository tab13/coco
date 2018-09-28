import ExportDataPopupAction from "../action/ExportDataPopupAction";
import ErrorLogService from "../../service/sync/ErrorLogService";
import {combineEpics} from 'redux-observable';
import MenuConstant from "../constant/MenuConstant";
import ActionLogService from "../../service/sync/ActionLogService";

/**
 * Send request export whenever user click yes on export data confirmation
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
const exportDataPopup = action$ => action$.ofType(MenuConstant.CLICK_EXPORT_ITEM)
    .mergeMap(async () => {
        try {
            let error_log = await ErrorLogService.getAllDataErrorLog();
            let action_log = await ActionLogService.getListRequestPlaceOrder();
            let all_request = {error_log: error_log.items, action_log: action_log.items};
            return ExportDataPopupAction.finishExportDataRequesting(all_request);
        } catch (e) {
            return ExportDataPopupAction.finishExportDataRequesting({ ok: true });
        }
    });

/**
 * Export combine epics
 *
 * @type {Epic<Action, any, any, Action> | (function(*): Observable<any>)}
 */
export const ExportDataPopupEpic = combineEpics(
    exportDataPopup
);

export default ExportDataPopupEpic;