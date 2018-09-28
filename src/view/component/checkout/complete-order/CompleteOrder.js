import React from 'react';
import PropTypes from 'prop-types';
import CoreComponent from "../../../../framework/component/CoreComponent";
import CompleteOrderPaymentItem from "./CompleteOrderPaymentItem";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import QuoteAction from "../../../action/checkout/QuoteAction";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CheckoutAction from "../../../action/CheckoutAction";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import {Modal} from 'react-bootstrap';
import SmoothScrollbar from "smooth-scrollbar/index";
import PaymentHelper from "../../../../helper/PaymentHelper";
import {toast} from "react-toastify";
import i18n from "../../../../config/i18n";
import PaymentAction from "../../../action/PaymentAction";
import StoreCreditService from "../../../../service/store-credit/StoreCreditService";
import PaymentConstant from "../../../constant/PaymentConstant";

class CompleteOrder extends CoreComponent {
    static className = 'CompleteOrder';
    setCompleteOrderElement = element => {
        this.complete_order = element;
        if (!this.scrollbar && this.complete_order) {
            this.scrollbar = SmoothScrollbar.init(this.complete_order);
        }
    };

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        let roundGrandTotal = CurrencyHelper.round(props.quote.base_grand_total,
            CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
        let roundTotalPaid = CurrencyHelper.round(this.calculateTotalPaid(props),
            CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
        this.state = {
            remain: roundGrandTotal - roundTotalPaid,
            total: props.quote.base_grand_total,
            isOpenCompleteOrderPopup: false,
            isPlacing: false,
            modalContent: "",
        };

        // show alert confirm if refresh
        window.onbeforeunload =  this.onbeforeunload;
    }

    componentWillUnmount() {
        window.onbeforeunload =  null;
    }

    /**
     * Component will receive props - set remain state
     *
     * @param nextProps
     */
    async componentWillReceiveProps(nextProps) {
        await this.setState(
            {
                remain: nextProps.quote.base_grand_total - this.calculateTotalPaid(nextProps),
                total: nextProps.quote.base_grand_total,
            }
        );

        const { error, quote } = nextProps;
        if (error) {
            await this.setState({ isPlacing: false });
        }

        let isSuccessAll = PaymentHelper.isSuccessAll(quote.payments);
        if (isSuccessAll && this.state.isPlacing) {
            return this._placeAndPrint(
                nextProps.additionalData ? {...nextProps.additionalData} : false
            );
        }

    }

    onbeforeunload = () => {
        const { quote } = this.props;
        return PaymentHelper.hasPaidOrWaitingGatewayPayment(quote.payments) ? true : null;
    };
    /**
     * Calculate total paid
     * @returns {number}
     */
    calculateTotalPaid(props) {
        let totalPaid = 0;
        props.quote.payments.map((item) => totalPaid += item.base_amount_paid);
        return totalPaid;
    }

    /**
     * get payment info
     *
     * @param method
     * @param index
     * @return {{index: *}}
     */
    getPaymentData(method, index) {
        let paymentData;
        // check store credit and return object store credit default
        if (method === PaymentConstant.STORE_CREDIT) {
            paymentData = StoreCreditService.storeCreditDefault();
        } else {
            paymentData = this.props.payments.find((item) => item.code === method);
        }
        return {...paymentData, index: index};
    }

    /**
     * Handle click delete payment
     * @param indexPayment
     */
    deletePayment(indexPayment) {
        let payments = this.props.quote.payments.filter((item, index) => index !== indexPayment);
        this.props.actions.setPayments(payments);
        if (payments.length === 0) {
            return this.props.resetState();
        }
    }

    /**
     * Add more payment methods
     */
    addPayment() {
        this.props.addPayment(this.state.remain);
    }

    /**
     * Handle click edit payment
     * @param paymentData
     */
    editPayment(paymentData) {
        this.props.selectPayment(paymentData, this.state.remain);
    }

    /**
     * handle click complete order
     */
    clickCompleteOrder() {
        if (this.state.remain > 0) {
            this.markAsPartial();
        } else {
            this.placeOrder();
        }
    }

    /**
     * Place Order
     * @return {Promise<any>|*|{type: string, quote: *}|Promise<{order_increment_id: *}>}
     */
    async placeOrder() {
        const { quote } = this.props;
        this.setState({ isOpenCompleteOrderPopup: false });

        if (!window.navigator.onLine && PaymentHelper.hasUsingGatewayPayment(quote)) {
            return toast.error(
                i18n.translator.translate(
                    'Connection failed. You must connect to a Wi-Fi or cellular data network to use this payment method'
                ),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 3000
                }
            );
        }

        this.setState({ isPlacing: true });

        let isSuccessAll = PaymentHelper.isSuccessAll(quote.payments);
        // start process payment
        if (!isSuccessAll) {
            await this.props.actions.prepareProcessPayment(this.props.quote);
            return this.props.actions.processPayment(this.props.quote);
        }

        this._placeAndPrint();
    }

    /**
     *
     * @param additionalData
     * @private
     */
    _placeAndPrint(additionalData = false) {
        this.props.actions.placeOrder(this.props.quote, additionalData);
        this.setState({
            isPlacing: false
        });
        /**
         *   trigger print
         *
         *   todo: config auto show print or not
         *
         */

        // if (isMobile) {
        //     return;
        // }
        //
        // let timeout = setTimeout(() => {
        //     document.getElementById('triggerPrintButton').click();
        //     clearTimeout(timeout);
        // }, 1000)
    }

