import ProductConstant from '../../constant/ProductConstant';
import ProductAction from '../../action/ProductAction';
import {Observable} from 'rxjs';
import ProductService from "../../../service/catalog/ProductService";
import Config from "../../../config/Config";

/**
 * Receive action type(SEARCH_BY_BARCODE) and request, response list product
 * @param action$
 */
export default function SearchProductByBarcodeEpic(action$) {
    return action$.ofType(ProductConstant.SEARCH_BY_BARCODE)
        .switchMap(action => {
            let requestMode = Config.mode;
            return Observable.from(
                    ProductService.searchByBarcode(action.code)
                ).map(response => {
                    return ProductAction.searchProductResult(
                        response.items,
                        response.search_criteria,
                        response.total_count,
                        action.code,
                        requestMode
                    );
                }).catch(error => Observable.of(ProductAction.searchProductResult([])))
            }
        );
}
