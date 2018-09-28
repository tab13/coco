import React from 'react';
import CoreComponent from "../../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import CheckoutAction from "../../../../action/CheckoutAction";
import RewardPointService from "../../../../../service/reward-point/RewardPointService";
import {RewardPointHelper} from "../../../../../helper/RewardPointHelper";
import {toast} from "react-toastify";
import i18n from "../../../../../config/i18n";

export class PointDiscountComponent extends CoreComponent {
    static className = 'PointDiscountComponent';

    clickPointDiscountButton = () => {
        const { actions, quote } =  this.props;
        const minimumRedeemablePoint = RewardPointHelper.getMinimumRedeemablePoint();
        if ( RewardPointService.getCustomerPointBalance(quote.customer) < minimumRedeemablePoint ) {
            return toast.error(
                i18n.translator.translate(
                    'Customer must have at least {{minimumRedeemablePoint}} to spend point for this order',
                    { minimumRedeemablePoint }
                ),
                {className: 'wrapper-messages messages-warning'}
            );
        }

        return actions.checkoutToSpendRewardPoint(quote)
    };
    /**
     * Render spend point total
     *
     * @return {*}
     */
    template() {
        const { total } =  this.props;
        let spendPoint = total.value;
        let spendAmount = spendPoint * 1;
        let classNameAmount = (spendAmount === 0) ? "add-discount" : "amount";
        let displayValue = (spendAmount === 0) ? "" : `-${CurrencyHelper.format(Math.abs(spendAmount), false)}`;
        return (
            <li className="totals-discount totals-action" onClick={this.clickPointDiscountButton}>
                <span className="mark">{total.title}</span>
                <span className={classNameAmount}>{displayValue}</span>
            </li>
        )
    }
}

export class PointDiscountContainer extends CoreContainer {
    static className = 'PointDiscountContainer';

    static mapDispatch(dispatch) {
        return {
            actions: {
                checkoutToSpendRewardPoint: (quote) => dispatch(
                    CheckoutAction.checkoutToSpendRewardPoint(quote)
                )
            }
        }
    }
}

/**
 *
 * @type {PointDiscountContainer}
 */
const container = ContainerFactory.get(PointDiscountContainer);
export default container.getConnect(ComponentFactory.get(PointDiscountComponent));