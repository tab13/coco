import {Observable} from 'rxjs';
import SyncService from "../../../service/sync/SyncService";
import QueryService from "../../../service/QueryService";
import SyncConstant from "../../constant/SyncConstant";
import SyncAction from "../../action/SyncAction";
import ProductService from "../../../service/catalog/ProductService";

/**
 * Receive action type(UPDATE_DATA_FINISH, UPDATE_DATA_FINISH_RESULT) and check for add new product #locationfix
 * @param action$
 */
export default function updateData(action$) {
    let ids = [], isCompletedProduct = false, isCompletedStock = false;
    return action$.ofType(SyncConstant.UPDATE_DATA_FINISH, SyncConstant.UPDATE_DATA_FINISH_RESULT)
        .mergeMap(action => {
            if (action.type === SyncConstant.UPDATE_DATA_FINISH) {
                if (action.data.type === SyncConstant.TYPE_STOCK) {
                    if(Array.isArray(action.items)) {
                        ids = ids.concat(action.items.map(item => item.product_id));
                    }
                }
            } else if (action.data.type === SyncConstant.TYPE_PRODUCT
                || action.data.type === SyncConstant.TYPE_STOCK
            ) { // UPDATE_DATA_FINISH_RESULT
                if (action.data.type === SyncConstant.TYPE_PRODUCT) {
                    isCompletedProduct = true;
                } else {
                    isCompletedStock = true;
                }
                // Check finished to update
                if (isCompletedProduct && isCompletedStock) {
                    // Update Data
                    if (ids.length) {
                        let pipe = Observable.fromPromise(ProductService.getNotExistedIds(ids))
                            .mergeMap(ids => {
                                if (!ids.length) {
                                    return Observable.empty();
                                }
                                return Observable.fromPromise(addProducts(ids))
                                    .mergeMap(result => {
                                        if (!result.total) {
                                            return Observable.empty();
                                        }
                                        return Observable.of(SyncAction.updateDataFinish(
                                            {type: SyncConstant.TYPE_PRODUCT}, result.items
                                        ));
                                    }).catch(() => Observable.empty());
                            }).catch(() => Observable.empty());
                        ids = [];
                        return pipe;
                    }
                    isCompletedProduct = false;
                    isCompletedProduct = false;
                }
            }
            return Observable.empty();
        });
}

/**
 * add product by ids
 *
 * @param {Array} ids
 * @return {object}
 */
async function addProducts(ids) {
    try {
        let queryService = QueryService.reset();
        queryService.addParams('show_option', '1');
        queryService.addFieldToFilter(
            'entity_id',
            ids,
            'in'
        );
        let response = await SyncService.getData(SyncConstant.TYPE_PRODUCT, queryService);

        // Save items
        await ProductService.saveToDb(response.items);

        // Reindex data
        await ProductService.reindexTable();

        return {
            items: response.items,
            total: response.total_count
        };
    } catch (error) {
        return {error: true};
    }
}
