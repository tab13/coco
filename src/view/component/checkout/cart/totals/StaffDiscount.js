import React, {Fragment} from 'react';
import CoreComponent from "../../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import {ButtonToolbar} from "react-bootstrap";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import PaymentHelper from "../../../../../helper/PaymentHelper";

export class StaffDiscountComponent extends CoreComponent {
    static className = 'StaffDiscountComponent';

    /**
     *   initial state
     *z
     */
    constructor(props) {
        super(props);
    }

    /**
     *
     *
     * @param nextProps
     * @return
     */
    componentWillReceiveProps(nextProps) {
    }

    /**
     *
     *
     */
    static getStaffDiscountElement(total, hasPaidOrWaitingGatewayPayment) {
        let discountAmount = total.value;
        let classNameAmount = (discountAmount === 0) ? "add-discount" : "amount";
        let displayValue = (discountAmount === 0) ? "" : `${CurrencyHelper.format(discountAmount)}`;
        let className = ["totals-discount", "totals-action"];

        // if has any gate way payment is error or processing payment => user cannot use discount function
        if (hasPaidOrWaitingGatewayPayment) {
            classNameAmount = '';
            className = ["totals-discount"];
        }

        return (
            <li className={className.join(" ")}>
                <span className="mark">{total.title}</span>
                <span className={classNameAmount}>{displayValue}</span>
            </li>
        );
    }

    /**
     * Render tax total
     *
     * @return {*}
     */
    template() {
        let {total, hasPaidOrWaitingGatewayPayment} = this.props;
        return (
            <Fragment key={total.code}>
                <ButtonToolbar className={""}>
                    {
                        StaffDiscountComponent.getStaffDiscountElement(
                            total,
                            hasPaidOrWaitingGatewayPayment
                        )
                    }
                </ButtonToolbar>
            </Fragment>
        )
    }
}

export class StaffDiscountContainer extends CoreContainer {
    static className = 'StaffDiscountContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        const {currentPage} = state.core.checkout.index;
        const {quote} = state.core.checkout;
        const hasPaidOrWaitingGatewayPayment = PaymentHelper.hasPaidOrWaitingGatewayPayment(quote.payments);
        return {
            currentPage,
            hasPaidOrWaitingGatewayPayment
        }
    }

    /**
     *
     * @param dispatch
     * @return {{actions: {placeOrder, placeOrderResult, placeOrderError, checkoutToSelectPayments}|ActionCreator<any>|ActionCreatorsMapObject}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {

            }
        }
    }
}

/**
 *
 * @type {StaffDiscountContainer}
 */
const container = ContainerFactory.get(StaffDiscountContainer);
export default container.getConnect(ComponentFactory.get(StaffDiscountComponent));
