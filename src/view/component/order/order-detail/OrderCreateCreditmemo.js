import React, {Fragment} from 'react';
import "../../../style/css/OrderCreateCreditmemo.css";
import {CoreComponent} from "../../../../framework/component/index";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CreateCreditmemoConstant from "../../../constant/order/creditmemo/CreateCreditmemoConstant";
import StepItem from "./create-creditmemo/CreateCreditmemoStepItem";
import StepAdjustment from "./create-creditmemo/CreateCreditmemoStepAdjustment";
import StepPayment from "./create-creditmemo/CreateCreditmemoStepPayment";
import StepSuccess from "./create-creditmemo/CreateCreditmemoStepSuccess";
import OrderItemService from "../../../../service/sales/order/OrderItemService";
import ProductService from "../../../../service/catalog/ProductService";
import StockService from "../../../../service/catalog/StockService";
import CreditmemoService from "../../../../service/sales/order/CreditmemoService";
import CreditmemoItemService from "../../../../service/sales/order/creditmemo/CreditmemoItemService";
import NumberHelper from "../../../../helper/NumberHelper";
import DateTimeHelper from "../../../../helper/DateTimeHelper";
import OrderHelper from "../../../../helper/OrderHelper";
import StockHelper from "../../../../helper/StockHelper";
import TaxHelper from "../../../../helper/TaxHelper";
import RewardPointService from "../../../../service/reward-point/RewardPointService";
import Config from "../../../../config/Config";
import PaymentConstant from "../../../constant/PaymentConstant";

