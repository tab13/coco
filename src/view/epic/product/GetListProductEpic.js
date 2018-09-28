import {Observable} from "rxjs";
import ProductConstant from "../../constant/ProductConstant";
import ProductService from "../../../service/catalog/ProductService";

/**
 * Receive action type(GET_LIST_PRODUCT) and request, response list product
 * @param action$
 */
export default function getListProduct(action$) {
    return action$.ofType(ProductConstant.GET_LIST_PRODUCT)
        .mergeMap(action =>
            Observable.from(ProductService.getProductList(action.search_key, action.pageSize, action.currentPage))
                .map(response => {
                    let data  = response.items;
                    // call service save data to database
                    ProductService.saveToDb(data);
                    return ProductConstant.getListProductResult(data)})
                .catch(() => Observable.of(ProductConstant.getListProductResult([])))
        );
}