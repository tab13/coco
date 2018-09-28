import React from 'react';
import CoreComponent from "../../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import CheckoutAction from "../../../../action/CheckoutAction";
import {toast} from "react-toastify";
import GiftcardHelper from "../../../../../helper/GiftcardHelper";
import Config from "../../../../../config/Config";

export class GiftCardComponent extends CoreComponent {
    static className = 'GiftCardComponent';

    clickGiftcardDiscountButton = () => {
        if (!window.navigator.onLine || Config.isOnline === false) {
            toast.error(
                this.props.t('You must connect to a Wi-Fi or cellular data network to redeem Gift Card'),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 3000
                }
            );
            return false;
        }
        const {actions, quote} = this.props;
        if(quote.coupon_code && !GiftcardHelper.canUseWithCoupon()) {
            toast.error(
                this.props.t('A coupon code has been used. ' +
                    'You cannot apply gift codes with the coupon to get discount.'),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 3000
                }
            );
            return false;
        }
        return actions.checkoutToApplyGiftCard(quote);
    };

    /**
     * Render gift card total
     *
     * @return {*}
     */
    template() {
        const {title, value} = this.props.total;
        const classNameAmount = value !== null ? "amount" : "add-discount";
        return (
            <li className="totals-discount totals-action" onClick={this.clickGiftcardDiscountButton}>
                <span className="mark">{title}</span>
                <span className={classNameAmount}>{value !== null ? CurrencyHelper.format(value) : null}</span>
            </li>
        )
    }
}

export class GiftCardContainer extends CoreContainer {
    static className = 'GiftCardContainer';

    static mapDispatch(dispatch) {
        return {
            actions: {
                checkoutToApplyGiftCard: (quote) => dispatch(
                    CheckoutAction.checkoutToApplyGiftCard(quote)
                )
            }
        }
    }
}

/**
 *
 * @type {GiftCardContainer}
 */
const container = ContainerFactory.get(GiftCardContainer);
export default container.getConnect(ComponentFactory.get(GiftCardComponent));
