import React, {Fragment} from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import QuoteAction from "../../../action/checkout/QuoteAction";
import TaxHelper from "../../../../helper/TaxHelper";
import WeeeDataService from "../../../../service/weee/WeeeDataService";
import {RewardPointHelper} from "../../../../helper/RewardPointHelper";
import RewardPointService from "../../../../service/reward-point/RewardPointService";
import DiscountComponent from "./totals/Discount";
import ShippingComponent from "../shipping/Shipping";
import TaxComponent from "./totals/Tax";
import PointDiscount from "./totals/PointDiscount";
import EarnPoint from "./totals/EarnPoint";
import {Payment} from "../Payment";
import SpendRewardPoint from "../SpendRewardPoint";
import GiftCard from './totals/GiftCard';
import ProductTypeConstant from '../../../constant/ProductTypeConstant';
import GiftcardHelper from "../../../../helper/GiftcardHelper";
import GiftcardForm from "./totals/GiftcardForm";
import NumberHelper from "../../../../helper/NumberHelper";
import StaffDiscountComponent from "./totals/StaffDiscount";

export class CartTotalsComponent extends CoreComponent {
    static className = 'CartTotalsComponent';

    /**
     *   initial state
     *z
     */
    constructor(props) {
        super(props);
        this.showOnPages = [Payment.className, SpendRewardPoint.className, GiftcardForm.className];
        this.state = {};
        this.totals = [];
        document.addEventListener('keydown', (event) => {
            const keyName = event.key;
            if (keyName === "Escape") {
                this.hideBackDrop();
            }
        });
    }

    /**
     *  did mount add backdrop
     *
     */
    componentDidMount() {
        this.backDrop = document.createElement("div");
        this.backDrop.className = "modal-backdrop  in popover-backdrop";
        this.backDrop.style.display = "none";
        this.backDrop.onclick = () => this.hideBackDrop();
        document.body.appendChild(this.backDrop);
    }

    /**
     *  Show back drop when display coupon code popover
     *
     * @return
     */
    showBackDrop() {
        this.backDrop.style.display = "block";
    }

    /**
     *  Hidden back drop when dismiss coupon code popover
     *
     * @return
     */
    hideBackDrop() {
        this.backDrop.click();
        this.backDrop.style.display = "none";
    }


    /**
     *  Prepare totals data for template
     *
     * @return rules
     */
    prepareTotals() {
        const isEnabledRewardPoint = RewardPointHelper.isEnabledRewardPoint();
        let {t, quote} = this.props;
        let items = quote.items;
        this.totals = [];
        let subTotal = quote.subtotal;

        let pointDiscount = isEnabledRewardPoint ? -quote.rewardpoints_discount : 0;
        let giftcardDiscount = null;
        if (quote.gift_voucher_gift_codes) {
            giftcardDiscount = quote.gift_voucher_discount !== null &&
                typeof quote.gift_voucher_discount !== 'undefined' ? quote.gift_voucher_discount : null;
        }

        if (TaxHelper.shoppingCartDisplaySubtotalIncludeTax()) {
            subTotal = quote.subtotal_incl_tax;
        }
        if (subTotal !== undefined) {
            this.addToTotals("subtotal", t('Subtotal'), subTotal, "");
        }
        let discount = quote.discount_amount - pointDiscount;
        if(giftcardDiscount !== null) {
            discount = NumberHelper.minusNumber(discount, -giftcardDiscount);
        }

        if (quote.coupon_code) {
            this.addToTotals(
                "discount", t('Discount') + " (" + quote.coupon_code + ")", discount, ""
            );
        } else {
            // COCO-CUSTOMIZE add fix code to show staff discount button in check out cart
            this.addToTotals("staff_discount", t('Staff Discount'), discount, "");

            this.addToTotals("discount", t('Discount'), discount, "");
        }

        if (!quote.is_virtual) {
            let shipping_amount = TaxHelper.shoppingCartDisplayShippingIncludeTax() ?
                quote.shipping_incl_tax : quote.shipping_amount;
            this.addToTotals(
                "shipping",
                t(quote.shipping_method ? 'Shipping' : "Add Shipping"),
                shipping_amount, ""
            );
        }

        let weeeTotal = WeeeDataService.getTotalAmounts(items, quote);
        if (weeeTotal) {
            this.addToTotals("weee", t('FPT'), weeeTotal || 0, "");
        }

        let taxAmount = this.props.quote.tax_amount;
        if (taxAmount || TaxHelper.displayZeroSubtotal()) {
            this.addToTotals("tax", t('Tax'), taxAmount || 0, "");
        }

        if (isEnabledRewardPoint) {
            const {quote} = this.props;
            if (RewardPointService.customerCanSpendPoint(quote.customer)) {
                const pointName = RewardPointHelper.getPointName();
                const usedPoint = RewardPointService.getUsedPoint();
                let title = t('{{pointName}} Discount', {pointName});

                if (usedPoint) {
                    title = t('{{pointName}} Discount ({{usedPoint}} {{pointName}})', {
                        pointName: usedPoint > 1
                            ? RewardPointHelper.getPluralOfPointName()
                            : RewardPointHelper.getPointName(),
                        usedPoint
                    });
                }

                this.addToTotals(
                    "spend_point",
                    title,
                    pointDiscount || 0,
                    ""
                );
            }
            if (
                quote.customer && (
                    RewardPointHelper.canEarnWhenSpend()
                    || (!quote.rewardpoints_spent && !RewardPointHelper.canEarnWhenSpend())
                )
            ) {
                this.addToTotals("earn_point", t('Customer will earn'),
                    quote.rewardpoints_earn, ""
                );
            }
        }

        let isShowGiftCardTotal = GiftcardHelper.isGiftcardEnable() &&
            !items.find(item => item.product_type === ProductTypeConstant.GIFT_CARD);

        if (isShowGiftCardTotal && false) {
            this.addToTotals(
                ProductTypeConstant.GIFT_CARD,
                t("Gift Card"),
                giftcardDiscount !== null ? -giftcardDiscount : null
            );
        }

        if (this.canShow()) {
            this.addToTotals("grand_total", t('Total'), quote.grand_total || 0, "");
        }
    }

