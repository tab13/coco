import {Observable} from 'rxjs';
import SessionConstant from "../../constant/SessionConstant";
import SessionService from "../../../service/session/SessionService";
import QueryService from "../../../service/QueryService";

/**
 * search hold order epic
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default function getCurrentSessionEpic(action$) {
    return action$.ofType(SessionConstant.GET_CURRENT_SESSION)
        .mergeMap(action => {
            let queryService = QueryService.reset();
            queryService.setOrder('opened_at', 'DESC').setPageSize(SessionConstant.PAGE_SIZE).setCurrentPage(1);
            // queryService.addFieldToFilter('staff_id', UserService.getStaffId(), 'eq');
            queryService.addFieldToFilter('status', SessionConstant.SESSION_OPEN, 'eq');
            return Observable.from(
                    SessionService.getList(queryService)
                ).mergeMap(response => {
                    if (response.items.length) {
                        SessionService.saveCurrentSession(response.items[0]);
                        SessionService.saveToDb(response.items);
                    }
                    return Observable.empty();
                }).catch(error => Observable.empty())

            }
        );
}