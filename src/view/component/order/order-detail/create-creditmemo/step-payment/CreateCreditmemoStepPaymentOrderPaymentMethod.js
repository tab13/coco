import React from 'react';
import {CoreComponent} from "../../../../../../framework/component/index";
import CoreContainer from "../../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../framework/factory/ContainerFactory";
import OrderService from "../../../../../../service/sales/OrderService";
import OrderHelper from "../../../../../../helper/OrderHelper";
import DateTimeHelper from "../../../../../../helper/DateTimeHelper";
import moment from "moment/moment";
import PaymentConstant from "../../../../../constant/PaymentConstant";

class CreateCreditmemoStepPaymentOrderPaymentMethodComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepPaymentOrderPaymentMethodComponent';

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        let order = props.order;
        this.state = {
            collapse: false,
            payment_status: OrderService.getPaymentStatus(order)
        }
    }

    collapse() {
        this.setState({collapse: !this.state.collapse});
    }

    /**
     * Get payment date
     *
     * @param payment
     * @return {string}
     */
    getPaymentDate(payment) {
        return payment.payment_date ?
            '(' +
            moment(DateTimeHelper.convertDatabaseDateTimeToLocalDate(payment.payment_date)).format('L')
            + ')'
            : ''
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <div className="box">
                <div className={this.state.collapse ? "box-title" : "box-title collapsed"} onClick={() => this.collapse()}>
                    {this.props.t('Order Payment Method')}
                </div>
                <div className={"box-content collapse" + (!this.state.collapse ? " in" : "")}>
                    <ul>
                        <li>
                            <span className="label">{this.props.t('Payment Status')}</span>
                            <span className="value">
                                    <span className={"status " + this.state.payment_status.className}>
                                        {this.state.payment_status.value}
                                    </span>
                                </span>
                        </li>
                        {
                            this.props.order.payments && this.props.order.payments.length ?
                                this.props.order.payments.map((payment, index) => {
                                    return payment.type !== PaymentConstant.TYPE_REFUND ?
                                        <li key={index}>
                                        <span className="label">
                                            {payment.title}
                                            <span className="date">{this.getPaymentDate(payment)}</span>
                                            {
                                                (payment.reference_number && (
                                                    <span className="des">
                                                        (
                                                        {
                                                            payment.reference_number
                                                        }
                                                        {
                                                            payment.card_type && ` - ${payment.card_type.toUpperCase()}`
                                                        }
                                                        )
                                                    </span>
                                                )) || (payment.card_type && <li>
                                                    <span className="des">
                                                        {
                                                            (`${payment.card_type.toUpperCase()}`)
                                                        }
                                                    </span>
                                                </li>)
                                            }
                                        </span>
                                            <span className="value">
                                            {OrderHelper.formatPrice(payment.amount_paid, this.props.order)}
                                        </span>
                                        </li> :
                                        null
                                }) : null
                        }
                    </ul>
                </div>
            </div>
        );
    }
}

class CreateCreditmemoStepPaymentOrderPaymentMethodContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepPaymentOrderPaymentMethodContainer';

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
 * @type {CreateCreditmemoStepPaymentOrderPaymentMethodContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepPaymentOrderPaymentMethodContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepPaymentOrderPaymentMethodComponent)
)