import {Observable} from 'rxjs';
import UserService from "../../service/user/UserService";
import UserConstant from "../constant/UserConstant";
import UserAction from "../action/UserAction";
import {combineEpics} from 'redux-observable';
import SyncAction from "../action/SyncAction";
import SyncService from "../../service/sync/SyncService";

/**
 * click login action
 * @param action$
 * @returns {Observable<any>}
 */
const userClickLogin = action$ => action$.ofType(UserConstant.USER_CLICK_LOGIN)
    .mergeMap(action => Observable.from(
            UserService.login(action.username, action.password))
            .map((response) => {
                if (response.session_id !== undefined) {
                    UserService.saveSession(response.session_id, response.timeout);
                }
                if (response.staff_id !== undefined) {
                    if (response.staff_id.toString() !== UserService.getOldStaffId()) {
                        SyncService.saveNeedSyncSession('1');
                    }
                    UserService.saveStaff(response.staff_id, response.staff_name);
                }
                /* save sharing account */
                if(response.sharing_account !== undefined){
                    UserService.setSharingAccount(response.sharing_account);
                }
                if (response.locations !== undefined) {
                    UserService.saveLocations(JSON.stringify(response.locations));
                }
                if (response.website_id !== undefined) {
                    UserService.saveWebsiteId(JSON.stringify(response.website_id));
                }
                return UserAction.loginSuccess(response);
            }).catch(error => Observable.of(UserAction.loginError(error.message)))
    );

/**
 * continue login will remove all current session
 * @param action$
 * @returns {Observable<any>}
 */
const userContinueLogin = action$ =>action$.ofType(UserConstant.USER_CONTINUE_LOGIN)
    .mergeMap(action => Observable.from(
        UserService.continueLogin())
        .mergeMap((response) =>{
            if (response.locations) {
                UserService.saveLocations(JSON.stringify(response.locations));
            }
            /* save sharing account */
            if(response.sharing_account){
                UserService.setSharingAccount(response.sharing_account);
            }
            return [UserAction.loginSuccess(response),
                    UserAction.afterContinueLogin(true)];
        }).catch( error =>Observable.of(UserAction.loginError(error.message)))
    );


/**
 * user change information
 * @param action$
 * @returns {Observable<any>}
 */
const userChangeInformation = action$ => action$.ofType(UserConstant.USER_CHANGE_INFORMATION)
    .mergeMap(action => Observable.from(
        UserService.changeInformation(
            action.user_name, action.old_password, action.new_password))
        .map(() => {
            return SyncAction.syncActionLog();
        })
        .catch(() => {return {type: 'asdasd'}})
    );


/**
 * user get logo
 * @param action$
 * @returns {Observable<any>}
 */
const getLogo = action$ => action$.ofType(UserConstant.USER_GET_LOGO)
    .mergeMap(() => Observable.from(
        UserService.getLogo())
        .map((response) => {
            return UserAction.getLogoSuccess(response);
        })
        .catch(error => {
            return Observable.of(UserAction.getLogoError(error.message))
        })
    );

/**
 * user get logo
 * @param action$
 * @returns {Observable<any>}
 */
const getCountries = action$ => action$.ofType(UserConstant.USER_GET_COUNTRIES)
    .mergeMap(action => {
        UserService.getCountries()
            .then(response => {
                UserService.saveLocalCountries(response);
            });
        return Observable.empty();
    });

/**
 * export combine epics
 *
 * @type {Epic<Action, any, any, Action> | (function(*): Observable<any>)}
 */
export const userEpic = combineEpics(
    userClickLogin,
    userContinueLogin,
    userChangeInformation,
    getLogo,
    getCountries
);

export default userEpic;



