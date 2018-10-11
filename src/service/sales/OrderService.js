import {AbstractOrderService} from "./AbstractService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import OrderResourceModel from "../../resource-model/order/OrderResourceModel";
import StatusConstant from "../../view/constant/order/StatusConstant";
import i18n from "../../config/i18n";
import CurrencyHelper from "../../helper/CurrencyHelper";
import OrderWeeeDataService from "../weee/OrderWeeeDataService";
import NumberHelper from "../../helper/NumberHelper";
import TaxHelper from "../../helper/TaxHelper";
import OrderHelper from "../../helper/OrderHelper";
import DateTimeHelper from "../../helper/DateTimeHelper";
import OrderItemService from "./order/OrderItemService";
import SyncConstant from "../../view/constant/SyncConstant";
import ActionLogService from "../../service/sync/ActionLogService";
import LocalStorageHelper from "../../helper/LocalStorageHelper";
import Config from '../../config/Config';
import PaymentFactory from "../../factory/PaymentFactory";
import PaymentHelper from "../../helper/PaymentHelper";
import {toast} from "react-toastify";
import {RewardPointHelper} from "../../helper/RewardPointHelper";
import GiftcardHelper from "../../helper/GiftcardHelper";

export class OrderService extends AbstractOrderService {
    static className = 'OrderService';
    resourceModel = OrderResourceModel;

    /**
     * Get base total paid
     *
     * @param order
     * @returns {number}
     */
    getBaseTotalPaid(order) {
        let baseTotalPaid = 0;
        let baseGrandTotal = order.base_grand_total;
        order.payments.forEach(payment => {
            let paidAmount = payment.is_pay_later ? 0 : payment.base_amount_paid;
            baseTotalPaid = NumberHelper.addNumber(baseTotalPaid, paidAmount);
        });
        if (baseTotalPaid > baseGrandTotal) {
            baseTotalPaid = baseGrandTotal;
        }
        return baseTotalPaid;
    }

    /**
     * Get total paid
     * @param order
     * @returns {number}
     */
    getTotalPaid(order) {
        let totalPaid = 0;
        let grandTotal = order.grand_total;
        order.payments.forEach(payment => {
            let paidAmount = payment.is_pay_later ? 0 : payment.amount_paid;
            totalPaid = NumberHelper.addNumber(totalPaid, paidAmount);
        });
        if (totalPaid > grandTotal) {
            totalPaid = grandTotal;
        }
        return totalPaid;
    }

    /**
     * get total due
     *
     * @param order
     * @returns {number}
     */
    getTotalDue(order) {
        let totalPaid = this.getTotalPaid(order);
        let grandTotal = order.grand_total;
        if (!totalPaid) {
            return grandTotal;
        } else if (grandTotal >= totalPaid) {
            return grandTotal - totalPaid;
        }
        return 0;
    }

    /**
     * Get base total due
     *
     * @param order
     * @returns {number}
     */
    getBaseTotalDue(order) {
        let baseTotalPaid = this.getBaseTotalPaid(order);
        let baseGrandTotal = order.base_grand_total;
        if (!baseTotalPaid) {
            return baseGrandTotal;
        } else if (baseGrandTotal > baseTotalPaid) {
            return baseGrandTotal - baseTotalPaid;
        }
        return 0;
    }

    /**
     * get base total change
     * @param order
     * @return {number}
     */
    getBasePosChange(order) {
        let baseTotalPaid = 0;
        let baseGrandTotal = order.base_grand_total;
        order.payments.forEach(item => baseTotalPaid = NumberHelper.addNumber(baseTotalPaid, item.base_amount_paid));
        if (baseGrandTotal < baseTotalPaid) {
            return baseTotalPaid - baseGrandTotal;
        }
        return 0;
    }

    /**
     * get total change
     * @param order
     * @return {number}
     */
    getPosChange(order) {
        let totalPaid = 0;
        let grandTotal = order.base_grand_total;
        order.payments.forEach(item => totalPaid = NumberHelper.addNumber(totalPaid, item.amount_paid));
        if (grandTotal < totalPaid) {
            return totalPaid - grandTotal;
        }
        return 0;
    }

