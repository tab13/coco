import {Observable} from 'rxjs';
import OrderConstant from '../../../constant/OrderConstant';
import CreditmemoConstant from "../../../constant/order/CreditmemoConstant";
import SessionService from "../../../../service/session/SessionService";
import SessionHelper from "../../../../helper/SessionHelper";
import Config from "../../../../config/Config";
import SessionConstant from "../../../constant/SessionConstant";

/**
 * Receive action type(PLACE_ORDER_AFTER) and request
 * @param action$
 */
export default function UpdateSessionEpic(action$) {
    return action$.ofType(OrderConstant.PLACE_ORDER_AFTER, CreditmemoConstant.CREATE_CREDITMEMO_AFTER)
        .mergeMap(action => {
            if (!SessionHelper.isEnableSession() ||
                !Config.current_session || !Config.current_session.shift_increment_id ||
                Config.current_session.status === SessionConstant.SESSION_CLOSE) {
                return Observable.empty();
            }
            const object = action.order || action.creditmemo;
            SessionService.updateSessionAfterPlaceAndRefundOrder(
                object,
                action.type === CreditmemoConstant.CREATE_CREDITMEMO_AFTER,
                false
            );
            return Observable.empty();
        });
}