import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../../framework/component/index";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import SmoothScrollbar from "smooth-scrollbar/index";
import OrderPaymentMethodComponent from "./step-payment/CreateCreditmemoStepPaymentOrderPaymentMethod";
import ConfirmationComponent from "./step-payment/CreateCreditmemoStepPaymentConfirmation";
import AddPaymentComponent from "./step-payment/CreateCreditmemoStepPaymentAddPayment";
import OrderHelper from "../../../../../helper/OrderHelper";
import NumberHelper from "../../../../../helper/NumberHelper";
import CreateCreditmemoConstant from "../../../../constant/order/creditmemo/CreateCreditmemoConstant";
import CreditmemoService from "../../../../../service/sales/order/CreditmemoService";
import CreditmemoAction from "../../../../action/order/CreditmemoAction";
import i18n from "../../../../../config/i18n";
import PaymentHelper from "../../../../../helper/PaymentHelper";
import PaymentConstant from "../../../../constant/PaymentConstant";
import {toast} from "react-toastify";
import isEqual from "lodash/isEqual";

class CreateCreditmemoStepPaymentComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepPaymentComponent';

    setBlockContentElement = element => {
        if (this.scrollbar) {
            SmoothScrollbar.destroy(this.scrollbar);
        }
        if (element) {
            this.blockContentElement = element;
            this.scrollbar = SmoothScrollbar.init(this.blockContentElement);
        }
    };

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            remaining: 0,
            payment_confirm_step: CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_NONE,
            isRefunding: false
        };

        // show alert confirm if refresh
        window.onbeforeunload =  this.onbeforeunload;
    }

    /**
     *
     * @return {*}
     */
    onbeforeunload = () => {
        const { payments } = this.props;
        return PaymentHelper.hasPaidOrWaitingGatewayPayment(payments) ? true : null;
    };

    componentWillUnmount() {
        window.onbeforeunload =  null;
    }

    /**
     * Component will receive props - set remain state
     *
     * @param nextProps
     */
    async componentWillReceiveProps(nextProps) {
        const { response, error } = nextProps;

        if (error) {
            this.updateErrorPayment(error);
            await this.setState({
                isRefunding: false,
                payment_confirm_step: CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_NONE,
            });
        }

        if (response) {
            // update reference
            this.updateSuccessPayment(nextProps.response);
        }

        let isSuccessAll = PaymentHelper.isSuccessAll(this.props.payments);
        if (isSuccessAll && this.state.isRefunding) {
            return this.createCreditmemo();
        }


    }
    /**
     *
     * @param {object} response
     */
    updateSuccessPayment(response) {
        let { payments, updatePayment } = this.props;

        if (payments[response.index]) {
            let newPayment = {...payments[response.index]};
            newPayment.status = PaymentConstant.PROCESS_PAYMENT_SUCCESS;
            response.card_type             && ( newPayment.card_type = response.card_type );
            response.reference_number      && (
                newPayment.reference_number = response.reference_number
            );
            response.pos_paypal_invoice_id && (
                newPayment.pos_paypal_invoice_id = response.pos_paypal_invoice_id
            );

            response.receipt && (
                newPayment.receipt = response.receipt
            );

            !isEqual(newPayment, payments[response.index]) && updatePayment(newPayment, response.index, newPayment)
        }
    }
    /**
     *
     * @param {object} error
     */
    updateErrorPayment(error) {
        const { payments, updatePayment } = this.props;
        if (payments[error.index]) {
            let newPayment = {...payments[error.index]};
            newPayment.status       = PaymentConstant.PROCESS_PAYMENT_ERROR;
            newPayment.errorMessage = error.message;
            !isEqual(newPayment, payments[error.index]) && updatePayment(newPayment, error.index, newPayment)
        }
    }


    /**
     * Get remaining
     * @return {*|number}
     */
    getRemaining() {
        let paymentAmount = 0;
        if (this.props.payments && this.props.payments.length) {
            this.props.payments.forEach(payment => {
                paymentAmount = NumberHelper.addNumber(paymentAmount, payment.amount_paid);
            });
        }
        let remaining = NumberHelper.minusNumber(this.props.creditmemo.grand_total, paymentAmount);
        remaining = Math.min(remaining, this.props.creditmemo.grand_total);
        remaining = Math.max(remaining, 0);
        return remaining;
    }

    /**
     * Next step
     */
    nextStep() {
        let remaining = this.getRemaining();
        let confirmStep = this.state.payment_confirm_step;
        if (remaining > 0 && confirmStep === CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_NONE) {
            this.setState({payment_confirm_step: CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_REMAINING})
        } else if ((confirmStep === CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_NONE && remaining <= 0) ||
            confirmStep === CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_REMAINING) {
            this.setState({payment_confirm_step: CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_CONFIRMATION})
        } else if (confirmStep === CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_CONFIRMATION) {
            // start process payment
            if (!window.navigator.onLine && PaymentHelper.hasUsingGatewayPayment({ payments: this.props.payments })) {
                return toast.error(
                    i18n.translator.translate(
                        'Connection failed. ' +
                        'You must connect to a Wi-Fi or cellular data network to use this payment method'
                    ),
                    {
                        className: 'wrapper-messages messages-warning',
                        autoClose: 3000
                    }
                );
            }
            const {payments, updatePayment} = this.props;

            this.setState({
                isRefunding: true,
                payment_confirm_step: CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_PROCESS_PAYMENT,
            });
            // start process payment
            let isProcessedAllPayment = PaymentHelper.isSuccessAll(this.props.payments);
            if (!isProcessedAllPayment) {
                let newPayments = [];
                payments.forEach((payment, index) => {
                    let newPayment = {...payment};
                    if (newPayment.is_paid) {
                        newPayment.status = PaymentConstant.PROCESSED_PAYMENT;
                        return updatePayment(newPayment, index, newPayment);
                    }

                    newPayment.status = PaymentConstant.PROCESS_PAYMENT_PENDING;
                    newPayments.push({...newPayment});
                    return updatePayment(newPayment, index, newPayment);
                });

                return this.props.actions.processPayment({ isCreditmemo: true, payments: newPayments });
            }

            this.createCreditmemo();
        }
    }

    /**
     * Cancel popup
     */
    cancelPopup() {
        this.setState({payment_confirm_step: CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_NONE});
    }

    /**
     * Create creditmemo
     *
     * @return {boolean}
     */
    createCreditmemo() {
        this.setState({ isRefunding: false });

        let creditmemo = this.props.getCreditmemo();
        if (creditmemo) {
            creditmemo = CreditmemoService.generateIncrementId(creditmemo);
            CreditmemoService.validate(creditmemo);
            if (!creditmemo.isValidated) {
                return false;
            }
            this.props.setCreditmemo(() => {
                this.props.actions.createCreditmemo(this.props.creditmemo);
                this.props.changeStep();
            });
        }
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="block-content" ref={this.setBlockContentElement}>
                    <div className="block-refund-orderpayment">
                        <OrderPaymentMethodComponent order={this.props.order}/>
                    </div>
                    <div className="block-refund-payment">
                        <AddPaymentComponent order={this.props.order}
                                             creditmemo={this.props.creditmemo}
                                             payments={this.props.payments}
                                             scrollbar={this.scrollbar}
                                             addPayments={this.props.addPayments}
                                             removePayment={this.props.removePayment}
                                             updatePayment={this.props.updatePayment}
                                             getRemaining={() => this.getRemaining()}/>
                    </div>
                </div>
                <div className="block-bottom">
                    <div className="actions-accept">
                        <button className="btn btn-default btn-cannel"
                                type="button"
                                onClick={() => this.props.changeStep(false)}>
                            {this.props.t('Back')}
                        </button>
                        <button className="btn btn-default "
                                type="button"
                                onClick={() => this.nextStep()}>
                            {
                                this.props.t('Refund {{amount}}',
                                    {
                                        amount: OrderHelper.formatPrice(
                                            this.props.creditmemo.grand_total,
                                            this.props.order
                                        )
                                    }
                                )
                            }
                        </button>
                    </div>
                </div>
                {
                    this.state.payment_confirm_step === CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_REMAINING ||
                    this.state.payment_confirm_step === CreateCreditmemoConstant.PAYMENT_CONFIRM_STEP_CONFIRMATION ?
                        <ConfirmationComponent order={this.props.order}
                                               creditmemo={this.props.creditmemo}
                                               payment_confirm_step={this.state.payment_confirm_step}
                                               comment_text={this.props.comment_text}
                                               setCommentText={this.props.setCommentText}
                                               getRemaining={() => this.getRemaining()}
                                               cancelPopup={() => this.cancelPopup()}
                                               nextStep={() => this.nextStep()}/> :
                        null
                }

            </Fragment>
        );
    }
}

class CreateCreditmemoStepPaymentContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepPaymentContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        const { response, error } = state.core.order.creditmemo;

        return {
            response,
            error
        };
    }

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *,
     *     addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                createCreditmemo: creditmemo => dispatch(CreditmemoAction.createCreditmemo(creditmemo)),
                processPayment: creditmemo => dispatch(CreditmemoAction.processPayment(creditmemo))
            }
        }
    }
}

/**
 * @type {CreateCreditmemoStepPaymentContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepPaymentContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepPaymentComponent)
)