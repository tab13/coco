import ProductConstant from '../../constant/ProductConstant';
import ProductAction from '../../action/ProductAction';
import {Observable} from 'rxjs';
import ProductService from "../../../service/catalog/ProductService";
import Config from "../../../config/Config";

/**
 * Receive action type(SEARCH_PRODUCT) and request, response list product
 * @param action$
 */
export default function SearchProductEpic(action$) {
    return action$.ofType(ProductConstant.SEARCH_PRODUCT)
        .mergeMap(action => {
            let requestMode = Config.mode;
            return Observable.from(
                ProductService.getProductList(action.queryService)
            ).map(response => {
                return ProductAction.searchProductResult(
                    response.items,
                    response.search_criteria,
                    response.total_count,
                    action.search_key,
                    requestMode
                )
            }).catch(error => Observable.of(ProductAction.searchProductResult([])))
        });
}
