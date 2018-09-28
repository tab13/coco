import * as _ from "lodash";
import {AbstractOrderService} from "../../AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import CreditmemoItemService from "./CreditmemoItemService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import NumberHelper from "../../../../helper/NumberHelper";
import i18n from "../../../../config/i18n";
import OrderService from "../../OrderService";
import {RewardPointHelper} from "../../../../helper/RewardPointHelper";
import PaymentHelper from "../../../../helper/PaymentHelper";
import Appstore from "../../../../view/store/store";
import CreditmemoAction from "../../../../view/action/order/CreditmemoAction";

export class RefundOperationService extends AbstractOrderService {
    static className = 'RefundOperationService';

    refund(creditmemo, order, isOnline = false) {
        if (creditmemo.order_id === order.entity_id) {
            if (creditmemo.items && creditmemo.items.length) {
                creditmemo.items.forEach(item => {
                    if (item.qty > 0) {
                        CreditmemoItemService.register(item, creditmemo);
                    }
                })
            }
        }
        order.base_total_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_total_refunded, creditmemo.base_grand_total
        ));
        order.total_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.total_refunded, creditmemo.grand_total
        ));
        order.base_subtotal_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_subtotal_refunded, creditmemo.base_subtotal
        ));
        order.subtotal_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.subtotal_refunded, creditmemo.subtotal
        ));
        order.base_tax_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_tax_refunded, creditmemo.base_tax_amount
        ));
        order.tax_refunded = CurrencyHelper.round(NumberHelper.addNumber(order.tax_refunded, creditmemo.tax_amount));
        order.base_discount_tax_compensation_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_discount_tax_compensation_refunded, creditmemo.base_discount_tax_compensation_amount
        ));
        order.discount_tax_compensation_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.discount_tax_compensation_refunded, creditmemo.discount_tax_compensation_amount
        ));
        order.base_shipping_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_shipping_refunded, creditmemo.base_shipping_amount
        ));
        order.shipping_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.shipping_refunded, creditmemo.shipping_amount
        ));
        order.base_shipping_tax_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_shipping_tax_refunded, creditmemo.base_shipping_tax_amount
        ));
        order.shipping_tax_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.shipping_tax_refunded, creditmemo.shipping_tax_amount
        ));
        order.base_adjustment_positive = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_adjustment_positive, creditmemo.base_adjustment_positive
        ));
        order.adjustment_positive = CurrencyHelper.round(NumberHelper.addNumber(
            order.adjustment_positive, creditmemo.adjustment_positive
        ));
        order.base_adjustment_negative = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_adjustment_negative, creditmemo.base_adjustment_negative
        ));
        order.adjustment_negative = CurrencyHelper.round(NumberHelper.addNumber(
            order.adjustment_negative, creditmemo.adjustment_negative
        ));
        order.discount_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.discount_refunded, creditmemo.discount_amount
        ));
        order.base_discount_refunded = CurrencyHelper.round(NumberHelper.addNumber(
            order.base_discount_refunded, creditmemo.base_discount_amount
        ));

        if (isOnline) {
            order.base_total_online_refunded = CurrencyHelper.round(NumberHelper.addNumber(
                order.base_total_online_refunded, creditmemo.base_grand_total
            ));
            order.total_online_refunded = CurrencyHelper.round(NumberHelper.addNumber(
                order.total_online_refunded, creditmemo.grand_total
            ));
        } else {
            order.base_total_offline_refunded = CurrencyHelper.round(NumberHelper.addNumber(
                order.base_total_offline_refunded, creditmemo.base_grand_total
            ));
            order.total_offline_refunded = CurrencyHelper.round(NumberHelper.addNumber(
                order.total_offline_refunded, creditmemo.grand_total
            ));
        }

        order.base_total_invoiced_cost = CurrencyHelper.round(NumberHelper.minusNumber(
            order.base_total_invoiced_cost, creditmemo.base_cost
        ));

        if (creditmemo.comments && creditmemo.comments.length) {
            creditmemo.comments.forEach(comment => {
                OrderService.addComment(order, comment.comment, true, true);
            });
        }

        let comment = i18n.translator.translate(
            "We refunded {{amount}} offline.",
            {amount: CurrencyHelper.format(creditmemo.grand_total, creditmemo.base_currency_code, null)}
        );

        OrderService.addComment(order, comment, true, false);

        /** reward point */
        if (RewardPointHelper.isEnabledRewardPoint()) {
            order.creditmemo_rewardpoints_earn = _.toNumber(order.creditmemo_rewardpoints_earn || 0)
                + _.toNumber(creditmemo.rewardpoints_earn || 0);
            order.creditmemo_rewardpoints_discount = _.toNumber(order.creditmemo_rewardpoints_discount || 0)
                + _.toNumber(creditmemo.rewardpoints_earn || 0);

            order.creditmemo_rewardpoints_base_discount = _.toNumber(order.creditmemo_rewardpoints_base_discount || 0)
                + _.toNumber(creditmemo.rewardpoints_earn || 0);
        }
        if (creditmemo.payments && creditmemo.payments.length) {
            if (!order.payments) {
                order.payments = [];
            }

            let newPayments = PaymentHelper.filterPaymentData(creditmemo.payments);

            newPayments.forEach(payment => {
                if (payment.amount_paid > 0) {
                    order.payments.push(payment);
                }
            })
        }

        Appstore.dispatch(CreditmemoAction.refundOperationRefundAfter(creditmemo, order));

        return order;
    }
}

/** @type RefundOperationService */
let refundOperationService = ServiceFactory.get(RefundOperationService);

export default refundOperationService;