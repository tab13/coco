import {Observable} from "rxjs/Rx";
import UserConstant from "../constant/UserConstant";
import LocationAction from "../action/LocationAction";
import LocationService from "../../service/LocationService";

/**
 * assign pos action
 *
 * @param action$
 * @returns {Observable<any>}
 */
export default action$ => action$.ofType(UserConstant.USER_ASSIGN_POS)
    .mergeMap(action => Observable.from(
        LocationService.assignPos(
            action.posId, action.locationId, action.currentStaffId))
        .map(() => {
            return LocationAction.assignPosResponse();
        })
        .catch((error) =>{
                return Observable.of(LocationAction.assignPosError(error.message));
            }
        )
    );
