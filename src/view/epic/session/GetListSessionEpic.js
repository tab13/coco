import {Observable} from 'rxjs';
import SessionConstant from "../../constant/SessionConstant";
import SessionService from "../../../service/session/SessionService";
import SessionAction from "../../action/SessionAction";
import Config from "../../../config/Config";

/**
 * search hold order epic
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default function getListSessionEpic(action$) {
    return action$.ofType(SessionConstant.GET_LIST_SESSION)
        .mergeMap(action => {
            let requestMode = Config.mode;
            return Observable.from(
                    SessionService.getList(action.queryService)
                ).mergeMap(response => {
                    return Observable.of(SessionAction.getListSessionResult(
                        response.items,
                        response.search_criteria,
                        response.total_count,
                        requestMode
                    ));
                }).catch(error => Observable.of(SessionAction.getListSessionResult([])))

            }
        );
}