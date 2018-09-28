import React from 'react';
import PropTypes from 'prop-types';
import {CoreComponent} from "../../../../framework/component/index";
import {toast} from "react-toastify";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import PaymentConstant from "../../../constant/PaymentConstant";
import StoreCreditService from "../../../../service/store-credit/StoreCreditService";

export class PaymentItem extends CoreComponent {
    static className = 'PaymentItem';

    /**
     * select payment
     * @param payment
     */
    selectPayment(payment) {
        let {quote, grand_total, remain} = this.props;
        // check spent on credit and show toast error
        if (
            (payment.code === PaymentConstant.STORE_CREDIT) &&
            !StoreCreditService.checkSpentCreditSelectPayment(quote, grand_total, remain)
        ) {
            return toast.error(
                this.props.t('You can\'t spend store credit for remaining amount of this order.'),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 3000
                }
            );
        }
        this.props.selectPayment(payment);
    }

    /**
     * Render template
     *
     * @return {*}
     */
    template() {
        let {payment} = this.props;
        let code = payment.code;
        let payment_title = (code === PaymentConstant.STORE_CREDIT) ? this.props.t(payment.title) : payment.title;
        let payment_subtitle = payment.sub_title;
        return (
            <li onClick={() => this.selectPayment(payment)}>
                <span className={"img image-default image-" + code }></span>
                <span className="text">
                    {
                        this.props.t(payment_title) + (payment_subtitle ? ' ' + payment_subtitle : '')
                    }
                </span>
            </li>
        )
    }
}

PaymentItem.propTypes = {
    selectPayment: PropTypes.func
};

class PaymentItemContainer extends CoreContainer {
    static className = 'PaymentItemContainer';
}

export default ContainerFactory.get(PaymentItemContainer).withRouter(
    ComponentFactory.get(PaymentItem)
)