import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {CoreComponent} from "../../../../../framework/component/index";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import PaymentItem from "./PaymentItem";
import '../../../../style/css/SelectPayment.css';
import SmoothScrollbar from "smooth-scrollbar/index";
import $ from "jquery";
import TakePaymentConstant from "../../../../constant/order/TakePaymentConstant";
import PaymentAction from "../../../../action/PaymentAction";
import OrderHelper from "../../../../../helper/OrderHelper";
import ConfigHelper from "../../../../../helper/ConfigHelper";
import CustomerService from "../../../../../service/customer/CustomerService";
import TakePaymentService from "../../../../../service/sales/order/TakePaymentService";

export class OrderSelectPayment extends CoreComponent {
    static className = 'OrderSelectPayment';
    setPopupPaymentElement = element => {
        this.popup_payment = element;
        if (!this.scrollbar && this.popup_payment) {
            this.scrollbar = SmoothScrollbar.init(this.popup_payment);
            this.heightPopup('.wrapper-payment');
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        let customer_id = props.order.customer_id;
        this.state = {
            items: [],
            customer: props.customer,
            isStoreCredit: ConfigHelper.isEnableStoreCredit() && customer_id,
            isLoading: ConfigHelper.isEnableStoreCredit() && customer_id
        }
    }

    /**
     * componentWillMount: load list payment when start
     */
    componentWillMount() {
        this.props.actions.getListPayment();
    }

    /**
     * This function after mapStateToProps then set list payment to state
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            items: nextProps.payments
        }, async () => {
            if (this.state.isStoreCredit) {
                let addedNewPayment = nextProps.order.payments.filter(payment => !payment.is_paid);
                if(addedNewPayment.length <= 0) {
                    try {
                        let customer = await CustomerService.getById(nextProps.order.customer_id);
                        this.setState({
                            customer: customer,
                            items: TakePaymentService.addAndCheckPayments(
                                customer,
                                nextProps.payments,
                                nextProps.order.payments),
                            isLoading: false
                        })
                    } catch (e) {
                        this.setState({
                            items: TakePaymentService.addAndCheckPayments(
                                null,
                                nextProps.payments,
                                nextProps.order.payments),
                            isLoading: false
                        })
                    }
                } else {
                    this.setState({
                        items: TakePaymentService.addAndCheckPayments(
                            this.state.customer,
                            nextProps.payments,
                            nextProps.order.payments),
                        isLoading: false
                    })
                }
            } else {
                this.setState({isLoading: false});
            }
        });
    }

    /**
     * select payment
     * @param payment
     */
    selectPayment(payment) {
        this.props.selectPayment(payment, this.props.remain);
        this.props.setCustomer(this.state.customer);
    }

    /**
     * back to complete payment page
     */
    handleBack() {
        this.props.switchPage(TakePaymentConstant.PAYMENT_PAGE_COMPLETE_PAYMENT);
    }

    /**
     *  setWrapperPayment
     * @param content
     */
    setWrapperPayment(content) {
        if (content && !this.wrapperPayment) {
            this.wrapperPayment = content;
        }
    }

    /**
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        let height = $( window ).height();
        $(elm).css('height', height + 'px');
    }


    template() {
        let {order, remain} = this.props;
        let {isLoading} = this.state;
        let isRemain = (remain < order.grand_total);
        let addedNewPayment = order.payments.filter(payment => !payment.is_paid);
        let classContentRemain = addedNewPayment.length ?
            "block-content block-content1" : "block-content block-content1 no-remain";
        let classContent = isLoading ? "hidden" : classContentRemain;
        return (
            <Fragment>
                <div className="wrapper-payment full-width active" id="wrapper-payment1"
                     ref={this.setWrapperPayment.bind(this)}>
                    <div className="block-title">
                        <button className="btn-cannel" onClick={() => this.props.cancelTakePayment()}>
                            {this.props.t('Cancel')}
                        </button>
                        <strong className="title">{this.props.t('Take Payment Order #') + order.increment_id}</strong>
                    </div>
                    <div className={classContent} data-scrollbar
                         ref={this.setPopupPaymentElement} tabIndex={1}>
                        <ul className="payment-total">
                            <li>
                                <span className="label">{this.props.t((isRemain ? 'Remaining' : 'Total'))}</span>
                                <span className="value">{OrderHelper.formatPrice(remain, order)}</span>
                            </li>
                        </ul>
                        <ul className="payment-list">
                            {
                                this.state.items.map((payment) => {
                                    return <PaymentItem key={payment.code}
                                                        remain={this.props.remain}
                                                        order={order}
                                                        payment={payment}
                                                        selectPayment={(payment) => this.selectPayment(payment)}/>;
                                })
                            }
                        </ul>
                    </div>
                    {
                        addedNewPayment.length ?
                        <div className="block-bottom">
                            <div className="actions-accept">
                                <button className="btn btn-default btn-cannel" type="button"
                                        onClick={() => this.handleBack()}>
                                    {this.props.t("Back")}
                                </button>
                            </div>
                        </div>
                        :
                        ''
                    }
                    {
                        <div className="loader-product"
                             style={{display: isLoading ? 'block' : 'none'}}>
                        </div>
                    }
                </div>
            </Fragment>
        )
    }
}

OrderSelectPayment.propTypes = {
    selectPayment: PropTypes.func
};

class OrderSelectPaymentContainer extends CoreContainer {
    static className = 'OrderSelectPaymentContainer';

    /**
     * map state to props
     * @param state
     * @return {{payments: *}}
     */
    static mapState(state) {
        let {payments} = state.core.order.takePayment;
        return {payments: payments};
    }

    /**
     * map dispatch to props
     * @param dispatch
     * @return {{actions: {getListPayment: function(): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                getListPayment: () => dispatch(PaymentAction.getListPayment()),
            }
        }
    }
}

export default ContainerFactory.get(OrderSelectPaymentContainer).withRouter(
    ComponentFactory.get(OrderSelectPayment)
);