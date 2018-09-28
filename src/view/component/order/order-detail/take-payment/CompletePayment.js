import React from 'react';
import CoreComponent from "../../../../../framework/component/CoreComponent";
import PaymentDetailItem from "./CompletePaymentItem";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import {Modal} from 'react-bootstrap';
import SmoothScrollbar from "smooth-scrollbar/index";
import OrderAction from "../../../../action/OrderAction";
import OrderHelper from "../../../../../helper/OrderHelper";
import PaymentHelper from "../../../../../helper/PaymentHelper";
import i18n from "../../../../../config/i18n";
import {toast} from "react-toastify";
import PaymentConstant from "../../../../constant/PaymentConstant";
import StoreCreditService from "../../../../../service/store-credit/StoreCreditService";

class CompletePayment extends CoreComponent {
    static className = 'CompletePayment';
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
        this.state = {
            isOpenCompletePaymentPopup: false,
            isTaking: false,
            modalContent: ""
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
        const { response, error, order } = nextProps;

        if (error) {
            this.updateErrorPayment(error);
            await this.setState({isTaking: false});
        }

        if (response) {
            // update reference
            this.updateSuccessPayment(nextProps.response);
        }

        let isSuccessAll = PaymentHelper.isSuccessAll(order.payments);
        if (isSuccessAll && this.state.isTaking) {
            return this._takePayment();
        }


    }
    onbeforeunload = () => {
        const { order } = this.props;
        return PaymentHelper.hasPaidOrWaitingGatewayPayment(order.payments) ? true : null;
    };
    /**
     *
     * @param {object} response
     */
    updateSuccessPayment(response) {
        let { order } = this.props;
        let newPayments = [...order.payments];

        if (newPayments[response.index]) {
            newPayments[response.index].status = PaymentConstant.PROCESS_PAYMENT_SUCCESS;
            response.card_type             && ( newPayments[response.index].card_type = response.card_type );
            response.reference_number      && (
                newPayments[response.index].reference_number = response.reference_number
            );
            response.pos_paypal_invoice_id && (
                newPayments[response.index].pos_paypal_invoice_id = response.pos_paypal_invoice_id
            );
            response.receipt && (
                newPayments[response.index].receipt = response.receipt
            );
            order = {...order, payments: newPayments};
        }
    }
    /**
     *
     * @param {object} error
     */
    updateErrorPayment(error) {
        let { order } = this.props;
        let newPayments = [...order.payments];

        if (newPayments[error.index]) {
            newPayments[error.index].status       = PaymentConstant.PROCESS_PAYMENT_ERROR;
            newPayments[error.index].errorMessage = error.message;
            order = {...order, payments: newPayments};
        }
    }
    /**
     * get payment info
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
            paymentData = this.props.payments.filter((item) => item.code === method)[0];
        }
        return {...paymentData, index: index};
    }

    /**
     * Handle click delete payment
     * @param indexPayment
     */
    deletePayment(indexPayment) {
        this.props.deletePayment(indexPayment);
    }

    /**
     * Add more payment methods
     */
    addPayment() {
        this.props.addPayment(this.props.remain);
    }

    /**
     * Handle click edit payment
     * @param paymentData
     */
    editPayment(paymentData) {
        this.props.selectPayment(paymentData, this.props.remain);
    }

    /**
     * handle click complete order
     */
    clickCompletePayment() {
        if (this.props.remain > 0) {
            this.markAsPartial();
        } else {
            this.takePayment();
        }
    }

