import CategoryAction from "../../action/CategoryAction";
import CategoryConstant from '../../constant/CategoryConstant';
import LoadingAction from "../../action/LoadingAction";
import {Observable} from 'rxjs';
import CategoryService from "../../../service/catalog/CategoryService";
import SyncService from "../../../service/sync/SyncService";

/**
 * get category online epic
 * @param action$
 * @returns {Observable<any>}
 */
export default function getCategoryOnline(action$) {
    return action$.ofType(CategoryConstant.GET_CATEGORY_ONLINE)
        .mergeMap(() => Observable.from(SyncService.getCategory())
            .mergeMap((response) => {
                CategoryService.saveToDb(response.items);
                return [
                    LoadingAction.increaseCount(),
                    CategoryAction.getCategoryOnlineResult(response.items)
                ];
            }).catch(() => Observable.of(CategoryAction.getCategoryOnlineResult([])))
        );

}