    /**
     *  Add data to totals
     *
     * @param code
     * @param title
     * @param value
     * @param unit
     * @return rules
     */
    addToTotals(code, title, value, unit) {
        this.totals.push({
            code: code,
            title: title,
            value: value,
            unit: unit
        })
    }

    /**
     *  Make tempate total by total data
     *
     * @param total
     * @return template total
     */
    getTemplateTotal(total) {
        // COCO-CUSTOMIZE check if has staff discount, then add to template
        if (total.code === "staff_discount") {
            return <StaffDiscountComponent key={total.code}
                                      quote={this.props.quote}
                                      total={total}
                                      showBackDrop={() => this.showBackDrop()}
                                      hideBackDrop={() => this.hideBackDrop()}
            />
        } else if (total.code === "discount") {
            return <DiscountComponent key={total.code}
                                      quote={this.props.quote}
                                      total={total}
                                      showBackDrop={() => this.showBackDrop()}
                                      hideBackDrop={() => this.hideBackDrop()}
            />
        } else if (total.code === "shipping") {
            return <ShippingComponent key={total.code}
                                      quote={this.props.quote}
                                      total={total}
            />
        } else if (total.code === "tax") {
            return <TaxComponent key={total.code}
                                 quote={this.props.quote}
                                 total={total}
                                 showBackDrop={() => this.showBackDrop()}
            />
        } else if (total.code === "spend_point") {
            return <PointDiscount key={total.code}
                                  quote={this.props.quote}
                                  total={total}
                                  showBackDrop={() => this.showBackDrop()}
            />
        } else if (total.code === "earn_point") {
            return <EarnPoint key={total.code}
                              quote={this.props.quote}
                              total={total}
                              showBackDrop={() => this.showBackDrop()}
            />
        } else if (total.code === ProductTypeConstant.GIFT_CARD) {
            return <GiftCard key={total.code}
                             quote={this.props.quote}
                             total={total}
                             showBackDrop={() => this.showBackDrop()}
            />
        } else {
            let displayValue = CurrencyHelper.format(Math.abs(total.value), null, null);
            return (
                <Fragment key={total.code}>
                    <li className={total.code}>
                        <span className="mark">{total.title}</span>
                        <span className="amount">{displayValue}</span>
                    </li>
                </Fragment>
            )
        }
    }

    /**
     *  Make tempate totals
     *
     * @return template totals
     */
    getTemplateTotals() {
        let templateTotals = this.totals.map(total => this.getTemplateTotal(total));
        return templateTotals;
    }

    /**
     *  render totls cart
     *
     * @return {*}
     */
    template() {
        this.prepareTotals();
        return (
            <div>
                <div className="cart-totals"
                     style={{display: this.canShow() ? "block" : "none"}}>
                    <ul>
                        {this.getTemplateTotals()}
                    </ul>
                </div>
            </div>
        );
    }
}

/**
 *
 * @type {CartTotalsComponent}
 */
const component = ComponentFactory.get(CartTotalsComponent);

export class CartTotalsContainer extends CoreContainer {
    static className = 'CartTotalsContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        const {quote} = state.core.checkout;
        const {currentPage} = state.core.checkout.index;
        return {
            quote,
            currentPage,
        }
    }

    /**
     *
     * @param dispatch
     * @return {{actions: {placeOrder, placeOrderResult, placeOrderError,
     *     checkoutToSelectPayments}|ActionCreator<any>|ActionCreatorsMapObject}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                setQuote: (quote) => dispatch(QuoteAction.setQuote(quote))
            }
        }
    }
}

/**
 *
 * @type {CartTotalsContainer}
 */
const container = ContainerFactory.get(CartTotalsContainer);
export default container.getConnect(component);