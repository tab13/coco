import {AbstractOrderService} from "../AbstractService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import OrderService from "../OrderService";
import CreditmemoFactoryService from "./CreditmemoFactoryService";
import SubtotalService from "./creditmemo/total/SubtotalService";
import WeeeService from "../../weee/creditmemo/total/WeeeService";
import DiscountService from "./creditmemo/total/DiscountService";
import ShippingService from "./creditmemo/total/ShippingService";
import TaxService from "./creditmemo/total/TaxService";
import CostService from "./creditmemo/total/CostService";
import GrandTotalService from "./creditmemo/total/GrandTotalService";
import GiftcardTotalService from "../../giftcard/order/creditmemo/total/GiftcardTotalService";
import CreditmemoPriceService from "./creditmemo/CreditmemoPriceService";
import cloneDeep from 'lodash/cloneDeep';
import {toast} from "react-toastify";
import i18n from "../../../config/i18n";
import NumberHelper from "../../../helper/NumberHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import AppStore from "../../../view/store/store";
import CreditmemoAction from "../../../view/action/order/CreditmemoAction";
import PaymentConstant from "../../../view/constant/PaymentConstant";
import CreditmemoPointTotal from "../../reward-point/order/creditmemo/total/PointTotalService";
import Config from "../../../config/Config";
import LocationHelper from "../../../helper/LocationHelper";
import DateTimeHelper from "../../../helper/DateTimeHelper";
import CustomPrefixHelper from "../../../helper/CustomPrefixHelper";
import OrderHelper from "../../../helper/OrderHelper";
import {RewardPointHelper} from "../../../helper/RewardPointHelper";
import GiftcardHelper from "../../../helper/GiftcardHelper";

export class CreditmemoService extends AbstractOrderService {
    static className = 'CreditmemoService';

    isInitTotalCollectors = false;

    totalModels = [
        {
            name: "subtotal",
            class: SubtotalService,
            sort_order: 50
        },
        {
            name: "discount",
            class: DiscountService,
            sort_order: 150
        },
        {
            name: "weee",
            class: WeeeService,
            sort_order: 100
        },
        {
            name: "shipping",
            class: ShippingService,
            sort_order: 200
        },
        {
            name: "rewardpoint",
            class: CreditmemoPointTotal,
            sort_order: 210
        },
        {
            name: "giftvoucher",
            class: GiftcardTotalService,
            sort_order: 220
        },
        {
            name: "tax",
            class: TaxService,
            sort_order: 250
        },
        {
            name: "cost_total",
            class: CostService,
            sort_order: 300
        },
        {
            name: "grand_total",
            class: GrandTotalService,
            sort_order: 400
        },
    ];

    acceptedPaymentMethods = [
        PaymentConstant.CASH,
        PaymentConstant.CREDIT_CARD,
        PaymentConstant.TYRO_INTEGRATION,
    ];

    /**
     * @param creditmemo
     * @return {boolean}
     */
    createCreditmemo(creditmemo) {
        let params = creditmemo.params;
        let data = params.creditmemo;
        let order = cloneDeep(creditmemo.order);
        creditmemo.order = order;
        creditmemo.isValidated = true;
        if (!OrderService.canCreditmemo(order)) {
            return false;
        }
        let savedData = typeof data.items !== 'undefined' ? data.items : {};
        let qtys = {};
        let backToStock = {};

        Object.keys(savedData).forEach(orderItemId => {
            let itemData = savedData[orderItemId];
            if (typeof itemData.qty !== 'undefined') {
                qtys[orderItemId] = itemData.qty;
            }
            if (typeof itemData.back_to_stock !== 'undefined' && itemData.back_to_stock) {
                backToStock[orderItemId] = true;
            }
        });
        data.qtys = qtys;
        creditmemo = CreditmemoFactoryService.createByOrder(creditmemo, order, data);
        creditmemo.items.forEach(item => {
            let orderItem = item.order_item;
            let parentId = orderItem.parent_item_id;
            if (parentId && backToStock[parentId] && backToStock[parentId] === true) {
                item.back_to_stock = true;
            } else if (backToStock[orderItem.item_id] && backToStock[orderItem.item_id] === true) {
                item.back_to_stock = true;
            }
        });
        if (creditmemo) {
            this.collectTotals(creditmemo);
            if (data.comment_text) {
                this.addComment(
                    creditmemo,
                    data.comment_text,
                    data.comment_customer_notify === true,
                    data.is_visible_on_front === true
                );
                creditmemo.customer_note = data.comment_text;
                creditmemo.customer_note_notify = data.comment_customer_notify;
                creditmemo.order.customer_note_notify = data.send_email;
            }
            if (data.payments && data.payments.length) {
                data.payments.forEach(payment => {
                    if (payment.amount_paid > 0) {
                        this.addComment(
                            creditmemo,
                            i18n.translator.translate(
                                'Refund {{amount}} by {{payment}}',
                                {amount: OrderHelper.formatPrice(payment.amount_paid, order), payment: payment.title}
                            ),
                            data.comment_customer_notify === true,
                            data.is_visible_on_front === true
                        );
                    }
                });
                creditmemo.payments = data.payments;
            } else {
                creditmemo.payments = null;
            }
        } else {
            return false;
        }
        if (
            creditmemo.order
            && creditmemo.order.rewardpoints_spent
            && RewardPointHelper.isEnabledRewardPoint()
        ) {
            creditmemo.allow_zero_grand_total = true;
        }
        if (
            creditmemo.order
            && creditmemo.order.gift_voucher_discount
            && GiftcardHelper.isGiftcardEnable()
        ) {
            creditmemo.allow_zero_grand_total = true;
        }
        return creditmemo;
    }

