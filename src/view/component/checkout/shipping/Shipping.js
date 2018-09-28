import React, {Fragment} from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import ShippingConstant from "../../../constant/ShippingConstant";
import ShippingPopupComponent from "./ShippingPopup";
import '../../../style/css/Customer.css'
import CheckoutHelper from "../../../../helper/CheckoutHelper";
import PaymentHelper from "../../../../helper/PaymentHelper";

export class ShippingComponent extends CoreComponent {
    static className = 'ShippingComponent';

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isOpenShippingPopup: false,
            isOpenShippingAddress: false
        }
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    showPopup(type) {
        this.setState({
            isOpenShippingPopup: type === ShippingConstant.POPUP_TYPE_SHIPPING,
            isOpenShippingAddress: type === ShippingConstant.POPUP_TYPE_SHIPPING_ADDRESS
        });
    }

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
        // check config show shipping method
        let className = CheckoutHelper.isShowShippingMethod() ? "totals-action" : "hidden";

        // if has any gate way payment is error or processing payment => user cannot use discount function
        if (hasPaidOrWaitingGatewayPayment) {
            classNameAmount = '';
            className = '';
        }

        return (
            <Fragment>
                <li className={className}
                    onClick={
                        () => {!hasPaidOrWaitingGatewayPayment && this.showPopup(ShippingConstant.POPUP_TYPE_SHIPPING)}
                    }>
                    <span className="mark">{total.title}</span>
                    <span className={classNameAmount}>{displayValue}</span>
                </li>
                {
                    !hasPaidOrWaitingGatewayPayment && (
                        <ShippingPopupComponent isOpenShippingPopup={this.state.isOpenShippingPopup}
                                                isOpenShippingAddress={this.state.isOpenShippingAddress}
                                                quote={quote}
                                                showPopup={(type) => this.showPopup(type)}/>
                    )
                }
            </Fragment>
        )
    }
}

export class ShippingContainer extends CoreContainer {
    static className = 'ShippingContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        const { currentPage } = state.core.checkout.index;
        const { quote } = state.core.checkout;
        const hasPaidOrWaitingGatewayPayment = PaymentHelper.hasPaidOrWaitingGatewayPayment(quote.payments);

        return {
            currentPage,
            hasPaidOrWaitingGatewayPayment
        }
    }
}

/**
 *
 * @type {ShippingContainer}
 */
const container = ContainerFactory.get(ShippingContainer);
export default container.getConnect(ComponentFactory.get(ShippingComponent));