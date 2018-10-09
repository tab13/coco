import React, {Fragment} from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import PaymentHelper from "../../../../helper/PaymentHelper";
import StaffDiscountConstant from "../../../constant/StaffDiscountConstant"
import CheckoutHelper from "../../../../helper/CheckoutHelper";
import StaffDiscountPopupComponent from "./StaffDiscountPopup";

export class StaffDiscountComponent extends CoreComponent {
    static className = 'StaffDiscountComponent';

    /**
     *   initial state
     *z
     */
    constructor(props) {
        super(props);
        this.state = {
            isOpenStaffDiscountPopup: false
        }
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    showPopup(type) {
        this.setState({
            isOpenStaffDiscountPopup: type === StaffDiscountConstant.POPUP_TYPE_STAFF_DISCOUNT
        });
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
     * Render tax total
     *
     * @return {*}
     */
    template() {
        let {
            total,
            quote,
            hasPaidOrWaitingGatewayPayment
        } = this.props;
        let shipping_method = quote.shipping_method;
        let classNameAmount = shipping_method ?  "amount" : "add-discount";
        let discountAmount = total.value;
        let displayValue = shipping_method ? CurrencyHelper.format(Math.abs(discountAmount), null, null) : "";
        // COCO-CUSTOMIZE check config show staff discount
        // let className = CheckoutHelper.isShowShippingMethod() ? "totals-action" : "hidden";
        let className = "totals-action";

        // if has any gate way payment is error or processing payment => user cannot use discount function
        if (hasPaidOrWaitingGatewayPayment) {
            classNameAmount = '';
            className = '';
        }

        return (
            <Fragment>
                <li className={className}
                    onClick={
                        () => {!hasPaidOrWaitingGatewayPayment && this.showPopup(StaffDiscountConstant.POPUP_TYPE_STAFF_DISCOUNT)}
                    }>
                    <span className="mark">{total.title}</span>
                    <span className={classNameAmount}>{displayValue}</span>
                </li>
                {
                    !hasPaidOrWaitingGatewayPayment && (
                        <StaffDiscountPopupComponent isOpenStaffDiscountPopup={this.state.isOpenStaffDiscountPopup}
                                                quote={quote}
                                                showPopup={(type) => this.showPopup(type)}/>
                    )
                }
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
