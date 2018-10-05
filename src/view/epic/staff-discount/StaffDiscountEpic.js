import {Observable} from "rxjs/Rx";
import StaffDiscountConstant from "../../constant/StaffDiscountConstant";
import StaffDiscountService from "../../../service/staff-discount/StaffDiscountService";
import {combineEpics} from "redux-observable";
import StaffDiscountAction from "../../action/staff-discount/StaffDiscountAction";

const userClickConfirmManagerPinCode = action$ => action$.ofType(StaffDiscountConstant.CHECK_MANAGER_PINCODE)
        .mergeMap(action => Observable.from(StaffDiscountService.checkManagerStaffPinCode(action.pincode))
            .map((response) => {
                return StaffDiscountAction.checkManagerPinCodeSuccess(response);
            }).catch(error => Observable.of(StaffDiscountAction.checkManagerPinCodeError(error.message)))
        );

export const staffDiscountEpic = combineEpics(
    userClickConfirmManagerPinCode
);

export default staffDiscountEpic;