import {Observable} from 'rxjs';
import {combineEpics} from 'redux-observable';
import ConfigConstant from "../constant/tax/ConfigConstant";
import LoadingAction from "../action/LoadingAction";
import SyncService from "../../service/sync/SyncService";
import TaxService from "../../service/tax/TaxService";
import TaxAction from "../action/TaxAction";

/**
 * get tax rate action
 * @param action$
 * @returns {Observable<any>}
 */
const getTaxRate = action$ => action$.ofType(ConfigConstant.GET_TAX_RATE_ONLINE)
    .mergeMap(() => Observable.from(SyncService.getTaxRate())
        .mergeMap((response) => {
            TaxService.saveTaxRateToConfig(response.items);
            TaxService.saveTaxRateToDb(response.items);
            return [
                LoadingAction.increaseCount(),
                TaxAction.getTaxRateResult(response.items)
            ];
        }).catch(error => {
            return Observable.of(TaxAction.getTaxRateError(error));
        })
    );

/**
 * get tax rate action
 * @param action$
 * @returns {Observable<any>}
 */
const getTaxRule = action$ => action$.ofType(ConfigConstant.GET_TAX_RULE_ONLINE)
    .mergeMap(() => Observable.from(SyncService.getTaxRule())
        .mergeMap((response) => {
            TaxService.saveTaxRuleToConfig(response.items);
            TaxService.saveTaxRuleToDb(response.items);
            return [
                LoadingAction.increaseCount(),
                TaxAction.getTaxRuleResult(response.items)
            ];
        }).catch(error => {
            return Observable.of(TaxAction.getTaxRuleError(error));
        })
    );

/**
 * Export combine epics
 *
 * @type {Epic<Action, any, any, Action> | (function(*): Observable<any>)}
 */
export const taxEpic = combineEpics(
    getTaxRate,
    getTaxRule
);

export default taxEpic;