    /**
     * Take payment
     */
    async takePayment() {
        this.setState({ isOpenCompletePaymentPopup: false });

        const { order } = this.props;

        if (!window.navigator.onLine && PaymentHelper.hasUsingGatewayPayment(order)) {
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

        this.setState({ isTaking: true });

        // start process payment
        let isProcessedAllPayment = PaymentHelper.isSuccessAll(order.payments);
        if (!isProcessedAllPayment) {

            order.payments = order.payments.map(payment => {
                if (payment.is_paid) {
                    payment.status = PaymentConstant.PROCESSED_PAYMENT;
                    return payment;
                }

                payment['status'] = PaymentConstant.PROCESS_PAYMENT_PENDING;
                return payment;
            });

            return this.props.actions.processPayment(order);
        }

        this._takePayment();
    }

    _takePayment() {
        this.props.actions.takePayment(this.props.order);
        this.props.closeTakePayment();
    }

    /**
     * Handle click mark as partial
     */
    markAsPartial() {
        let totalPaid = 0;
        this.props.order.payments.map(item => !item.is_paid && (totalPaid += item.amount_paid));
        let modalContent = this.props.t(
            "{{totalPaid}} has been received",
            {totalPaid: OrderHelper.formatPrice(totalPaid, this.props.order)}
        );
        this.setState({
            isOpenCompletePaymentPopup: true,
            modalContent: modalContent
        });
    }

    /**
     * Cancel popup
     */
    cancelPopup() {
        this.setState({
            isOpenCompletePaymentPopup: false,
        });
    }

    /**
     * Render template
     * @returns {*}
     */
    template() {
        const { order, remain } = this.props;
        const cancelable = !PaymentHelper.hasPaidOrWaitingGatewayPayment(order.payments);
        const isWaitingProcessPaymentComplete = PaymentHelper.isWaitingProcessPaymentComplete(order.payments);

        return (
            <div className="wrapper-payment full-width active" id="wrapper-payment3">
                <div className="block-title">
                    <button
                        className="btn-cannel"
                        onClick={() => this.props.cancelTakePayment()}
                        style={{
                            display: cancelable ? 'block' : 'none'
                        }}
                    >
                        {this.props.t('Cancel')}
                    </button>
                    <strong className="title">{this.props.t('Take Payment Order #') + order.increment_id}</strong>
                </div>
                <div className="block-content" data-scrollbar ref={this.setCompleteOrderElement}>
                    <ul className="payment-total">
                        {
                            remain >= 0 ?
                                <li className="total">
                                    <span className="label">{this.props.t('Remaining')}</span>
                                    <span className="value">{OrderHelper.formatPrice(remain, order)}</span>
                                </li>
                                :
                                <li className="total">
                                    <span className="label">{this.props.t('Change')}</span>
                                    <span className="value">{OrderHelper.formatPrice(-remain, order)}</span>
                                </li>
                        }
                    </ul>
                    <div>
                        {
                            order.payments.length > 0 ?
                                order.payments.map((item, index) => {
                                    let paymentData = this.getPaymentData(item.method, index);
                                    if (item.is_paid) {
                                        return null;
                                    }
                                    return <PaymentDetailItem
                                        key={index}
                                        payment={item}
                                        paymentData={paymentData}
                                        deletePayment={(indexPayment) => this.deletePayment(indexPayment)}
                                        editPayment={(paymentData) => this.editPayment(paymentData)}
                                        order={order}
                                    />
                                })
                                :
                                null
                        }
                        {
                            remain > 0 ? (
                                <div className="payment-full-amount add-payment"
                                     onClick={() => this.addPayment()}>
                                    <div className="info">
                                        <span className="label">{this.props.t('Add Payment')}</span>
                                    </div>
                                    <a className="add-cash"> </a>
                                </div>
                            ) : null
                        }
                    </div>
                </div>
                <div className="block-bottom">
                    <div className="actions-accept">
                        <button
                                className={"btn btn-default btn-complete " +
                                ( isWaitingProcessPaymentComplete ? 'disabled' : '')}
                                type="button"
                                data-toggle="modal"
                                data-target="#popup-completeOrder"
                                onClick={() => this.clickCompletePayment()}>
                            {this.props.t(remain > 0 ? 'Mark as Partial' : 'Complete Payment')}
                        </button>
                    </div>
                </div>
                <div>
                    <Modal
                        bsSize={"small"}
                        className={"popup-messages"}
                        id={"popup-completeOrder"}
                        show={this.state.isOpenCompletePaymentPopup} onHide={() => this.cancelPopup()}>
                        <Modal.Body>
                            <h3 className="title">{this.props.t('Confirm Partial Payment')}</h3>
                            <p>{this.state.modalContent}</p>
                        </Modal.Body>
                        <Modal.Footer className={"modal-footer actions-2column"}>
                            <a onClick={() => this.cancelPopup()}>{this.props.t('Cancel')}</a>
                            <a onClick={() => this.takePayment()}>{this.props.t('Mark as Partial')}</a>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        )
    }
}

class CompletePaymentContainer extends CoreContainer {
    static className = "CompletePaymentContainer";

    /**
     * map state to props
     * @param state
     * @return {{payments: takePaymentReducer.payments}}
     */
    static mapState(state) {
        const {
            payments,
            response,
            error
        } = state.core.order.takePayment;

        return {
            payments,
            response,
            error
        };
    }

    /**
     * map dispatch to props
     * @param dispatch
     * @return {{actions: {takePayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                takePayment: (order) => dispatch(OrderAction.takePayment(order)),
                processPayment: (order) => dispatch(OrderAction.processPayment(order)),
            }
        }
    }
}

/**
 * @type {CompletePayment}
 */
export default ContainerFactory.get(CompletePaymentContainer).getConnect(
    ComponentFactory.get(CompletePayment)
);