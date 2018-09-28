import {Observable} from 'rxjs';
import CreditmemoConstant from "../../constant/order/CreditmemoConstant";
import CreditmemoService from "../../../service/sales/order/CreditmemoService";
import OrderResourceModel from "../../../resource-model/order/OrderResourceModel";
import ActionLogAction from "../../action/ActionLogAction";
import cloneDeep from 'lodash/cloneDeep';
import CreditmemoAction from "../../action/order/CreditmemoAction";
import RefundOperationService from "../../../service/sales/order/creditmemo/RefundOperationService";
import OrderService from "../../../service/sales/OrderService";
import OrderAction from "../../action/OrderAction";
import {toast} from "react-toastify";
import i18n from "../../../config/i18n";

/**
 * checkout place order epic
 * @param action$
 * @returns {*}
 */
export default function creditmemo(action$) {
    return action$.ofType(CreditmemoConstant.CREATE_CREDITMEMO)
        .mergeMap(action => {
            let creditmemo = action.creditmemo;

            CreditmemoService.generateIncrementId(creditmemo);

            let order = RefundOperationService.refund(creditmemo, creditmemo.order);

            OrderService.saveToDb([order]);

            toast.success(
                i18n.translator.translate("A credit memo has been created successfully"),
                {
                    position: toast.POSITION.BOTTOM_CENTER,
                    className: 'wrapper-messages messages-success'
                }
            );

            let requestCreditmemo = cloneDeep(creditmemo);

            delete requestCreditmemo.params;
            delete requestCreditmemo.order;
            delete requestCreditmemo.isValidated;
            delete requestCreditmemo.base_shipping_discount_amount;
            delete requestCreditmemo.shipping_discount_amount;
            delete requestCreditmemo.total_qty;
            delete requestCreditmemo.adjustment_shipping_value;
            delete requestCreditmemo.adjustment_positive_value;
            delete requestCreditmemo.adjustment_negative_value;
            delete requestCreditmemo.base_cost;
            delete requestCreditmemo.total_weee_amount;
            delete requestCreditmemo.base_total_weee_amount;
            delete requestCreditmemo.customer_note;
            delete requestCreditmemo.customer_note_notify;
            delete requestCreditmemo.errors;
            delete requestCreditmemo.allow_zero_grand_total;

            requestCreditmemo.items.forEach(item => {
                delete item.order_item;
                delete item.has_children;
                delete item.base_weee_tax_applied_row_amount;
                delete item.tax_ratio;
                delete item.weee_tax_tax_amount;
                delete item.base_weee_tax_tax_amount;
                delete item.pos_base_original_price_excl_tax;
                delete item.pos_original_price_excl_tax;
                delete item.pos_base_original_price_incl_tax;
                delete item.pos_original_price_incl_tax;
            });

            if (requestCreditmemo.payments && requestCreditmemo.payments.length) {
                requestCreditmemo.payments.forEach((payment, index) => {
                    if (payment.amount_paid <= 0) {
                        requestCreditmemo.payments.splice(index, 1);
                    }
                });
                requestCreditmemo.payments.forEach(payment => {
                    delete payment.error;
                });
            }

            let resourceModel = CreditmemoService.getResourceModel(OrderResourceModel);
            return Observable.concat(
                Observable.of(OrderAction.syncActionUpdateDataFinish([order])),
                Observable.of(CreditmemoAction.createCreditmemoAfter(creditmemo)),
                Observable.from(resourceModel.refund(requestCreditmemo))
                    .mergeMap((response) => {
                        return [
                            ActionLogAction.syncActionLog()
                        ];
                    }).catch(error => {
                    return [
                        ActionLogAction.syncActionLog()
                    ];
                })
            )
        });
};
