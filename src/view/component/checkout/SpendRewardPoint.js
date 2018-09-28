import React from 'react';
import NumPad from '../lib/react-numpad';
import {CoreComponent} from "../../../framework/component/index";
import CoreContainer from "../../../framework/container/CoreContainer";
import CheckoutAction from "../../action/CheckoutAction";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import {RewardPointHelper} from "../../../helper/RewardPointHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import RewardPointService from "../../../service/reward-point/RewardPointService";
import QuoteService from "../../../service/checkout/QuoteService";
import QuoteAction from "../../action/checkout/QuoteAction";
import '../../style/css/RewardPoint.css';

export class SpendRewardPointComponent extends CoreComponent {
    static className = 'SpendRewardPointComponent';

    constructor(props) {
        super(props);
        let maxPoint = RewardPointService.getMaximumOfRedeemableForQuote(this.props.quote);
        if (
            !RewardPointService.getUsedPoint() &&
            (
                RewardPointHelper.isSpendMaxPointAsDefault()
                || maxPoint === props.quote.rewardpoints_spent
            )
        ) {
            this.state = {
                usePoint: maxPoint,
                useMaxPoint: true,
            };
            return;
        }

        this.state = {
            usePoint: props.quote.rewardpoints_spent || 0,
            useMaxPoint: false,
        };
    }

    /**
     * componentWillUnMount
     */
    componentWillUnMount() {
        // SpendRewardPointComponent.usePoint = 0;
    }

    handleChangeUsePoint = (usePoint) => {
        this.setState({
            usePoint,
            useMaxPoint: usePoint >= RewardPointService.getMaximumOfRedeemableForQuote(this.props.quote)
        });
    };

    handleChangeUseMaxPoint = (event) => {
        const isUseMaxPoint = event.target.checked;
        if (isUseMaxPoint) {
            return this.setState({
                useMaxPoint: isUseMaxPoint,
                usePoint: RewardPointService.getMaximumOfRedeemableForQuote(this.props.quote)
            });
        }

        this.setState({useMaxPoint: event.target.value});
    };

    clickUsePoints = async () => {
        const {actions, quote} = this.props;
        const oldGrandTotal = quote.grand_total;
        RewardPointService.setUsedPoint(this.state.usePoint);
        QuoteService.collectTotals(quote);
        let newQuote = {...quote};

        const initPayments = oldGrandTotal !== newQuote.grand_total;
        await actions.setQuote(newQuote);

        actions.checkoutToSelectPayments(newQuote, initPayments);
    };

    /**
     * template to render
     * @returns {*}
     */
    template() {
        const {usePoint, useMaxPoint} = this.state;
        const {t, availablePointBalance, actions, quote} = this.props;
        const maximumOfRedeemable = RewardPointService.getMaximumOfRedeemableForQuote(quote);
        const pointDiscount       = RewardPointService.getDiscountAmountByPoint(usePoint, quote);
        const pointName           = RewardPointHelper.getPointName();
        const pluralOfPointName   = RewardPointHelper.getPluralOfPointName();
        const canUsePoint         = true;
        return (
            <div className="wrapper-payment active">
                <div className="block-title">
                    <strong className="title">{t('Reward Point')}</strong>
                </div>
                <div className="block-content" data-scrollbar>
                    <div className="payment-logo point-logo">

                    </div>
                    <ul className="payment-total">
                        <li>
                            <span className="label">{t('{{pointName}} Balance', {pointName})}</span>
                            <span className="value">
                                {availablePointBalance}&nbsp;
                                <small>
                                    {
                                        t('{{pointName}}', {
                                            pointName: availablePointBalance > 1 ? pluralOfPointName : pointName
                                        })
                                    }
                                </small>
                            </span>
                        </li>
                    </ul>
                    <NumPad.CustomIntegerNumber
                        onChange={(newUsePoint) => {
                            newUsePoint *=1;
                            if (newUsePoint > maximumOfRedeemable) {
                                return this.handleChangeUsePoint(maximumOfRedeemable)
                            }
                            this.handleChangeUsePoint(newUsePoint);
                        }}
                        position="centerLeft"
                        sync={true}
                        arrow="left"
                        value={usePoint}>
                        <div className={"payment-amount use-points"}>
                            <span className="label">
                            {
                                t('Use {{pointName}}', {
                                    pointName: usePoint > 1 ? pluralOfPointName : pointName
                                })
                            }
                            <span>{t(RewardPointService.getActiveSpendingRateLabel(quote))}</span>
                            </span>
                            <span className="value">{usePoint}</span>
                        </div>
                    </NumPad.CustomIntegerNumber>
                    <div className="payment-point-discount">
                        <span className="label">{t('{{pointName}} Discount', {pointName})}</span>
                        <span className="value">{CurrencyHelper.format(pointDiscount, false)}</span>
                    </div>
                    <div className="payment-point-max">
                        <span className="label">{t('Use max {{pluralOfPointName}}', {pluralOfPointName})}</span>
                        <span className="value">
                            <label className="label-checkbox">
                                <input
                                    checked={useMaxPoint}
                                    onChange={this.handleChangeUseMaxPoint}
                                    type="checkbox"/>
                                <span> </span>
                            </label>
                        </span>
                    </div>


                </div>
                <div className="block-bottom">
                    <div className="actions-accept">
                        <button
                            className="btn btn-default btn-cannel"
                            type="button"
                            onClick={() => actions.checkoutToSelectPayments(quote)}>
                            {t('Back')}
                        </button>
                        <button
                            className={"btn btn-default btn-accept" + (!canUsePoint ? 'disabled' : '')}
                            type="button"
                            onClick={this.clickUsePoints}>
                            {t('Use {{usePoint}} {{pointName}}', {
                                usePoint,
                                pointName: usePoint > 1 ? pluralOfPointName : pointName
                            })}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

class SpendRewardPointContainer extends CoreContainer {
    static className = 'SpendRewardPointContainer';

    /**
     * Map state to props
     * @param state
     * @returns {{quote: *}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        const availablePointBalance = RewardPointService.getCustomerPointBalance(quote.customer);
        return {
            quote,
            availablePointBalance
        };
    }

    /**
     * Map dispatch to props
     /**
     *
     * @param dispatch
     * @return {{actions: {checkoutToSelectPayments: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                checkoutToSelectPayments: (quote, initPayments) => dispatch(
                    CheckoutAction.checkoutToSelectPayments(quote, initPayments)
                ),
                setQuote: (quote) => dispatch(
                    QuoteAction.setQuote(quote)
                ),
            }
        }
    }
}

/**
 *
 * @type {SpendRewardPointContainer}
 */
const container = ContainerFactory.get(SpendRewardPointContainer);
export default container.withRouter(
    ComponentFactory.get(SpendRewardPointComponent)
)