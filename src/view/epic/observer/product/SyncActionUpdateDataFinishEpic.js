import SyncConstant from '../../../constant/SyncConstant';
import {Observable} from 'rxjs';
import ProductAction from "../../../action/ProductAction";

/**
 * Receive action type(PLACE_ORDER_AFTER) and request, response list product
 * @param action$
 */
export default function SyncActionUpdateDataFinishEpic(action$) {
    return action$.ofType(SyncConstant.UPDATE_DATA_FINISH)
        .mergeMap(action => {
            if (action.items && action.items.length) {
                if (action.data.type === SyncConstant.TYPE_PRODUCT) {
                    return Observable.of(ProductAction.syncActionUpdateProductDataFinish(action.items));
                }
                if (action.data.type === SyncConstant.TYPE_STOCK) {
                    return Observable.of(ProductAction.syncActionUpdateStockDataFinish(action.items));
                }
                if (action.data.type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE) {
                    return Observable.of(ProductAction.syncActionUpdateCatalogRulePriceDataFinish(action.items));
                }
            }
            return Observable.empty()
        });
}