    /**
     * Init total collectors
     */
    initTotalCollectors() {
        if (!this.isInitTotalCollectors) {
            AppStore.dispatch(CreditmemoAction.salesOrderCreditmemoInitTotalCollectors(this));
            this.isInitTotalCollectors = true;
        }
    }

    /**
     * Reset creditmemo data before collect total
     *
     * @param creditmemo
     */
    resetCreditmemoData(creditmemo) {
        creditmemo.grand_total = 0;
        creditmemo.base_grand_total = 0;
    }

    /**
     * Creditmemo totals collecting
     *
     * @param creditmemo
     * @return {*}
     */
    collectTotals(creditmemo) {
        this.initTotalCollectors();
        this.totalModels.sort((a, b) => a.sort_order - b.sort_order);
        CreditmemoPriceService.resetCalculators();
        this.resetCreditmemoData(creditmemo);
        this.totalModels.map(model => model.class.collect(creditmemo));
        return creditmemo;
    }

    /**
     * add comment to credit memo
     *
     * @param creditmemo
     * @param commentText
     * @param notify
     * @param visibleOnFront
     * @return {*}
     */
    addComment(creditmemo, commentText, notify = false, visibleOnFront = false) {
        if (!creditmemo.comments) {
            creditmemo.comments = [];
        }
        let comment = {
            comment: commentText,
            is_customer_notified: notify ? 1 : 0,
            is_visible_on_front: visibleOnFront ? 1 : 0
        };
        comment.parent_id = creditmemo.id;
        creditmemo.comments.push(comment);
        return creditmemo;
    }

    /**
     * @param creditmemo
     * @return {boolean}
     */
    isValidGrandTotal(creditmemo) {
        return !((creditmemo.grand_total ? creditmemo.grand_total : 0) <= 0 && !creditmemo.allow_zero_grand_total);
    }

    /**
     * Validate credit memo grand total
     *
     * @param creditmemo
     */
    validate(creditmemo) {
        if(creditmemo.allow_zero_grand_total && (creditmemo.grand_total ? creditmemo.grand_total : 0) < 0) {
            creditmemo.isValidated = false;
            toast.error(
                i18n.translator.translate("The refund total must be larger than zero."),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 2000
                }
            );
            return false;
        }
        if (!this.isValidGrandTotal(creditmemo)) {
            creditmemo.isValidated = false;
            toast.error(
                i18n.translator.translate("The refund total must be positive."),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 2000
                }
            );
            return false;
        }
        let order = creditmemo.order;
        let orderRefund = CurrencyHelper.roundToFloat(
            NumberHelper.addNumber(order.total_refunded, creditmemo.grand_total)
        );
        if (orderRefund > CurrencyHelper.roundToFloat(order.total_paid)) {
            creditmemo.isValidated = false;
            let availableRefund = NumberHelper.minusNumber(order.total_paid, order.total_refunded);
            availableRefund = OrderHelper.formatPrice(availableRefund, order);
            toast.error(
                i18n.translator.translate(
                    "The maximum value allowed to refund is {{amount}}", {amount: availableRefund}
                ), {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 2000
                }
            );
        }
    }

    generateIncrementId(creditmemo) {
        if (!creditmemo.increment_id) {
            let currentTimestamp = new Date().getTime();
            let databaseCurrentTime = DateTimeHelper.getDatabaseDateTime(currentTimestamp);
            let increment_id = Config.pos_id + '-' + currentTimestamp;
            increment_id = CustomPrefixHelper.getUseCustomPrefix() ?
                CustomPrefixHelper.getCustomPrefix() + increment_id :
                increment_id;
            creditmemo.increment_id = increment_id;
            creditmemo.created_at = databaseCurrentTime;
            creditmemo.updated_at = databaseCurrentTime;
            creditmemo.pos_location_id = LocationHelper.getId();
        }
        return creditmemo;
    }

    /**
     * Prepare error list for creditmemo
     * @param creditmemo
     * @return {*}
     */
    prepareErrors(creditmemo) {
        if (!creditmemo.errors) {
            creditmemo.errors = {};
        }
        return creditmemo;
    }
}

/** @type CreditmemoService */
let creditmemoService = ServiceFactory.get(CreditmemoService);

export default creditmemoService;