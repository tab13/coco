import {Observable} from 'rxjs';
import CreditmemoConstant from "../../constant/order/CreditmemoConstant";
import ActionLogAction from "../../action/ActionLogAction";
import CreditmemoSuccessService from "../../../service/sales/order/creditmemo/CreditmemoSuccessService";

export default function sendEmailCreditmemo(action$) {
    return action$.ofType(CreditmemoConstant.SEND_EMAIL_CREDITMEMO)
        .mergeMap(action => Observable.from(
                CreditmemoSuccessService.sendEmailCreditmemo(
                    action.increment_id, action.email, action.creditmemo_increment_id)
            )
            .mergeMap((response) => {
                return Observable.of(ActionLogAction.syncActionLog());
            }).catch(error => {
                return Observable.empty();
            })
        );
}