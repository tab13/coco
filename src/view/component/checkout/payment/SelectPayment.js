import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {CoreComponent} from "../../../../framework/component/index";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import {bindActionCreators} from 'redux';
import PaymentAction from "../../../action/PaymentAction";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import PaymentItem from "./PaymentItem";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import PaymentService from "../../../../service/payment/PaymentService";
import '../../../style/css/SelectPayment.css';
import PaymentConstant from "../../../constant/PaymentConstant";
import SmoothScrollbar from "smooth-scrollbar/index";
import $ from "jquery";


export class SelectPayment extends CoreComponent {
    static className = 'SelectPayment';
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
        this.state = {
            items: [],
            base_grand_total: 0
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
        let payments = nextProps.payments;
        let payments_selected = nextProps.payments_selected;
        let quote = nextProps.quote;
        this.setState({
            items: PaymentService.addAndCheckPayments(quote, payments, payments_selected, nextProps.isUpdate),
            base_grand_total: nextProps.base_grand_total
        }, () => {
            if (nextProps.isUpdate) {
                this.props.actions.updatePaymentList(false, this.state.items);
            }
        });
    }

    /**
     * select payment
     * @param payment
     */
    selectPayment(payment) {
        this.props.selectPayment(payment, this.props.remain);
    }

    /**
     * back to complete order page
     * @param
     */
    handleBack() {
        this.props.switchPage(PaymentConstant.PAYMENT_PAGE_COMPLETE_ORDER);
    }

    /**
     *  setWrapperPayment
     * @param content
     */
    setWrapperPayment(content) {
        if (content && !this.wrapperPayment) {
            this.wrapperPayment = content;
            let oriClass = this.wrapperPayment.className;
           setTimeout(() => {
               content.className = oriClass + ' active';
           }, 1)
        }
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
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        let height = $( window ).height();
        $(elm).css('height', height + 'px');
    }


    template() {
        let grand_total = this.getDisplayValue(this.state.base_grand_total);
        return (
            <Fragment>
                <div className="wrapper-payment" id="wrapper-payment1" ref={this.setWrapperPayment.bind(this)}>
                    <div className="block-title">
                        <strong className="title">{this.props.t('Payment')}</strong>
                    </div>
                    <div className={this.props.remain ?
                        "block-content block-content1" : "block-content block-content1 no-remain"}
                         data-scrollbar
                         ref={this.setPopupPaymentElement}
                         tabIndex={1}>
                        <ul className="payment-total">
                            {this.props.remain ?
                                <li>
                                    <span className="label">{this.props.t('Remaining')}</span>
                                    <span className="value">{this.getDisplayValue(this.props.remain)}</span>
                                </li>
                                :
                                <li>
                                    <span className="label">{this.props.t('Total')}</span>
                                    <span className="value">{grand_total}</span>
                                </li>
                            }
                        </ul>
                        <ul className="payment-list">
                            {
                                this.state.items.map((payment) => {
                                    return <PaymentItem key={Math.random() + payment.code}
                                                        payment={payment}
                                                        grand_total={this.state.base_grand_total}
                                                        remain={this.props.remain}
                                                        quote={this.props.quote}
                                                        selectPayment={(payment) => this.selectPayment(payment)}/>;
                                })
                            }
                        </ul>
                    </div>
                    { this.props.remain ?
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
                </div>
            </Fragment>
        )
    }
}

SelectPayment.propTypes = {
    selectPayment: PropTypes.func
};

class SelectPaymentContainer extends CoreContainer {
    static className = 'SelectPaymentContainer';

    /**
     * map state to props
     * @param state
     * @returns {{payments: (Payment.state.payment.payments|String.payments|*),
     * payments_selected: (Payment.state.payment.payments|String.payments|*|Array)}}
     */
    static mapState(state) {
        let payments_selected = state.core.checkout.quote.payments;
        let {payments, isUpdate} = state.core.checkout.payment;
        let {quote} = state.core.checkout;
        let {base_grand_total} = state.core.checkout.quote;
        return {
            payments: payments,
            payments_selected: payments_selected,
            quote: quote,
            base_grand_total: base_grand_total,
            isUpdate: isUpdate
        };
    }

    /**
     * map dispatch to props
     * @param dispatch
     * @returns {{actions: ({PaymentAction:
     * {getPaymentOnline,
     * getPaymentOnlineResult,
     * getPaymentOnlineError,
     * getListPayment,
     * getListPaymentResult,
     * getListPaymentError}}|ActionCreator<any>|ActionCreatorsMapObject)}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: bindActionCreators({...PaymentAction}, dispatch)
        }
    }
}

export default ContainerFactory.get(SelectPaymentContainer).withRouter(
    ComponentFactory.get(SelectPayment)
);