import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../framework/component/index";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import OrderSelectPayment from "./take-payment/OrderSelectPayment";
import OrderEditPayment from './take-payment/OrderEditPayment';
import CompletePayment from './take-payment/CompletePayment';
import '../../../style/css/Payment.css';
import '../../../style/css/StoreCredit.css';
import TakePaymentConstant from "../../../constant/order/TakePaymentConstant";
import TakePaymentAction from "../../../action/order/TakePaymentAction";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import NumberHelper from "../../../../helper/NumberHelper";

class OrderTakePayment extends CoreComponent {
    static className = 'OrderTakePayment';

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            customer: null
        }
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
     * set customer
     * @param customer
     */
    setCustomer(customer) {
        this.setState({customer: customer});
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
     */
    cashIn() {
        this.switchPage(TakePaymentConstant.PAYMENT_PAGE_COMPLETE_PAYMENT);
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
     * delete payment
     * @param indexPayment
     */
    deletePayment(indexPayment) {
        let payments = this.props.order.payments.filter((item, index) => index !== indexPayment);
        this.props.order.payments = payments;
        let newAddedPayment = payments.filter(payment => !payment.is_paid);
        if (newAddedPayment.length === 0) {
            this.resetState();
        }
        this.setState({a: ''});
    }

    /**
     * close take payment
     */
    closeTakePayment() {
        this.props.closeTakePayment();
        this.props.actions.resetState();
    }

    /**
     * cancel take payment
     */
    cancelTakePayment() {
        this.props.order.payments = this.props.order.payments.filter(payment => payment.is_paid);
        this.closeTakePayment();
    }

    /**
     * get remain
     * @param order
     * @return {*|number}
     */
    getRemain(order) {
        let totalPaid = 0;
        let remain = 0;
        if (order && order.payments && order.payments.length) {
            order.payments.map(item => totalPaid = NumberHelper.addNumber(totalPaid, item.amount_paid));
            remain = order.grand_total - totalPaid;
        }
        return CurrencyHelper.roundToFloat(remain);
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        let {order, paymentPage, payment} = this.props;
        let {customer} = this.state;
        let remain = this.getRemain(order);
        return (
            <Fragment>
                {
                    paymentPage === TakePaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT &&
                    <OrderSelectPayment selectPayment={(payment, remain) => this.selectPayment(payment, remain)}
                                        switchPage={(paymentpage) => this.switchPage(paymentpage)}
                                        setCustomer={(customer) => this.setCustomer(customer)}
                                        customer={customer}
                                        remain={remain}
                                        order={order}
                                        cancelTakePayment={() => this.cancelTakePayment()}/>
                }
                {
                    paymentPage === TakePaymentConstant.PAYMENT_PAGE_EDIT_PAYMENT &&
                    <OrderEditPayment paymentMethod={payment}
                                      cashIn={()=>this.cashIn()}
                                      remain={remain}
                                      switchPage={(paymentpage) => this.switchPage(paymentpage)}
                                      order={order}
                                      customer={customer}
                                      cancelTakePayment={() => this.cancelTakePayment()}/>
                }
                {
                    paymentPage === TakePaymentConstant.PAYMENT_PAGE_COMPLETE_PAYMENT &&
                    <CompletePayment selectPayment={(payment, remain) => this.selectPayment(payment, remain)}
                                     resetState={() => this.resetState()}
                                     addPayment={(remain) => this.addPayment(remain)}
                                     order={order}
                                     cancelTakePayment={() => this.cancelTakePayment()}
                                     remain={remain}
                                     deletePayment={(indexPayment) => this.deletePayment(indexPayment)}
                                     closeTakePayment={() => this.closeTakePayment()}/>
                }
            </Fragment>
        );
    }
}

class OrderTakePaymentContainer extends CoreContainer {
    static className = 'OrderTakePaymentContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        let {paymentPage, payment, amountPaid, remain} = state.core.order.takePayment;
        return {
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
                selectPayment: (payment, remain) => dispatch(TakePaymentAction.selectPayment(payment, remain)),
                switchPage: (paymentpage) => dispatch(TakePaymentAction.switchPage(paymentpage)),
                resetState: () => dispatch(TakePaymentAction.resetState()),
                addPayment: (remain) => dispatch(TakePaymentAction.addPayment(remain)),
            }
        }
    }
}

/**
 * @type {OrderTakePayment}
 */
export default ContainerFactory.get(OrderTakePaymentContainer).withRouter(
    ComponentFactory.get(OrderTakePayment)
)