import {combineEpics} from "redux-observable";
import LoadingConstant from '../constant/LoadingConstant';
import ProductService from "../../service/catalog/ProductService";
import LoadingAction from "../action/LoadingAction";
import SyncService from "../../service/sync/SyncService";
import SyncConstant from "../constant/SyncConstant";
import StockService from "../../service/catalog/StockService";
import OrderService from "../../service/sales/OrderService";
import SessionService from "../../service/session/SessionService";
import SyncAction from "../action/SyncAction";
import Appstore from "../store/store";

/**
 * Clear data of table in indexedDb
 * @param action$
 * @returns {Observable<any>}
 */
function clearDataEpic(action$) {
    return action$.ofType(LoadingConstant.CLEAR_DATA)
        .mergeMap(async function (action) {
            let needSync = SyncService.getNeedSync();
            let needSyncSession = SyncService.getNeedSyncSession();
            let promises = [];
            let changeMode = false;
            if (needSync === '1') {
                // Change mode to online
                changeMode = true;
                promises.push(
                    ProductService.clear(),
                    StockService.clear(),
                    OrderService.clear(),
                    SyncService.resetData([
                        SyncConstant.TYPE_PRODUCT,
                        SyncConstant.TYPE_STOCK,
                        SyncConstant.TYPE_ORDER,
                    ]),
                );
            }
            if (needSyncSession === '1') {
                // Change mode to online
                changeMode = true;
                SessionService.removeCurrentSession();
                promises.push(
                    SessionService.clear(),
                    SyncService.resetData([
                        SyncConstant.TYPE_SESSION,
                    ]),
                );
            }

            if (changeMode) {
                Appstore.dispatch(SyncAction.changeMode(SyncConstant.ONLINE_MODE));
            }

            try {
                await Promise.all(promises);
                SyncService.saveNeedSync(0);
                SyncService.saveNeedSyncSession(0);
                return LoadingAction.clearDataSuccess();
            } catch (e) {
                return LoadingAction.clearDataError(e);
            }
        });
}

export const loadingEpic = combineEpics(
    clearDataEpic
);

export default loadingEpic;