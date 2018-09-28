import React, {Fragment} from 'react';
import {CoreComponent} from "../../../framework/component/index";
import CoreContainer from "../../../framework/container/CoreContainer";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import SelectPayment from "./payment/SelectPayment";
import EditPayment from './payment/EditPayment';
import CompleteOrder from './complete-order/CompleteOrder';
import PaymentConstant from "../../constant/PaymentConstant";
import PaymentAction from "../../action/PaymentAction";
import '../../style/css/Payment.css';

export class Payment extends CoreComponent {
    static className = 'Payment';

    /**
     * componentWillMount
     */
    componentWillMount() {

    }

    /**
     * This function after mapStateToProps then set list payment to state
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if(nextProps.remain) {
            this.setState({
                remain: nextProps.remain
            });
        }
    }

    /**
     * Select payment
     * @param payment
     */
    selectPayment(payment, remain = undefined) {
        this.props.actions.selectPayment(payment, remain);
    }

    /**
     * cash in
     * @param money
     */
    cashIn() {
        this.switchPage(PaymentConstant.PAYMENT_PAGE_COMPLETE_ORDER);
    }

    /**
     * switch page payment
     * @param page
     */
    switchPage(page){
        this.props.actions.switchPage(page);
    }

    /**
     * Reset State
     */
    resetState() {
        this.props.actions.resetState();
    }

    /**
     * Add new payment
     */
    addPayment(remain) {
        this.props.actions.addPayment(remain);
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let { paymentPage, payment, remain} = this.props;
        return (
            <Fragment>
                {
                    paymentPage === PaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT &&
                    <SelectPayment selectPayment={(payment, remain) => this.selectPayment(payment, remain)}
                                   switchPage={(paymentpage) => this.switchPage(paymentpage)}
                                   remain={remain}/>
                }
                {
                    paymentPage === PaymentConstant.PAYMENT_PAGE_EDIT_PAYMENT &&
                    <EditPayment paymentMethod={payment}
                                     cashIn={()=>this.cashIn()}
                                     remain={remain}
                                     switchPage={(paymentpage) => this.switchPage(paymentpage)} />
                }
                {
                    paymentPage === PaymentConstant.PAYMENT_PAGE_COMPLETE_ORDER &&
                    <CompleteOrder selectPayment={(payment, remain) => this.selectPayment(payment, remain)}
                                   resetState={() => this.resetState()}
                                   addPayment={(remain) => this.addPayment(remain)}/>
                }
            </Fragment>
        );
    }
}

class PaymentContainer extends CoreContainer {
    static className = 'PaymentContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        let {resetPaymentState} = state.core.checkout.index;
        let {paymentPage, payment, amountPaid, remain} = state.core.checkout.payment;
        return {
            quote,
            resetPaymentState,
            paymentPage,
            payment,
            amountPaid,
            remain
        };
    }

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                selectPayment: (payment, remain) => dispatch(PaymentAction.selectPayment(payment, remain)),
                switchPage: (paymentpage) => dispatch(PaymentAction.switchPage(paymentpage)),
                resetState: () => dispatch(PaymentAction.resetState()),
                addPayment: (remain) => dispatch(PaymentAction.addPayment(remain)),
            }
        }
    }
}

export default ContainerFactory.get(PaymentContainer).withRouter(
    ComponentFactory.get(Payment)
)