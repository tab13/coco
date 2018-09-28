import {Observable} from 'rxjs';
import {combineEpics} from 'redux-observable';
import SignoutConstant from "../constant/SignoutConstant";
import LogoutPopupAction from "../action/LogoutPopupAction";
import LocationService from "../../service/LocationService";
import UserService from "../../service/user/UserService";

/**
 * click login action
 * @param action$
 * @returns {Observable<any>}
 */
const getLocations = action$ => action$.ofType(SignoutConstant.GET_NEW_LOCATION_LIST)
    .mergeMap(action => Observable.from(
        LocationService.getNewLocations(action.queryService))
            .map((response) => {
                if (response.locations !== undefined) {
                    UserService.saveLocations(JSON.stringify(response.locations));
                }
                let data = {code: 901,
                            message: 'Opps! Access denied. Recent action has not been saved yet.'}
                return LogoutPopupAction.finishLogoutRequesting(data);
            }).catch((error) => {
                let data = {code: 901,
                            message: error.message}
                return Observable.of(LogoutPopupAction.finishLogoutRequesting(data));
        })
    );

/**
 * export combine epics
 *
 * @type {Epic<Action, any, any, Action> | (function(*): Observable<any>)}
 */
export const signoutEpic = combineEpics(
    getLocations
);

export default signoutEpic;



