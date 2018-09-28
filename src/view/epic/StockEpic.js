import {Observable} from 'rxjs';
import {combineEpics} from 'redux-observable';
import StockConstant from "../constant/StockConstant";
import StockService from "../../service/catalog/StockService";
import StockAction from "../action/StockAction";

/**
 * Get external stock 
 * 
 * @param action$
 * @returns {Observable<any>}
 */
const getExternalStock = action$ => action$.ofType(StockConstant.GET_EXTERNAL_STOCK)
    .mergeMap(action => Observable.from(
        StockService.getExternalStock(action.product_id))
        .mergeMap((response) => {
            return Observable.of(StockAction.getExternalStockResult(response));
        }).catch((error) => {
            return Observable.empty();
        })
    );

/**
 * export combine epics
 *
 * @type {Epic<Action, any, any, Action> | (function(*): Observable<any>)}
 */
export const stockEpic = combineEpics(
    getExternalStock
);

export default stockEpic;