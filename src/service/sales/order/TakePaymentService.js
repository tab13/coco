import {AbstractOrderService} from "../AbstractService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import OrderResourceModel from "../../../resource-model/order/OrderResourceModel";
import OrderService from "../OrderService";
import ActionLogService from "../../sync/ActionLogService";
import SyncConstant from "../../../view/constant/SyncConstant";
import cloneDeep from 'lodash/cloneDeep';
import Config from "../../../config/Config";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import StatusConstant from "../../../view/constant/order/StatusConstant";
import {AbstractProductTypeService} from "../../catalog/product/type/AbstractTypeService";
import PaymentHelper from "../../../helper/PaymentHelper";
import PaymentConstant from "../../../view/constant/PaymentConstant";
import StoreCreditService from "../../store-credit/StoreCreditService";
import InvoiceService from "./InvoiceService";
import SessionService from "../../session/SessionService";
import ConfigHelper from "../../../helper/ConfigHelper";
import CustomerService from "../../customer/CustomerService";
import SessionHelper from "../../../helper/SessionHelper";
import SessionConstant from "../../../view/constant/SessionConstant";

export class TakePaymentService extends AbstractOrderService {
    static className = 'TakePaymentService';

    /**
     * take payment
     * @param order
     * @return {Promise<{order: *, createInvoice: number}>}
     */
    async takePayment(order) {
        let orderResource = this.getResourceModel(OrderResourceModel);

        order.base_total_paid = CurrencyHelper.roundToFloat(OrderService.getBaseTotalPaid(order));
        order.total_paid = CurrencyHelper.roundToFloat(OrderService.getTotalPaid(order));
        order.base_total_due = CurrencyHelper.roundToFloat(OrderService.getBaseTotalDue(order));
        order.total_due = CurrencyHelper.roundToFloat(OrderService.getTotalDue(order));
        order.base_pos_change = CurrencyHelper.roundToFloat(OrderService.getBasePosChange(order));
        order.pos_change = CurrencyHelper.roundToFloat(OrderService.getPosChange(order));
        let create_invoice = (order.base_total_due === 0 ? 1 : 0);

        let params = {
            increment_id: order.increment_id,
            payments: cloneDeep(PaymentHelper.filterPaymentData(order.payments)),
            create_invoice: create_invoice
        };

        if (create_invoice) {
            order = InvoiceService.createInvoiceAfterPlaceOrder(order);
            order.status = StatusConstant.STATUS_PROCESSING;
            order.state = StatusConstant.STATE_PROCESSING;
            if (this.isShipped(order.items)) {
                order.status = StatusConstant.STATUS_COMPLETE;
                order.state = StatusConstant.STATE_COMPLETE;
            }
        }

        // update store credit
        let store_credit = order.payments.find(
            (payment) => payment.method === PaymentConstant.STORE_CREDIT && !payment.is_paid);
        let customerId = order.customer_id;
        if (ConfigHelper.isEnableStoreCredit() && customerId && store_credit) {
            let base_amount_paid = store_credit.base_amount_paid;
            await CustomerService.updateCustomerCredit(customerId, base_amount_paid);
        }

        // update session
        if (SessionHelper.isEnableSession() &&
            Config.current_session && Config.current_session.shift_increment_id &&
            Config.current_session.status === SessionConstant.SESSION_OPEN) {
            await SessionService.updateSessionAfterPlaceAndRefundOrder(cloneDeep(order), false, true);
        }

        order.payments.map(payment => payment.is_paid = 1);
        order = await orderResource.takePayment(order);

        let url_api = orderResource.getResourceOnline().getPathTakePayment();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_TAKE_PAYMENT_ORDER, url_api, SyncConstant.METHOD_POST, params
        );

        return {
            order: order,
            createInvoice: create_invoice
        };
    }
    /**
     * check order is shipped
     * @param items
     * @return {boolean}
     */
    isShipped(items) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].parent_item_id) {
                let parent = items.find(x => x.item_id === items[i].parent_item_id);
                if (parent && parent.product_options) {
                    let productOptions = JSON.parse(parent.product_options);
                    if (productOptions.shipment_type === AbstractProductTypeService.SHIPMENT_TOGETHER) {
                        continue;
                    }
                }
            }
            if (!items[i].qty_shipped || items[i].qty_shipped < items[i].qty_ordered) {
                return false;
            }
        }

        return true;
    }

    /**
     * add and check payments
     * @param customer
     * @param payments
     * @param payments_selected
     * @returns {*}
     */
    addAndCheckPayments(customer, payments, payments_selected) {
        // check store credit
        let payment_select_store_credit = payments_selected.find(
            (payment) => payment.method === PaymentConstant.STORE_CREDIT && !payment.is_paid
        );
        let payment_store_credit = payments.find((payment) => payment.code === PaymentConstant.STORE_CREDIT);
        if (payment_store_credit || payment_select_store_credit) {
            return payments;
        }
        return StoreCreditService.checkAndAddStoreCreditToListPayment(customer, payments);
    }
}

/** @type TakePaymentService */
let takePaymentService = ServiceFactory.get(TakePaymentService);

export default takePaymentService;