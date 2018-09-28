import {Observable} from 'rxjs';
import SyncService from "../../../service/sync/SyncService";
import QueryService from "../../../service/QueryService";
import SyncConstant from "../../constant/SyncConstant";
import SyncAction from "../../action/SyncAction";
import ProductService from "../../../service/catalog/ProductService";
import CustomerService from "../../../service/customer/CustomerService";
import StockService from "../../../service/catalog/StockService";
import ActionLogService from "../../../service/sync/ActionLogService";
import OrderService from "../../../service/sales/OrderService";
import LocalStorageHelper from "../../../helper/LocalStorageHelper";
import _ from 'lodash';
import SessionService from "../../../service/session/SessionService";
import UserService from "../../../service/user/UserService";
import PermissionConstant from "../../constant/PermissionConstant";
import Permission from "../../../helper/Permission";
import cloneDeep from "lodash/cloneDeep";
import CatalogRuleProductPriceService from "../../../service/catalog/rule/CatalogRuleProductPriceService";

/**
 * Receive action type(UPDATE_DATA_WITH_TYPE) and update data from server
 * @param action$
 */
export default function updateDataWithType(action$) {
    return action$.ofType(SyncConstant.UPDATE_DATA_WITH_TYPE)
        .mergeMap(action => {
            let data = action.data, service, pageSize = 100;
            if (data.type === SyncConstant.TYPE_PRODUCT) {
                // Update product
                service = Observable.of(ProductService);
            } else if (data.type === SyncConstant.TYPE_CUSTOMER) {
                // Update customer
                service = Observable.of(CustomerService);
            } else if (data.type === SyncConstant.TYPE_ORDER) {
                // Update order
                service = Observable.of(OrderService);
            } else if (data.type === SyncConstant.TYPE_STOCK) {
                // Check for order is synced completely
                service = Observable.fromPromise(ActionLogService.getAllDataActionLog())
                    .mergeMap(actions => {
                        let isCompleted = true;
                        for (let index = actions.length; index > 0; ) {
                            if (actions[--index].action_type === SyncConstant.REQUEST_PLACE_ORDER) {
                                isCompleted = false;
                                break;
                            }
                        }
                        if (isCompleted) {
                            return Observable.of(StockService);
                        }
                        return Observable.of(false);
                    })
                    .catch(() => Observable.of(false));
            } else if (data.type === SyncConstant.TYPE_SESSION) {
                // Update session
                service = Observable.of(SessionService);
            } else if (data.type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE) {
                // Update catalog rule product price
                service = Observable.of(CatalogRuleProductPriceService);
                pageSize = 2000;
            }

            // Process Update
            return service.mergeMap(service => {
                if (!service) {
                    return Observable.empty();
                }
                // Update items
                let hasUpdate = false, updated_time;
                let resync = false;
                let needSyncOrder = LocalStorageHelper.get(LocalStorageHelper.NEED_SYNC_ORDER);
                let needUpdateSession = LocalStorageHelper.get(LocalStorageHelper.NEED_UPDATE_SESSION);
                if (
                    (data.type === SyncConstant.TYPE_ORDER && needSyncOrder)
                    || (data.type === SyncConstant.TYPE_SESSION && needUpdateSession)
                ) {
                    resync = true;
                }
                let pipe = Observable.fromPromise(updateItems(service, data, pageSize, 1, resync))
                    .mergeMap(result => {
                        if (result.updated_time) {
                            updated_time = result.updated_time;
                        }
                        let pipe = Observable.of(SyncAction.updateDataFinish(data, result.items));
                        if (result.total) {
                            hasUpdate = true;

                            let total = Math.ceil(result.total / pageSize) + 1;
                            for (let page = 2; page < total; page++) {
                                pipe = Observable.concat(pipe, Observable.fromPromise(
                                    updateItems(service, data, pageSize, page, resync)
                                ).mergeMap(result => {
                                    return Observable.of(SyncAction.updateDataFinish(data, result.items));
                                }));
                            }
                        }
                        if (resync) {
                            if (data.type === SyncConstant.TYPE_ORDER && needSyncOrder) {
                                LocalStorageHelper.remove(LocalStorageHelper.NEED_SYNC_ORDER);
                            } else if (data.type === SyncConstant.TYPE_SESSION && needUpdateSession) {
                                LocalStorageHelper.remove(LocalStorageHelper.NEED_UPDATE_SESSION);
                            }
                        }
                        return pipe;
                    });

                // Update data
                let updated_data_time;
                if (
                    (data.type === SyncConstant.TYPE_CUSTOMER)
                    && service.needUpdateData()
                ) {
                    pipe = Observable.concat(pipe, Observable.fromPromise(
                        updateData(service, data, pageSize, 1)
                    ).mergeMap(result => {
                        if (result.updated_data_time) {
                            updated_data_time = result.updated_data_time;
                        }
                        let pipe = Observable.of(SyncAction.updateDataFinish(data, result.items));
                        if (result.total) {
                            hasUpdate = true;
                            let total = Math.ceil(result.total / pageSize) + 1;
                            for (let page = 2; page < total; page++) {
                                pipe = Observable.concat(pipe, Observable.fromPromise(
                                    updateData(service, data, pageSize, page)
                                ).mergeMap(result => {
                                    return Observable.of(SyncAction.updateDataFinish(data, result.items));
                                }));
                            }
                        }
                        return pipe;
                    }));
                }

                // Delete items
                if (data.type === SyncConstant.TYPE_PRODUCT
                    || data.type === SyncConstant.TYPE_CUSTOMER
                    || data.type === SyncConstant.TYPE_ORDER
                    || data.type === SyncConstant.TYPE_SESSION
                    || data.type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE
                ) {
                    pipe = Observable.concat(pipe, Observable.fromPromise(
                        deleteItems(service, data)
                    ).mergeMap(deleted => {
                        if (deleted.length) {
                            hasUpdate = true;
                            return Observable.of(SyncAction.deleteDataFinish(data, deleted));
                        }
                        return Observable.empty();
                    }));
                }
                // Reindex data
                return Observable.concat(pipe, Observable.create(observer => {
                    if (hasUpdate && service.reindexTable) {
                        service.reindexTable();
                    }
                    if (updated_time) {
                        data.updated_time = updated_time;
                    }
                    if (updated_data_time) {
                        data.updated_data_time = updated_data_time;
                    }
                    // clear updating flag
                    data.updating = false;
                    SyncService.saveToDb([data]);
                    observer.next(SyncAction.updateDataFinishResult(data));
                    observer.complete();
                }));
            }).catch(() => {
                data.updating = false;
                SyncService.saveToDb([data]);
            });
        });
}