    /**
     * Handle click mark as partial
     */
    markAsPartial() {
        let totalPaid = this.getDisplayValue(this.calculateTotalPaid(this.props));
        let total = this.getDisplayValue(this.state.total);
        let modalContent = totalPaid
            + this.props.t(" has been paid towards the ")
            + total
            + this.props.t(" total of this order. Press ‘Complete order’ to continue.");
        this.setState({
            isOpenCompleteOrderPopup: true,
            modalContent: modalContent
        });
    }

    /**
     * get display value
     * @param value
     * @returns {*}
     */
    getDisplayValue(value) {
        return CurrencyHelper.convertAndFormat(value);
    }

    /**
     * Cancel popup
     */
    cancelPopup() {
        this.setState({
            isOpenCompleteOrderPopup: false,
        });
    }

    /**
     * Render template
     * @returns {*}
     */
    template() {
        const { quote, t } = this.props;
        const { remain } = this.state;
        let isWaitingProcessPaymentComplete = PaymentHelper.isWaitingProcessPaymentComplete(quote.payments);
        let title = remain >= 0 ? 'Remaining' : 'Change' ;
        let blockContentClassName = ['block-content'];
        let isNoPaymentScreen = !quote.payments.length && !remain;

        if (isNoPaymentScreen) {
            title = 'Total';
            blockContentClassName.push('block-no-payment');
        }

        return (
            <div className="wrapper-payment active" id="wrapper-payment3">
                <div className="block-title">
                    <strong className="title">
                        {this.props.t(this.state.remain > 0 ? 'Split Payment' : 'Payment')}
                    </strong>
                </div>
                <div className={blockContentClassName.join(' ')}
                     data-scrollbar
                     ref={this.setCompleteOrderElement}
                >
                    <ul className="payment-total">
                        {
                            <li className="total">
                                <span className="label">{this.props.t(title)}</span>
                                <span className="value">{this.getDisplayValue(Math.abs(this.state.remain))}</span>
                            </li>
                        }
                    </ul>
                    {
                        !quote.payments.length ? (
                            <div className="no-payment-required">
                                <span className="img"/>
                                <p>{t('No Payment method required.')}</p>
                            </div>
                        ) : ''
                    }
                    <div>
                        {
                            quote.payments.length > 0 ?
                                this.props.quote.payments.map((item, index) => {
                                    let paymentData = this.getPaymentData(item.method, index);
                                    return <CompleteOrderPaymentItem
                                        key={index}
                                        payment={item}
                                        paymentData={paymentData}
                                        deletePayment={(indexPayment) => this.deletePayment(indexPayment)}
                                        editPayment={(paymentData) => this.editPayment(paymentData)}
                                    />
                                })
                                :
                                ''
                        }
                        {
                            this.state.remain > 0 ? (
                                <div className="payment-full-amount add-payment"
                                     onClick={() => this.addPayment()}>
                                    <div className="info">
                                        <span className="label">{this.props.t('Add Payment')}</span>
                                    </div>
                                    <a className="add-cash"> </a>
                                </div>
                            ) : ''
                        }
                    </div>
                </div>
                <div className="block-bottom">
                    <div className="actions-accept">
                        <button
                            className={"btn btn-default btn-complete " +
                            (isWaitingProcessPaymentComplete ? 'disabled' : '')}
                            type="button"
                            data-toggle="modal"
                            data-target="#popup-completeOrder"
                            onClick={() => this.clickCompleteOrder()}>
                            {this.props.t(this.state.remain > 0 ? 'Mark as Partial' : 'Complete Order')}
                        </button>
                    </div>
                </div>
                <div>
                    <Modal
                        bsSize={"small"}
                        className={"popup-messages"}
                        id={"popup-completeOrder"}
                        show={this.state.isOpenCompleteOrderPopup} onHide={() => this.cancelPopup()}>
                        <Modal.Body>
                            <h3 className="title">{this.props.t('Payment Incomplete')}</h3>
                            <p>{this.state.modalContent}</p>
                        </Modal.Body>
                        <Modal.Footer className={"modal-footer actions-2column"}>
                            <a onClick={() => this.cancelPopup()}>{this.props.t('Cancel')}</a>
                            <a onClick={() => this.placeOrder()}>{this.props.t('Complete Order')}</a>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        )
    }
}

class CompleteOrderContainer extends CoreContainer {
    static className = "CompleteOrderContainer";

    /**
     * map state to props
     * @param state
     * @returns {{quote: *, payments: Payment.state.payment.payments|String.payments|paymentReducer.payments}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        let {payments} = state.core.checkout.payment;
        let {
            error,
            response,
            additionalData
        } = state.core.checkout.completeOrder;
        return {
            quote,
            payments,
            error,
            response,
            additionalData
        };
    }

    /**
     * map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {setPayments: function(*=, *=): *, placeOrder: function(*=, *=): *, prepareProcessPayment: function(*=): *, processPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                setPayments: (payments, remain) => dispatch(QuoteAction.setPayments(payments, remain)),
                placeOrder: (quote, additionalData) => dispatch(CheckoutAction.placeOrder(quote, additionalData)),
                prepareProcessPayment: (quote) => dispatch(PaymentAction.prepareProcessPayment(quote)),
                processPayment: (quote) => dispatch(CheckoutAction.processPayment(quote)),
            }
        }
    }
}

CompleteOrder.propTypes = {
    selectPayment: PropTypes.func.isRequired,
    resetState: PropTypes.func.isRequired,
};

export default ContainerFactory.get(CompleteOrderContainer).getConnect(
    ComponentFactory.get(CompleteOrder)
);