class OrderCreateCreditmemoComponent extends CoreComponent {
    static className = 'OrderCreateCreditmemoComponent';

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            creditmemo: {},
            max_allowed_shipping_refund: this.getMaxAllowedShippingRefund(props.order),
            step: CreateCreditmemoConstant.STEP_ITEM,
            isPreparingCreditmemoParams: true,
            show_cancel_popup: false,
            creditmemo_items_param: {},
            items_total: {},
            payments: [],
            adjustments: {},
            comment_text: "",
            is_using_max_qty: false,
            is_first_view_payment_step: true,
            payment_step_grand_total: 0
        };
        this.prepareCreditmemoParams(props.order);
    }

    /**
     * Function run when component's props is changed
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.order && nextProps.order.increment_id &&
            (!this.props.order || !this.props.order.increment_id ||
                nextProps.order.increment_id !== this.props.order.increment_id)
        ) {
            this.prepareCreditmemoParams(nextProps.order);
        }
    }

    /**
     * Prepare credit memo params
     *
     * @param order
     * @return {Promise<void>}
     */
    async prepareCreditmemoParams(order) {
        if (order && order.items) {
            let stocks = await ProductService.getStockProducts(order.items.map(item => item.product_id));
            let creditmemo_items_param = {};
            let canSubtractQty = StockHelper.canSubtractQty();
            order.items.forEach(item => {
                let canReturnStock = this.canReturnStock(stocks[item.product_id]);
                creditmemo_items_param[item.item_id] = {
                    order_item: item,
                    product_stocks: stocks[item.product_id],
                    qty: 0,
                    qty_to_refund: OrderItemService.getQtyToRefund(item, order),
                    back_to_stock: canSubtractQty && canReturnStock,
                    can_return_stock: canReturnStock,
                    non_shipped_qty_to_return: this.getNonShippedQtyToReturn(item),
                    is_qty_decimal: stocks[item.product_id] && stocks[item.product_id].length ?
                        StockService.isQtyDecimal(stocks[item.product_id][0]) : false,
                    error_message: "",
                };
            });

            this.setState({
                creditmemo_items_param,
                isPreparingCreditmemoParams: false
            }, () => this.setCreditmemo());
        }
    }

    /**
     * Check product can return stock
     *
     * @param productStocks
     * @return {boolean}
     */
    canReturnStock(productStocks) {
        return productStocks && productStocks.length ?
            StockService.getManageStock(productStocks[0]) : false;
    }

    /**
     * Get non shipped qty
     *
     * @param orderItem
     * @return {*}
     */
    getNonShippedQtyToReturn(orderItem) {
        return Math.max(
            NumberHelper.addNumber(orderItem.qty_invoiced, -orderItem.qty_shipped, -orderItem.qty_refunded),
            0
        );
    }

    /**
     * set state creditmemo
     *
     * @param callback
     */
    setCreditmemo(callback) {
        let creditmemo = this.getCreditmemo();
        this.setState({creditmemo}, () => {
            this.collectCreditmemoItemsParamTotal();
            if (typeof callback === 'function') {
                callback();
            }
        });
    }

    /**
     * Get creditmemo by params
     *
     * @return {{order, params: {creditmemo: {items: {}}}}}
     */
    getCreditmemo() {
        let order = this.props.order,
            creditmemo_items_param = this.state.creditmemo_items_param,
            adjustments = this.state.adjustments,
            payments = this.state.payments,
            items = {};
        Object.keys(creditmemo_items_param).forEach(itemId => {
            let item = creditmemo_items_param[itemId];
            items[item.order_item.item_id] = {
                qty: item.qty,
                back_to_stock: item.back_to_stock
            }
        });
        let creditmemo = {
            order: order,
            params: {
                creditmemo: {
                    items: items,
                    comment_text: this.state.comment_text,
                    comment_customer_notify: 1,
                    send_email: 1,
                    is_visible_on_front: 1,
                    payments: payments
                }
            }
        };

        if (this.state.step === CreateCreditmemoConstant.STEP_ITEM) {
            creditmemo.params.creditmemo[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] = 0;
            creditmemo.params.creditmemo[CreateCreditmemoConstant.ADJUSTMENT_POSITIVE_KEY] = 0;
            creditmemo.params.creditmemo[CreateCreditmemoConstant.ADJUSTMENT_NEGATIVE_KEY] = 0;
        } else if (adjustments) {
            Object.keys(adjustments).forEach(key => {
                creditmemo.params.creditmemo[key] = adjustments[key];
            });
        }
        creditmemo = CreditmemoService.createCreditmemo(creditmemo);
        creditmemo = CreditmemoService.generateIncrementId(creditmemo);


        return creditmemo;
    }

    /**
     * Collect credit memo items param total
     */
    collectCreditmemoItemsParamTotal() {
        let creditmemo = this.state.creditmemo;
        let creditmemo_items_param = this.state.creditmemo_items_param;
        let items_total = {qty_to_refund: 0, qty: 0, price: 0, fpt: 0, tax: 0, discount: 0, total_amount: 0};
        if (creditmemo && creditmemo.items && creditmemo.items.length) {
            creditmemo.items.forEach(item => {
                let itemParam = creditmemo_items_param[item.order_item_id];
                if (itemParam) {
                    let price = CreditmemoItemService.getPrice(item);
                    let fpt = CreditmemoItemService.getFPT(item);
                    let tax = CreditmemoItemService.getTax(item);
                    let discount = CreditmemoItemService.getDiscount(item);
                    let total_amount = CreditmemoItemService.getTotalAmount(item);
                    itemParam.price = CreditmemoItemService.formatPrice(price, creditmemo);
                    itemParam.fpt = CreditmemoItemService.formatPrice(fpt, creditmemo);
                    itemParam.tax = CreditmemoItemService.formatPrice(tax, creditmemo);
                    itemParam.discount = CreditmemoItemService.formatPrice(-discount, creditmemo);
                    itemParam.total_amount = CreditmemoItemService.formatPrice(total_amount, creditmemo);
                    if (itemParam.qty_to_refund > 0) {
                        items_total.qty_to_refund = NumberHelper.addNumber(
                            items_total.qty_to_refund, itemParam.qty_to_refund
                        );
                        items_total.qty = NumberHelper.addNumber(items_total.qty, itemParam.qty);
                        items_total.price = NumberHelper.addNumber(items_total.price, price);
                        items_total.fpt = NumberHelper.addNumber(items_total.fpt, fpt);
                        items_total.tax = NumberHelper.addNumber(items_total.tax, tax);
                        items_total.discount = NumberHelper.addNumber(items_total.discount, discount);
                        items_total.total_amount = NumberHelper.addNumber(
                            items_total.total_amount, total_amount
                        );
                    }
                }
            });
            items_total.price = CreditmemoItemService.formatPrice(items_total.price, creditmemo);
            items_total.fpt = CreditmemoItemService.formatPrice(items_total.fpt, creditmemo);
            items_total.tax = CreditmemoItemService.formatPrice(items_total.tax, creditmemo);
            items_total.discount = CreditmemoItemService.formatPrice(-items_total.discount, creditmemo);
            items_total.total_amount = CreditmemoItemService.formatPrice(items_total.total_amount, creditmemo);
        }
        this.setState({creditmemo_items_param, items_total})
    }

    /**
     * Get max allowed shipping refund
     *
     * @param order
     * @return {*|number}
     */
    getMaxAllowedShippingRefund(order) {
        let orderShippingAmount = order.shipping_amount;
        let allowedAmount = NumberHelper.minusNumber(orderShippingAmount, order.shipping_refunded);
        let allowedTaxAmount = NumberHelper.minusNumber(order.shipping_tax_amount, order.shipping_tax_refunded);
        let allowedAmountInclTax = NumberHelper.addNumber(allowedAmount, allowedTaxAmount);
        let useAmountsWithTax = TaxHelper.orderDisplayShippingAmountIncludeTax();
        return useAmountsWithTax ? allowedAmountInclTax : allowedAmount;
    }

    /**
     * Cancel creditmemo
     */
    cancel() {
        /*if (this.state.items_total.qty > 0) {*/
        this.setState({show_cancel_popup: true});
        /*} else {
            this.props.cancelCreditmemo();
        }*/
    }

    /**
     * Get Step label
     *
     * @param step
     */
    getStepLabel(step) {
        switch (step) {
            case CreateCreditmemoConstant.STEP_ITEM:
                return this.props.t("Items");
            case CreateCreditmemoConstant.STEP_ADJUSTMENT:
                return this.props.t("Adjustments");
            case CreateCreditmemoConstant.STEP_PAYMENT:
                return this.props.t("Payment Method");
            case CreateCreditmemoConstant.STEP_SUCCESS:
                return this.props.t("Success");
            default:
                return this.props.t("");
        }
    }

    /**
     * Change step
     */
    changeStep(next = true) {
        let step = this.state.step + (next ? 1 : -1);
        let is_first_view_payment_step = this.state.is_first_view_payment_step;
        let payment_step_grand_total = this.state.payment_step_grand_total;
        if (step === CreateCreditmemoConstant.STEP_PAYMENT) {
            if (this.state.is_first_view_payment_step !== true) {
                if (payment_step_grand_total !== this.state.creditmemo.grand_total) {
                    let payments = this.state.payments;
                    if (payments && payments.length) {
                        payments.forEach(payment => {
                            payment.amount_paid = 0;
                            payment.base_amount_paid = 0;
                            payment.error = "";
                        });
                        this.setState({payments});
                    }
                }
            } else {
                is_first_view_payment_step = false;
            }
            payment_step_grand_total = this.state.creditmemo.grand_total;
        }
        this.setState({step, is_first_view_payment_step, payment_step_grand_total});
    }

    /**
     * Use max qty
     *
     * @param on
     */
    useMaxQty(on = true) {
        let creditmemo_items_param = this.state.creditmemo_items_param;
        let resetAdjustment = false;
        Object.keys(creditmemo_items_param).forEach(itemId => {
            let item = creditmemo_items_param[itemId];
            let oldQty = item.qty;
            item.qty = on ? item.qty_to_refund : 0;
            if (+oldQty !== +item.qty) {
                resetAdjustment = true;
            }
        });
        if (resetAdjustment) {
            this.resetAdjustments();
        }
        this.setState({creditmemo_items_param, is_using_max_qty: on}, () => this.setCreditmemo());
    }

    /**
     * Update creditmemo item param
     * @param creditmemoItemParam
     * @param data
     * @param updateCreditmemo
     */
    updateCreditmemoItemParam(creditmemoItemParam, data = {}, updateCreditmemo = false) {
        let creditmemo_items_param = this.state.creditmemo_items_param;
        if (creditmemo_items_param[creditmemoItemParam.order_item.item_id]) {
            let oldQty = creditmemo_items_param[creditmemoItemParam.order_item.item_id].qty;
            if (typeof data.qty !== 'undefined') {
                let error_message = "";
                if (data.qty > creditmemoItemParam.qty_to_refund) {
                    error_message = this.props.t("Qty to Refund cannot be greater than Qty Left.");
                    data.qty = creditmemoItemParam.qty_to_refund;
                }
                if (data.qty < 0) {
                    error_message = this.props.t("Qty to Refund cannot be smaller than 0.");
                    data.qty = 0;
                }
                data.error_message = error_message;
            }
            if (+oldQty !== +data.qty) {
                this.resetAdjustments();
            }
            Object.assign(creditmemo_items_param[creditmemoItemParam.order_item.item_id], data);
            this.setState(
                {creditmemo_items_param: creditmemo_items_param},
                () => updateCreditmemo ? this.setCreditmemo() : false
            )
        }
    }

    /**
     * Reset adjustments
     */
    resetAdjustments(callback) {
        let adjustments = this.state.adjustments;
        adjustments[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] = this.state.max_allowed_shipping_refund;
        adjustments[CreateCreditmemoConstant.ADJUSTMENT_POSITIVE_KEY] = 0;
        adjustments[CreateCreditmemoConstant.ADJUSTMENT_NEGATIVE_KEY] = 0;

        let {maxReturnSpend, maxAdjustmentEarned} =
            RewardPointService.getMaxReturnSpendAndMaxAdjustmentEarned(
                this.state.creditmemo,
                this.props.order
            );

        adjustments[CreateCreditmemoConstant.ADJUSTMENT_EARNED_KEY] = maxAdjustmentEarned;
        adjustments[CreateCreditmemoConstant.RETURN_SPENT_KEY] = maxReturnSpend;
        this.setState(adjustments, () => {
            if (typeof callback === 'function') {
                callback();
            }
        });
    }

    /**
     * Change adjustments
     *
     * @param adjustments
     * @param callback
     */
    changeAdjustment(adjustments = {}, callback) {
        this.setState(
            {adjustments: {...this.state.adjustments, ...adjustments}},
            () => {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        );
    }

    /**
     * Add payments
     *
     * @param addPayments
     */
    addPayments(addPayments = []) {
        addPayments = addPayments.map(payment => {
            payment.payment_date = DateTimeHelper.getDatabaseDateTime(new Date().getTime());
            if (typeof payment.base_amount_paid === 'undefined' && typeof payment.amount_paid !== 'undefined') {
                payment.base_amount_paid = OrderHelper.convertToBase(payment.amount_paid, this.props.order);
            }

            payment.errorMessage = '';
            payment.status = PaymentConstant.PROCESS_PAYMENT_NEW;
            payment.payment_date = DateTimeHelper.getDatabaseDateTime(new Date().getTime());
            payment.shift_increment_id = Config.current_session ? Config.current_session.shift_increment_id : "";

            return payment;
        });
        let payments = this.state.payments;
        payments.push(...addPayments);
        return this.setState({payments: payments});
    }

    /**
     * Remove payment by index
     *
     * @param index
     */
    removePayment(index) {
        let payments = this.state.payments;
        payments.splice(index, 1);
        return this.setState({payments: payments});
    }

    /**
     * Update payment
     *
     * @param updatePayment
     * @param paymentIndex
     * @param data
     */
    updatePayment(updatePayment, paymentIndex, data = {}) {
        data.payment_date = DateTimeHelper.getDatabaseDateTime(new Date().getTime());
        if (typeof data.base_amount_paid === 'undefined' && typeof data.amount_paid !== 'undefined') {
            data.base_amount_paid = OrderHelper.convertToBase(data.amount_paid, this.props.order);
        }
        let payments = this.state.payments;
        payments.forEach((payment, index) => {
            payment.error = "";
            if (index === paymentIndex) {
                Object.assign(payment, data);
            }
        });
        this.setState({payments});
    }

    /**
     * Set comment text
     *
     * @param comment_text
     */
    setCommentText(comment_text) {
        this.setState({comment_text: comment_text})
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="wrapper-refund-order">
                    <div className="block-title">
                        <button className={
                            this.state.step === CreateCreditmemoConstant.STEP_SUCCESS ? "hidden" : "btn-cannel"
                        }
                                onClick={() => this.cancel()}>
                            {this.props.t('Cancel')}
                        </button>
                        <strong className="title">
                            {
                                this.props.t('Refund {{step}} - Order #{{id}}',
                                    {
                                        step: this.getStepLabel(this.state.step),
                                        id: this.props.order.increment_id
                                    }
                                )
                            }
                        </strong>
                        <div className={this.state.step === CreateCreditmemoConstant.STEP_SUCCESS ? "hidden" : "price"}>
                            {
                                CreditmemoItemService.formatPrice(
                                    this.state.creditmemo.grand_total, this.state.creditmemo
                                )
                            }
                        </div>
                    </div>
                    {
                        this.state.step === CreateCreditmemoConstant.STEP_ITEM ?
                            <StepItem creditmemo={this.state.creditmemo}
                                      order={this.props.order}
                                      creditmemo_items_param={this.state.creditmemo_items_param}
                                      items_total={this.state.items_total}
                                      is_using_max_qty={this.state.is_using_max_qty}
                                      updateCreditmemoItemParam={(creditmemoItemParam, data, updateCreditmemo) =>
                                          this.updateCreditmemoItemParam(creditmemoItemParam, data, updateCreditmemo)}
                                      useMaxQty={(on) => this.useMaxQty(on)}
                                      changeStep={() => this.changeStep()}
                                      setCreditmemo={(callback) => this.setCreditmemo(callback)}
                            /> : null
                    }
                    {
                        this.state.step === CreateCreditmemoConstant.STEP_ADJUSTMENT ?
                            <StepAdjustment creditmemo={this.state.creditmemo}
                                            order={this.props.order}
                                            changeStep={(next) => this.changeStep(next)}
                                            adjustments={this.state.adjustments}
                                            max_allowed_shipping_refund={this.state.max_allowed_shipping_refund}
                                            changeAdjustment={
                                                (adjustments, callback) => this.changeAdjustment(adjustments, callback)
                                            }
                                            resetAdjustments={callback => this.resetAdjustments(callback)}
                                            setCreditmemo={(callback) => this.setCreditmemo(callback)}
                                            getCreditmemo={() => this.getCreditmemo()}
                            /> : null
                    }
                    {
                        this.state.step === CreateCreditmemoConstant.STEP_PAYMENT ?
                            <StepPayment creditmemo={this.state.creditmemo}
                                         order={this.props.order}
                                         payments={this.state.payments}
                                         comment_text={this.state.comment_text}
                                         addPayments={(payments) => this.addPayments(payments)}
                                         removePayment={(index) => this.removePayment(index)}
                                         updatePayment={(updatePayment, paymentIndex, data) =>
                                             this.updatePayment(updatePayment, paymentIndex, data)}
                                         setCommentText={comment_text => this.setCommentText(comment_text)}
                                         getCreditmemo={() => this.getCreditmemo()}
                                         setCreditmemo={(callback) => this.setCreditmemo(callback)}
                                         changeStep={(next) => this.changeStep(next)}
                            /> : null
                    }
                    {
                        this.state.step === CreateCreditmemoConstant.STEP_SUCCESS ?
                            <StepSuccess creditmemo={this.state.creditmemo}
                                         order={this.props.order}
                                         cancelCreditmemo={() => this.props.cancelCreditmemo()}
                                         changeStep={(next) => this.changeStep(next)}
                            /> : null
                    }
                </div>
                {
                    this.state.show_cancel_popup ?
                        (
                            <div className="modal fade in popup-messages" role="dialog" style={{display: 'block'}}>
                                <div className="modal-dialog modal-sm" role="document">
                                    <div className="modal-content">
                                        <div className="modal-body">
                                            <h3 className="title">{this.props.t('Cancel Refund')}</h3>
                                            <p>{this.props.t('Are you sure you want to cancel this refund?')}</p>
                                        </div>
                                        <div className="modal-footer actions-2column">
                                            <a className="close-modal"
                                               onClick={() => this.setState({show_cancel_popup: false})}>
                                                {this.props.t('No')}
                                            </a>
                                            <a className="close-modal"
                                               onClick={() => this.props.cancelCreditmemo()}>
                                                {this.props.t('Yes')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null
                }
            </Fragment>
        );
    }
}

class OrderCreateCreditmemoContainer extends CoreContainer {
    static className = 'OrderCreateCreditmemoContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        return {};
    }

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {}
        }
    }
}

/**
 * @type {OrderCreateCreditmemoContainer}
 */
export default ContainerFactory.get(OrderCreateCreditmemoContainer).withRouter(
    ComponentFactory.get(OrderCreateCreditmemoComponent)
)