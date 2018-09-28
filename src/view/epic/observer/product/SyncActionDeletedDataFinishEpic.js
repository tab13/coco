import SyncConstant from '../../../constant/SyncConstant';
import {Observable} from 'rxjs';
import ProductAction from "../../../action/ProductAction";

export default function SyncActionDeletedDataFinishEpic(action$) {
    return action$.ofType(SyncConstant.DELETE_DATA_FINISH)
        .mergeMap(action => {
            if (action.ids && action.ids.length) {
                if (action.data.type === SyncConstant.TYPE_CATALOG_RULE_PRODUCT_PRICE) {
                    return Observable.of(ProductAction.syncActionDeletedCatalogRulePriceDataFinish(action.ids));
                }
            }
            return Observable.empty()
        });
}