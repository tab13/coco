import {Observable} from "rxjs/Rx";
import LogoutPopupAction from "../action/LogoutPopupAction";
import LogoutPopupConstant from "../constant/LogoutPopupConstant";
import UserService from "../../service/user/UserService";
import {combineEpics} from 'redux-observable';
import SessionService from "../../service/session/SessionService";

/**
 * send request logout whenever user click yes on logout confirmation
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
const logoutPopup = action$ => action$.ofType(LogoutPopupConstant.CLICK_MODAL_YES)
    .mergeMap(() => Observable.from(UserService.logout())
        .map((response) => {
            SessionService.removeCloseSession();
            /* remove sharing account */
            UserService.setSharingAccount('');
            return LogoutPopupAction.finishLogoutRequesting(response)
        }).catch(() => {
            SessionService.removeCloseSession();
            return Observable.of(LogoutPopupAction.finishLogoutRequesting({ ok: true }));
        })
    );


/**
 * send request logout whenever user was forced sign out
 *
 * @param action$
 * @return {Observable<any>}
 * @constructor
 */
const forceSignOut = action$ => action$.ofType(LogoutPopupConstant.FORCE_SIGN_OUT)
    .mergeMap(() => {
        UserService.logout();
        return Observable.empty();
        }
    );

/**
 * export combine epics
 *
 * @type {Epic<Action, any, any, Action> | (function(*): Observable<any>)}
 */
export const LogoutPopupEpic = combineEpics(
    logoutPopup,
    forceSignOut
);

export default LogoutPopupEpic;