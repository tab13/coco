import {Observable} from 'rxjs';
import MenuConstant from "../constant/MenuConstant";
import {combineEpics} from 'redux-observable';
import SyncService from "../../service/sync/SyncService";
import LogoutPopupAction from "../action/LogoutPopupAction";

/**
 * click login action
 * @param action$
 * @returns {Observable<any>}
 */
const userClickLogout = action$ => action$.ofType(MenuConstant.CLICK_LOGOUT_ITEM)
    .mergeMap(() => Observable.from(SyncService.hasSyncPending())
        .map(hasPending => {
            if(hasPending) {
                return LogoutPopupAction.logoutRequestingError({
                        type: 'Network Error',
                        message: 'You shouldn\'t logout now because data haven\'t been synchronized yet'
                    });
            }

            return LogoutPopupAction.toggle()
        })
    );


/**
 * export combine epics
 *
 * @type {Epic<Action, any, any, Action> | (function(*): Observable<any>)}
 */
export const menuEpic = combineEpics(
    userClickLogout
);

export default menuEpic;