    /**
     * Get base total change due
     *
     * @param {object} order
     * @return {number}
     */
    getBaseTotalChangeDue(order) {
        let baseTotalPaid = this.getBaseTotalPaid(order);
        let baseGrandTotal = order.base_grand_total;
        if (baseTotalPaid > baseGrandTotal) {
            return baseGrandTotal - baseGrandTotal;
        }
        return 0;
    }

    /**
     * Get total change due
     *
     * @param {object} order
     * @return {number}
     */
    getTotalChangeDue(order) {
        let totalPaid = this.getTotalPaid(order);
        let grandTotal = order.grand_total;
        if (totalPaid > grandTotal) {
            return totalPaid - grandTotal;
        }
        return 0;
    }

    /**
     * Get list orders
     * @param queryService
     * @param searchAllTime
     * @return {*}
     */
    getListOrder(queryService, searchAllTime = false) {
        if (searchAllTime) {
            return this.getResourceModel().getDataOnline(queryService);
        }
        return this.getResourceModel().getList(queryService);
    }

    /**
     * get price label
     * @param order
     * @returns {{className: string, value: string}}
     */
    getPriceLabel(order) {
        let priceLabel = {
            className: '',
            value: ''
        };
        if (order.state === StatusConstant.STATE_CANCELED || order.state === StatusConstant.STATE_CLOSED) {
            priceLabel = {
                className: "void",
                value: i18n.translator.translate(StatusConstant.PAYMENT_STATUS_VOID)
            };
        } else {
            let grand_total =
                CurrencyHelper.roundToFloat(order.base_grand_total, CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
            let total_paid =
                CurrencyHelper.roundToFloat(order.base_total_paid, CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
            let total_due =
                CurrencyHelper.roundToFloat(order.base_total_due, CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
            if (grand_total <= total_paid) {
                priceLabel = {
                    className: "paid",
                    value: i18n.translator.translate(StatusConstant.PAYMENT_STATUS_PAID)
                };
            } else if (total_due > 0 && total_due < grand_total) {
                priceLabel = {
                    className: "due",
                    value: i18n.translator.translate(
                        "Due {{value}}",
                        {value: OrderHelper.formatPrice(order.total_due, order)}
                    )
                };
            } else if (total_due === grand_total) {
                priceLabel = {
                    className: "due",
                    value: i18n.translator.translate(
                        "Due {{value}}",
                        {value: OrderHelper.formatPrice(order.total_due, order)}
                    )
                };
            }
        }
        return priceLabel;
    }

    /**
     * get display status
     * @param state
     * @param status
     * @return {string}
     */
    getDisplayStatus(state, status) {
        let statusData = {};
        if (Config.orderStatus) {
            statusData = Config.orderStatus.find(item => (item.status === status && item.state === state));
        }
        return (statusData ? statusData.label : '');
    }

    /**
     * get payment status
     * @param order
     * @return {{className: string, value: string}}
     */
    getPaymentStatus(order) {
        let paymentStatus = {
            className: '',
            value: '',
            realValue: ''
        };

        if (!order) {
            return paymentStatus;
        }


        if (order.state === StatusConstant.STATE_CANCELED || order.state === StatusConstant.STATE_CLOSED) {
            paymentStatus = {
                className: "void",
                value: i18n.translator.translate(StatusConstant.PAYMENT_STATUS_VOID),
                realValue: StatusConstant.PAYMENT_STATUS_VOID
            };
        } else {
            let grand_total =
                CurrencyHelper.roundToFloat(order.base_grand_total, CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
            let total_paid =
                CurrencyHelper.roundToFloat(order.base_total_paid, CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
            let total_due =
                CurrencyHelper.roundToFloat(order.base_total_due, CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
            if (grand_total <= total_paid) {
                paymentStatus = {
                    className: "paid",
                    value: i18n.translator.translate(StatusConstant.PAYMENT_STATUS_PAID),
                    realValue: StatusConstant.PAYMENT_STATUS_PAID
                };
            } else if (total_due > 0 && total_due < grand_total) {
                paymentStatus = {
                    className: "partially_paid",
                    value: i18n.translator.translate(StatusConstant.PAYMENT_STATUS_PARTIAL_PAID),
                    realValue: StatusConstant.PAYMENT_STATUS_PARTIAL_PAID
                };
            } else if (total_due === grand_total) {
                paymentStatus = {
                    className: "unpaid",
                    value: i18n.translator.translate(StatusConstant.PAYMENT_STATUS_UNPAID),
                    realValue: StatusConstant.PAYMENT_STATUS_UNPAID
                };
            }
        }
        return paymentStatus;
    }

    /**
     * Get price display in order item
     * @param item
     * @param order
     * @return {*}
     */
    getItemDisplayPrice(item, order) {
        let price = 0;
        if (TaxHelper.orderDisplayPriceIncludeTax()) {
            price = item.price_incl_tax;
        } else {
            price = item.price;
        }
        return OrderHelper.formatPrice(price, order);
    }

    /**
     * COCO-CUSTOMIZE
     * Get price display in order item
     * @param item
     * @param order
     * @return {*}
     */
    getItemPrice(item, order) {
        let price = 0;
        if (TaxHelper.orderDisplayPriceIncludeTax()) {
            price = item.price_incl_tax;
        } else {
            price = item.price;
        }
        return price;
    }

    /**
     * Get original price display in order item
     * @param item
     * @param order
     * @return {*}
     */
    getItemDisplayOriginalPrice(item, order) {
        let originalPrice = 0;
        if (TaxHelper.orderDisplayPriceIncludeTax()) {
            originalPrice = item.pos_original_price_incl_tax;
        } else {
            originalPrice = item.pos_original_price_excl_tax;
        }
        return OrderHelper.formatPrice(originalPrice, order);
    }

    /**
     * COCO-CUSTOMIZE
     * Get original price in order item
     * @param item
     * @param order
     * @returns {*|number}
     */
    getItemOriginalPrice(item, order) {
        let originalPrice = 0;
        if (TaxHelper.orderDisplayPriceIncludeTax()) {
            originalPrice = item.pos_original_price_incl_tax;
        } else {
            originalPrice = item.pos_original_price_excl_tax;
        }
        return originalPrice;
    }

    /**
     * Get price display in order item
     * @param item
     * @param order
     * @return {*}
     */
    getRowTotal(item, order) {
        let price = item.row_total;
        price = NumberHelper.minusNumber(price, item.discount_amount);
        price = NumberHelper.addNumber(price, item.tax_amount);
        price = NumberHelper.addNumber(price, item.discount_tax_compensation_amount);
        price = NumberHelper.addNumber(price, OrderWeeeDataService.getRowWeeeTaxInclTax(item, order));
        return OrderHelper.formatPrice(price, order);
    }


    /**
     * COCO-CUSTOMIZE
     * Get price in order item
     * @param item
     * @param order
     * @return {*}
     */
    getNumberRowTotal(item, order) {
        let price = item.row_total;
        price = NumberHelper.minusNumber(price, item.discount_amount);
        price = NumberHelper.addNumber(price, item.tax_amount);
        price = NumberHelper.addNumber(price, item.discount_tax_compensation_amount);
        price = NumberHelper.addNumber(price, OrderWeeeDataService.getRowWeeeTaxInclTax(item, order));
        return price;
    }

    /**
     * Get display subtotal in order detail
     * @param order
     * @return {*}
     */
    getDisplaySubtotal(order) {
        let subtotal = order.subtotal;
        if (TaxHelper.orderDisplaySubtotalIncludeTax()) {
            subtotal = order.subtotal_incl_tax;
        }
        return OrderHelper.formatPrice(subtotal, order);
    }

    /**
     * Get display shipping amount in order detail
     * @param order
     * @return {*}
     */
    getDisplayShippingAmount(order) {
        let shippingAmount = order.shipping_amount;
        if (TaxHelper.orderDisplayShippingAmountIncludeTax()) {
            shippingAmount = order.shipping_incl_tax;
        }
        return OrderHelper.formatPrice(shippingAmount, order);
    }

    /**
     * get display shipping amount in shipping method
     * @param order
     * @return {*}
     */
    getShippingMethodAmount(order) {
        let shippingAmount = order.shipping_amount;
        if (TaxHelper.shippingPriceDisplayIncludeTax()) {
            shippingAmount = order.shipping_incl_tax;
        }
        return OrderHelper.formatPrice(shippingAmount, order);
    }

    /**
     * get full address from address
     * @param address
     * @return {string}
     */
    getFullAddress(address) {
        let addressArr = [];
        let street = "";
        if (address.street) {
            street = address.street;
            addressArr.push(street);
        }
        let city = "";
        if (address.city) {
            city = address.city;
            addressArr.push(city);
        }
        let region = "";
        if (address.region) {
            region = address.region;
            addressArr.push(region);
        }
        let postCode = "";
        if (address.postcode) {
            postCode = address.postcode;
            addressArr.push(postCode);
        }
        let country = "";
        if (address.country_id) {
            country = address.country_id;
            addressArr.push(country);
        }
        return addressArr.join(", ");
    }

    /**
     * get out date orders
     * @return {*|Promise<{ids: Array}>}
     */
    getOutDateOrders() {
        return this.getResourceModel().getOutDateOrders();
    }

    /**
     * Retrieve order invoice availability
     *
     * @param order
     * @return {boolean}
     */
    canInvoice(order) {
        if (this.canUnhold(order) || this.isPaymentReview(order)) {
            return false;
        }

        let state = order.state;
        if (this.isCanceled(order) || state === StatusConstant.STATE_CLOSED) {
            return false;
        }
        let result = false;
        order.items.forEach(item => {
            if (OrderItemService.getQtyToInvoice(item, order) > 0) {
                result = true;
            }
        });
        return result;
    }

    /**
     * Retrieve order credit memo (refund) availability
     *
     * @param order
     * @return {boolean}
     */
    canCreditmemo(order) {
        if (order) {
            if (this.canUnhold(order) || this.isPaymentReview(order)) {
                return false;
            }

            if (this.isCanceled(order) || this.state === StatusConstant.STATE_CLOSED) {
                return false;
            }

            /** in case use rwp */
            if (order.rewardpoints_spent && RewardPointHelper.isEnabledRewardPoint()) {
                let canRefundPoint = order.items.some(item => {
                    if (item.parent_item_id) return false;
                    if (!item.rewardpoints_spent) return false;
                    return (item.qty_invoiced - item.qty_refunded - item.qty_canceled) > 0;
                });

                if (canRefundPoint) return canRefundPoint;
            }

            /** in case use rwp */
            if (order.rewardpoints_spent && RewardPointHelper.isEnabledRewardPoint()) {
                let canRefundPoint = order.items.some(item => {
                    if (item.parent_item_id) return false;
                    if (!item.rewardpoints_spent) return false;
                    return (item.qty_invoiced - item.qty_refunded - item.qty_canceled) > 0;
                });

                if (canRefundPoint) return canRefundPoint;
            }

            if(order.gift_voucher_discount && order.grand_total === 0 && GiftcardHelper.isGiftcardEnable()) {
                let canRefundGiftCard = order.items.some(item => {
                    return (item.qty_invoiced - item.qty_refunded - item.qty_canceled) > 0;
                });
                if (canRefundGiftCard) return canRefundGiftCard;
            }

            let totalRefunded = CurrencyHelper.round(NumberHelper.minusNumber(order.total_paid, order.total_refunded));
            if (Math.abs(totalRefunded) < 0.0001) {
                return false;
            }

            if (Math.abs(NumberHelper.minusNumber(totalRefunded, order.adjustment_negative)) < 0.0001) {
                return false;
            }
            return true;
        }

        return false;
    }

    /**
     * Retrieve order unhold availability
     *
     * @param order
     * @return {boolean}
     */
    canUnhold(order) {
        if (this.isPaymentReview(order)) {
            return false;
        }
        return order.state === StatusConstant.STATE_HOLDED;
    }

    /**
     * Retrieve order cancel availability
     *
     * @param order
     * @return {boolean}
     */
    canCancel(order) {
        if (order) {
            if (!this.canVoidOrder(order)) return false;
            if (this.canUnhold(order)) return false;
            // chi co payment online moi check dc dieu kien nay
            // if (!this.canReviewPayment(order) && this.canFetchPaymentReviewUpdate(order)) {
            //     return false;
            // }
            let allInvoiced = true;
            let allItems = this.getAllItems(order);
            for (let i = 0; i < allItems.length; i++) {
                let item = allItems[i];
                if (OrderItemService.getQtyToInvoice(item, order)) {
                    allInvoiced = false;
                    break;
                }
            }
            if (allInvoiced) return false;
            let state = order.state;
            if (this.isCanceled(order) || state === StatusConstant.STATE_COMPLETE || state === StatusConstant.STATE_CLOSED) {
                return false;
            }
            // Action flag dung cho server check online
            // if ($this->getActionFlag(self::ACTION_FLAG_CANCEL) === false) {
            //     return false;
            // }

            return true;
        }
        return false;
    }

    /**
     * Retrieve order void availability
     *
     * @param order
     * @return {boolean}
     */
    canVoidOrder(order) {
        return !(this.isCanceled(order) || this.canUnhold(order) || this.isPaymentReview(order));
    }

    /**
     * Get list item in order
     *
     * @param order
     * @return {items}
     */
    getAllItems(order) {
        let items = [];
        order.items.map(item => {
            if (!item.isDeleted) {
                items.push(item);
            }
            return null;
        });
        return items;
    }


    /**
     * Check whether the payment is in payment review state
     * In this state order cannot be normally processed. Possible actions can be:
     * - accept or deny payment
     * - fetch transaction information
     *
     * @param order
     * @return {boolean}
     */
    isPaymentReview(order) {
        return order.state === StatusConstant.STATE_PAYMENT_REVIEW;
    }

    /**
     * Check whether order is canceled
     *
     * @param order
     * @return {boolean}
     */
    isCanceled(order) {
        return order.state === StatusConstant.STATE_CANCELED;
    }

    /**
     * add comment to order
     *
     * @param order
     * @param commentText
     * @param notify
     * @param visibleOnFront
     * @return {*}
     */
    addComment(order, commentText, notify = false, visibleOnFront = false) {
        if (!order.status_histories) {
            order.status_histories = [];
        }
        let createAt = DateTimeHelper.getDatabaseDateTime();
        let comment = {
            comment: commentText,
            created_at: createAt,
            entity_id: this.getNextCommentEntityId(order),
            is_visible_on_front: +visibleOnFront
        };
        order.status_histories.unshift(comment);
        return order;
    }


    /**
     * send email to customer
     *
     * @param increment_id
     * @param email
     * @return {*}
     */
    async sendEmail(increment_id, email) {
        let orderResource = this.getResourceModel(OrderResourceModel);
        let url_api = orderResource.getResourceOnline().getPathSendEmailOrder();
        let params = {
            increment_id: increment_id,
            email: email
        };
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_SEND_EMAIL_ORDER, url_api, SyncConstant.METHOD_POST, params
        );
    }

    /**
     * cancel order
     * @param order
     * @param commentText
     * @param notify
     * @param visibleOnFront
     * @returns {Promise.<*>}
     */
    async cancel(order, commentText, notify, visibleOnFront) {
        // cacultor offline
        let comment = '';
        if (commentText) {
            if (!order.status_histories) {
                order.status_histories = [];
            }
            let createAt = DateTimeHelper.getDatabaseDateTime();
            comment = {
                comment: commentText,
                created_at: createAt,
                entity_id: this.getNextCommentEntityId(order),
                is_visible_on_front: +visibleOnFront
            };
            order.status_histories.unshift(comment);
        }

        try {
            if (this.canCancel(order) || this.isPaymentReview(order) || this.isFraudDetected(order)) {
                let state = StatusConstant.STATE_CANCELED;
                let items = [];
                this.getAllItems(order).forEach(item => {
                    if ((state !== StatusConstant.STATE_PROCESSING) && OrderItemService.getQtyToRefund(item, order)) {
                        if (OrderItemService.isProcessingAvailable(item, order)) {
                            state = StatusConstant.STATE_PROCESSING;
                        } else {
                            state = StatusConstant.STATE_COMPLETE;
                        }
                    }
                    item = OrderItemService.cancel(item, order);
                    items.push(item);
                });

                order.items = items;

                order.subtotal_canceled = order.subtotal - order.subtotal_invoiced;
                order.base_subtotal_canceled = order.base_subtotal - order.base_subtotal_invoiced;

                order.tax_canceled = order.tax_amount - order.tax_invoiced;
                order.base_tax_canceled = order.base_tax_amount - order.base_tax_invoiced;

                order.shipping_cancel = order.shipping - order.shipping_invoiced;
                order.base_shipping_cancel = order.base_shipping - order.base_shipping_invoiced;

                order.disccount_canceled = Math.abs(order.discount_amount - order.discount_invoiced);
                order.base_disccount_canceled = Math.abs(order.base_discount_amount - order.base_discount_invoiced);


                order.total_canceled = order.grand_total - order.total_paid;
                order.base_total_canceled = order.base_grand_total - order.base_total_paid;

                order.state = state;

                if (Config.orderStatus) {
                    let statusData = Config.orderStatus.find(item => (item.state === state) && (item.is_default === '1') );
                    if (statusData) {
                        order.status = statusData.status
                    }
                }

                // can set statu (sau khi co config tra ve)
                //     $this->setState($state)
                // ->setStatus($this->getConfig()->getStateDefaultStatus($state));


                // action log
                let orderResource = this.getResourceModel(OrderResourceModel);
                orderResource.saveToDb([order]);
                orderResource.reindexTable();
                let url_api = orderResource.getResourceOnline().getPathCancelOrder();
                let params = {
                    increment_id: order.increment_id,
                    comment: comment
                };

                await  ActionLogService.createDataActionLog(
                    SyncConstant.REQUEST_CANCEL_ORDER, url_api, SyncConstant.METHOD_POST, params
                );
            } else {
                toast.error(
                    i18n.translator.translate('Cancel order not available'),
                    {className: 'wrapper-messages messages-warning'}
                );
            }
        }
        catch (error) {
            console.log(error.message);
        }


        return order;
    }


    /**
     * get next comment entity id
     * @param order
     * @returns {number}
     */
    getNextCommentEntityId(order) {
        if (!order.status_histories || !order.status_histories.length) {
            return 1;
        }
        return Math.max(...order.status_histories.map(item => item.entity_id)) + 1;
    }

    /**
     * save order status to local storage
     * @param orderStatus
     */
    saveOrderStatus(orderStatus) {
        let data = JSON.stringify(orderStatus);
        LocalStorageHelper.set(LocalStorageHelper.ORDER_STATUS, data);
        Config.orderStatus = orderStatus;
    }

    /**
     * get order status from local storage
     * @return {*|string}
     */
    getOrderStatus() {
        return LocalStorageHelper.get(LocalStorageHelper.ORDER_STATUS);
    }

    /**
     * process Payment
     * @param order
     * @return {Promise<{order_increment_id: string|*}>}
     */
    async processPayment(order) {
        let promises = [];
        order.payments.forEach(payment => {
            let process = Promise.resolve({});

            if (
                (!payment.reference_number && PaymentHelper.hasUsingCreditCardForm(payment.method))
                && !payment.is_paid
            ) {
                process = PaymentFactory.createByCode(payment.method).setOrder(order).setPayment(payment).execute();
            }
            promises.push(process)
        });

        let responses = await Promise.all(promises);
        let errors = [];
        let processPayments = {};

        responses.forEach((response, index) => {
            processPayments[order.payments[index].method + index] = response;
            response.errorMessage && errors.push(response.errorMessage);
        });

        if (errors.length) {
            return {
                error: true,
                message: errors.join(', '),
                processPayments
            };
        }

        return {
            error: false,
            processPayments
        };

    }

    /**
     * isFraudDetected
     * @param order
     * @returns {boolean}
     */
    isFraudDetected(order) {
        return order.state === StatusConstant.STATE_PAYMENT_REVIEW && order.status === StatusConstant.STATUS_FRAUD
    }

    /**
     * get list order statuses
     * @return {Promise<any>}
     */
    getListOrderStatuses() {
        return this.getResourceModel().getListOrderStatuses();
    }

    /**
     * get order by increment ids
     * @param ids
     * @returns {*|Promise}
     */
    getOrderByIncrementIds(ids) {
        return this.getResourceModel().getOrderByIncrementIds(ids);
    }

    /**
     * get out of permission orders
     * @param queryService
     * @return {*|Promise<any>}
     */
    getOutOfPermissionOrders(queryService = {}) {
        return this.getResourceModel().getOutOfPermissionOrders(queryService);
    }
}

/** @type OrderService */
let orderService = ServiceFactory.get(OrderService);

export default orderService;