/**
 * Update items
 * @param service
 * @param data
 * @param pageSize
 * @param page
 * @param resync
 * @return {Promise<*>}
 */
async function updateItems(service, data, pageSize, page, resync = false) {
    try {
        let queryService = QueryService.reset();
        queryService.setPageSize(pageSize).setCurrentPage(page);

        if (!resync) {
            let updatedAtKey = data.type !== SyncConstant.TYPE_ORDER ? 'updated_at' : 'main_table.updated_at';
            if (data.type === SyncConstant.TYPE_PRODUCT) {
                queryService.addParams('show_option', '1');
            }
            queryService.addFieldToFilter(
                (
                    data.type === SyncConstant.TYPE_STOCK
                    || data.type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE
                ) ? 'updated_time' : updatedAtKey,
                (new Date(data.updated_time)).toISOString().substring(0, 19).replace('T', ' '),
                'gteq'
            );
        }

        if (
            data.type === SyncConstant.TYPE_SESSION
            && !Permission.isAllowed(PermissionConstant.PERMISSION_VIEW_SESSIONS_CREATED_BY_OTHER_STAFF)
        ) {
            queryService.addFieldToFilter('staff_id', UserService.getStaffId(), 'eq');
        }

        let response = await SyncService.getData(data.type, queryService);

        // Process updated_time
        let updated_time = Date.now();
        if (response.hasOwnProperty('cached_at')) {
            updated_time = response.cached_at;
        }

        // prepare session data
        if (data.type === SyncConstant.TYPE_SESSION) {
            response.items = await SessionService.prepareUpdateSessionData(response.items);
            SessionService.checkCurrentSessionIsClosed(response.items);
        }

        // Save items
        await service.saveToDb(response.items);

        return {
            items: response.items,
            updated_time: updated_time,
            total: response.total_count
        };
    } catch (error) {
        return {error: true};
    }
}

/**
 * Delete items and return total deleted
 *
 * @param {object} service
 * @param {object} data
 * @return {Array}
 */
async function deleteItems(service, data) {
    try {
        // Get deleted items
        let response = {};

        if (data.type === SyncConstant.TYPE_ORDER) {
            let queryService = QueryService.reset();
            queryService.addFieldToFilter(
                'updated_at',
                (new Date(data.updated_time)).toISOString().substring(0, 19).replace('T', ' '),
                'gteq'
            );
            queryService = cloneDeep(queryService);
            let deletedOrders = await SyncService.getDeleted(data.type, queryService);
            let outOfPermissionOrders = await OrderService.getOutOfPermissionOrders(queryService);
            let outDateOrders = await OrderService.getOutDateOrders();

            response.ids = _.union(deletedOrders.ids, outDateOrders.ids, outOfPermissionOrders.ids);
        } else if (data.type === SyncConstant.TYPE_SESSION) {
            response = await SessionService.getOutDateSessions();
        } else if (data.type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE) {
            let ids = await CatalogRuleProductPriceService.getAllIds();
            response.ids = await CatalogRuleProductPriceService.getNotExistedIds(ids);
        } else {
            let queryService = QueryService.reset();
            queryService.addFieldToFilter(
                'updated_at',
                (new Date(data.updated_time)).toISOString().substring(0, 19).replace('T', ' '),
                'gteq'
            );
            response = await SyncService.getDeleted(data.type, queryService);
        }
        // Delete from indexeddb
        if (response.ids && response.ids.length) {
            await service.deleteItems(response.ids);
            return response.ids;
        }
    } catch (error) {
        return [];
    }
    return [];
}

/**
 * Update data
 *
 * @param {object} service
 * @param {object} data
 * @param {int} pageSize
 * @param {int} page
 * @return {object}
 */
async function updateData(service, data, pageSize, page) {
    try {
        let queryService = QueryService.reset();
        queryService.setPageSize(pageSize).setCurrentPage(page);
        queryService.addParams('show_option', '1');

        let updatedAtKey = data.type !== SyncConstant.TYPE_ORDER ? 'updated_at' : 'main_table.updated_at';

        queryService.addFieldToFilter(
            updatedAtKey,
            (new Date(data.updated_data_time)).toISOString().substring(0, 19).replace('T', ' '),
            'gteq'
        );
        let response = await service.getUpdateData(queryService);

        // Process updated_data_time
        let updated_data_time = Date.now();
        if (response.hasOwnProperty('cached_at')) {
            updated_data_time = response.cached_at;
        }

        // Save items
        await service.saveToDb(response.items);

        return {
            items: response.items,
            updated_data_time: updated_data_time,
            total: response.total_count
        };
    } catch (error) {
        return {error: true};
    }
}
