import ConfigAction from "../action/ConfigAction";
import ConfigConstant from '../constant/ConfigConstant';
import LoadingAction from "../action/LoadingAction";
import {Observable} from 'rxjs';
import ConfigService from "../../service/config/ConfigService";
import SyncService from "../../service/sync/SyncService";
import ConfigHelper from "../../helper/ConfigHelper";
import OrderConstant from "../constant/OrderConstant";
import LocalStorageHelper from "../../helper/LocalStorageHelper";
import Config from "../../config/Config";
import SearchConstant from "../constant/SearchConstant";
import SyncAction from "../action/SyncAction";
import SyncConstant from "../constant/SyncConstant";
import AppStore from "../../view/store/store";
import SessionConstant from "../constant/SessionConstant";
import PermissionConstant from "../constant/PermissionConstant";
import OrderService from "../../service/sales/OrderService";
import SessionService from "../../service/session/SessionService";

/**
 * Receive action type(GET_CONFIG) and request, response data config
 * @param action$
 */
export default action$ => action$.ofType(ConfigConstant.GET_CONFIG)
    .mergeMap(action => Observable.from(SyncService.getConfig())
        .mergeMap(async (response) => {
            ConfigService.saveToLocalStorage(response);

            if (Config.config) {
                let needSyncData = false;
                // check config sync order
                checkSyncOrderConfig(response);

                // check config barcode
                let isChangeBarcodeConfig = await checkBarcodeConfig(response);
                if (isChangeBarcodeConfig) needSyncData = true;

                // check config sync session
                checkSyncSessionConfig(response);

                // check order permission
                let isChangeSessionPermission = await checkSessionPermission(response);
                if (isChangeSessionPermission) needSyncData = true;

                // check order permission
                let isChangeOrderPermission = await checkOrderPermission(response);
                if (isChangeOrderPermission) needSyncData = true;

                if (needSyncData) {
                    AppStore.dispatch(SyncAction.syncData());
                }
            }

            AppStore.dispatch(LoadingAction.increaseCount());
            return ConfigAction.getConfigResult(response);
        }).catch(error => {
            return Observable.of(ConfigAction.getConfigError(error));
        })
    );

/**
 * check sync order config
 * @param newConfig
 */
function checkSyncOrderConfig(newConfig) {
    let oldConfigOrderSince = ConfigHelper.getConfig(OrderConstant.XML_PATH_CONFIG_SYNC_ORDER_SINCE);
    let newConfigOrderSince = newConfig.settings.find(
        item => item.path === OrderConstant.XML_PATH_CONFIG_SYNC_ORDER_SINCE
    );
    newConfigOrderSince = newConfigOrderSince.value;
    if (oldConfigOrderSince !== newConfigOrderSince) {
        LocalStorageHelper.set(LocalStorageHelper.NEED_SYNC_ORDER, 1);
    }
}

/**
 * check barcode config
 * @param newConfig
 * @return {Promise<boolean>}
 */
async function checkBarcodeConfig(newConfig) {
    let oldConfigBarcode = ConfigHelper.getConfig(SearchConstant.BARCODE_CONFIG);
    let newConfigBarcode = newConfig.settings.find(
        item => item.path === SearchConstant.BARCODE_CONFIG
    );
    newConfigBarcode = newConfigBarcode.value;
    if (oldConfigBarcode !== newConfigBarcode) {
        await SyncService.resetData([SyncConstant.TYPE_PRODUCT]);
        return true;
    }
    return false;
}

/**
 * check sync session config
 * @param newConfig
 */
function checkSyncSessionConfig(newConfig) {
    let oldConfigSessionSince = ConfigHelper.getConfig(SessionConstant.XML_PATH_CONFIG_SYNC_SESSION_SINCE);
    let newConfigSessionSince = newConfig.settings.find(
        item => item.path === SessionConstant.XML_PATH_CONFIG_SYNC_SESSION_SINCE
    );
    newConfigSessionSince = newConfigSessionSince.value;
    if (oldConfigSessionSince !== newConfigSessionSince) {
        LocalStorageHelper.set(LocalStorageHelper.NEED_UPDATE_SESSION, 1);
    }
}

/**
 * check order permission
 * @param newConfig
 * @return {Promise<boolean>}
 */
async function checkOrderPermission(newConfig) {
    let oldPermissions = Config.config.permissions;
    let newPermissions = newConfig.permissions;
    let permissionKeys = [
        PermissionConstant.PERMISSION_MANAGE_ORDER,
        PermissionConstant.PERMISSION_MANAGE_ORDER_CREATED_AT_LOCATION_OF_STAFF,
        PermissionConstant.PERMISSION_MANAGE_ORDER_CREATED_AT_ALL_LOCATION,
        PermissionConstant.PERMISSION_MANAGE_ORDER_THAT_ARE_CREATED_AT_OR_ASSIGNED_TO_LOCATION_OF_STAFF,
        PermissionConstant.PERMISSION_MANAGE_ALL_ORDERS_IN_SYSTEM,
    ];
    for (let permission of permissionKeys) {
        if ((newPermissions.indexOf(permission) > -1) !== (oldPermissions.indexOf(permission) > -1)) {
            await OrderService.clear();
            await AppStore.dispatch(SyncAction.changeMode(SyncConstant.ONLINE_MODE));
            await SyncService.resetData([SyncConstant.TYPE_ORDER]);
            return true;
        }
    }
    return false;
}

/**
 * check session permission
 * @param newConfig
 * @return {Promise<boolean>}
 */
async function checkSessionPermission(newConfig) {
    let oldPermissions = Config.config.permissions;
    let newPermissions = newConfig.permissions;
    let permissionKeys = [
        PermissionConstant.PERMISSION_VIEW_SESSIONS_CREATED_BY_OTHER_STAFF,
    ];
    for (let permission of permissionKeys) {
        if ((newPermissions.indexOf(permission) > -1) !== (oldPermissions.indexOf(permission) > -1)) {
            await SessionService.clear();
            await AppStore.dispatch(SyncAction.changeMode(SyncConstant.ONLINE_MODE));
            await SyncService.resetData([SyncConstant.TYPE_SESSION]);
            return true;
        }
    }
    return false;
}