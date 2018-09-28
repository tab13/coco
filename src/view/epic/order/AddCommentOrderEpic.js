import {Observable} from 'rxjs';
import ActionLogAction from "../../action/ActionLogAction";
import OrderAction from "../../action/OrderAction";
import OrderConstant from "../../constant/OrderConstant";
import OrderService from "../../../service/sales/OrderService";
import SyncConstant from "../../constant/SyncConstant";
import ActionLogService from "../../../service/sync/ActionLogService";
import DateTimeHelper from "../../../helper/DateTimeHelper";


/**
 * checkout place order epic
 * @param action$
 * @returns {*}
 */
export default function addComment(action$) {
    return action$.ofType(OrderConstant.ADD_COMMENT)
        .mergeMap(action => {
            let order = action.order;
            let comment = action.comment;
            let notify = action.notify;
            let visibleOnFront = action.visibleOnFront;
            let createAt = DateTimeHelper.getDatabaseDateTime();
            order = OrderService.addComment(order, comment, notify, visibleOnFront);
            let orderResource = OrderService.getResourceModel();
            return Observable.fromPromise(
                orderResource.saveToDb([order])
            ).mergeMap(() => {
                let url_api = orderResource.getResourceOnline().getPathAddComentOrder();
                let params = {
                    increment_id: order.increment_id,
                    comment:
                        {
                            comment: comment,
                            created_at: createAt,
                            is_visible_on_front: +visibleOnFront
                        }
                };
                return Observable.fromPromise(
                    ActionLogService.createDataActionLog(
                        SyncConstant.REQUEST_ADD_COMMENT_ORDER, url_api, SyncConstant.METHOD_POST, params
                    ).mergeMap(() => {
                        return [
                            OrderAction.addCommentResult(order),
                            OrderAction.syncActionUpdateDataFinish([order]),
                            ActionLogAction.syncActionLog()
                        ];
                    })
                )
            }).catch(error => {
                return [
                    ActionLogAction.syncActionLog()
                ];
            })
        });
};
