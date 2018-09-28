import {Observable} from "rxjs";
import CategoryConstant from "../../constant/CategoryConstant";
import CategoryAction from '../../action/CategoryAction';
import CategoryService from "../../../service/catalog/CategoryService";

/**
 * Receive action type(GET_LIST_CATEGORY) and request, response list category
 * @param action$
 */

export default function getListCategory(action$) {
    return action$.ofType(CategoryConstant.GET_LIST_CATEGORY)
        .mergeMap(() => Observable.from(CategoryService.getAll())
            .mergeMap((response) => {
                return Observable.of(CategoryAction.getListCategoryResult(response));
            }).catch(() => Observable.of(CategoryAction.getListCategoryResult([])))
        );
}