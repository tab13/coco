import React, {Fragment} from 'react';
import CoreComponent from "../../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../../framework/container/CoreContainer";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import {ButtonToolbar, OverlayTrigger, Popover} from "react-bootstrap";
import QuoteService from "../../../../../service/checkout/QuoteService";
import CouponTypeConstant from "../../../../constant/salesrule/CouponTypeConstant";
import QuoteAction from "../../../../action/checkout/QuoteAction";
import {isMobile} from 'react-device-detect'
import PaymentHelper from "../../../../../helper/PaymentHelper";
import {Payment} from "../../Payment";
import SpendRewardPoint from "../../SpendRewardPoint";
import CheckoutAction from "../../../../action/CheckoutAction";
import GiftcardForm from "./GiftcardForm";

export class CartTotalsDiscountComponent extends CoreComponent {
    static className = 'CartTotalsDiscountComponent';

    /**
     *   initial state
     *z
     */
    constructor(props) {
        super(props);
        this.showOnPages = [Payment.className, SpendRewardPoint.className, GiftcardForm.className];
        this.state = {
            couponcode: '',
            message: '',
            couponCodeApplied: '',
            is_appling_coupon: false
        };
        document.addEventListener('keydown', (event) => {
            const keyName = event.key;

            if (keyName === "Enter") {
                if (this.state.couponcode) {
                    this.submitCouponCode();
                }
            }
        });
    }

    /**
     *  will receive props reset state when not apply coupon
     *
     * @param nextProps
     * @return
     */
    componentWillReceiveProps(nextProps) {
        if (!nextProps.quote.coupon_code) {
            this.resetState();
        }
    }

    hideBackDrop() {
        this.props.hideBackDrop();
        if (!this.state.couponCodeApplied) {
            this.resetState();
        }
        this.setState({message: '', is_appling_coupon: false});
    }

    /**
     *  Reset State to default
     *
     * @return
     */
    resetState() {
        this.setState({
            message: '',
            is_appling_coupon: false,
            couponcode: '',
            couponCodeApplied: ''
        })
    }

    /**
     *  Submit coupon code to check promotion
     *
     * @return rules
     */
    submitCouponCode() {
        this.setState({messsge: '', is_appling_coupon: true});
        QuoteService.submitCouponCode(this.props.quote, this.state.couponcode)
            .then(async rules => {
                let quote = this.props.quote;
                if (rules && rules.length) {
                    let couponRule = rules.find(rule => rule.coupon_type === CouponTypeConstant.COUPON_TYPE_SPECIFIC);
                    if (couponRule && couponRule.rule_id) {
                        quote.coupon_code = this.state.couponcode;
                        this.setState({couponCodeApplied: this.state.couponcode});
                        quote.valid_salesrule = rules;
                        this.props.actions.addCouponCodeAfter(quote);
                        QuoteService.collectTotals(quote);
                        if (!quote.grand_total) {
                            await this.props.actions.setQuote(quote);
                            this.props.actions.checkoutToSelectPayments(quote);
                        } else {
                            this.props.actions.setQuote(quote);
                        }
                    } else {
                        return this.setState({message: this.props.t('Invalid Coupon Code'), is_appling_coupon: false})
                    }
                } else {
                    return this.setState({message: this.props.t('Invalid Coupon Code'), is_appling_coupon: false})
                }
                this.hideBackDrop();
                return rules;
            })
            .catch(error => {
                if (error.code === 901 || error.code === 900) {
                    this.hideBackDrop();
                }
                return this.setState({
                    message: error.message,
                    is_appling_coupon: false
                })
            });
    }


    /**
     *  Remove coupon code in quote
     *
     * @return rules
     */
    removeCouponCode() {
        let quote = this.props.quote;
        this.props.actions.removeCouponCode(quote);
        this.resetState();
    }


    /**
     *  Change coupon code when type input field
     *
     * @return rules
     */
    couponCodeChange(e) {
        this.setState({couponcode: e.target.value});
        this.setState({message: ''});
    }

    setInputCoupon(element) {
        if (element) {
            this.refInputCoupon = element;
        }
    }

    /**
     *
     * @param total
     * @param hasPaidOrWaitingGatewayPayment
     * @return {*}
     */
    static getDiscountElement(total, hasPaidOrWaitingGatewayPayment) {
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
        let classNameInput = (this.state.couponCodeApplied === "") ?
            "form-control input-coupon" : "form-control input-coupon label-coupon";
        let classNameButtonApply = "";
        if (this.state.couponCodeApplied !== "") {
            classNameButtonApply = "hidden";
        } else {
            classNameButtonApply = (this.state.couponcode === "") ?
                "btn btn-default btn-coupon disabled" : "btn btn-default btn-coupon";
        }
        let classNameButtonRemove = (this.state.couponCodeApplied === "") ? "hidden" : "btn btn-default btn-coupon";
        let classBtnRemoveInput = "hidden";
        if ((this.state.couponCodeApplied === "") && (this.state.couponcode !== "")) {
            classBtnRemoveInput = "btn-remove";
        }
        let disabledButtonApply = (this.state.couponcode === "");
        let classNameMessage = (this.state.message === "") ? "invalid-coupon hidden" : "invalid-coupon";
        let autoFocus = ((this.state.couponcode === "" && !isMobile));
        // let autoFocus = (this.state.couponcode === "");
        let disabledInputCoupon = (this.state.couponCodeApplied !== "");

        const popoverCoupon = (
            <Popover id="coupon popover">
                <div className="popup-add-discount">
                    <div className="discount-title">{this.props.t('Coupon Code')}</div>
                    <div className="discount-content">
                        <div className="img-discount"/>
                        <div className="form-coupon">
                            <input type="text" className={classNameInput} placeholder="Enter code here"
                                   onChange={(event) => this.couponCodeChange(event)} autoFocus={autoFocus}
                                   disabled={disabledInputCoupon}
                                   value={this.state.couponcode}
                                   ref={this.setInputCoupon.bind(this)}
                            />
                            <button className={classBtnRemoveInput} type="button"
                                    onClick={() => this.resetState()}>
                            </button>
                            <button className={classNameButtonApply} type="button"
                                    onClick={() => this.submitCouponCode()}
                                    disabled={disabledButtonApply}>
                                {this.props.t('Apply')}
                            </button>
                            <button className={classNameButtonRemove} type="button"
                                    onClick={() => this.removeCouponCode()}>
                                {this.props.t('Remove')}
                            </button>
                            <div className={classNameMessage}>
                                {this.state.message}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="loader-couponcode"
                     style={{display: (this.state.is_appling_coupon ? 'block' : 'none')}}>
                    <div className="loader-product"/>
                </div>
            </Popover>
        );

        return (
            <Fragment key={total.code}>
                <ButtonToolbar className={this.canShow() ? "" : "hidden"}>
                    {
                        hasPaidOrWaitingGatewayPayment ? CartTotalsDiscountComponent.getDiscountElement(
                            total,
                            hasPaidOrWaitingGatewayPayment
                        ) : (
                            <OverlayTrigger trigger="click"
                                            rootClose placement="right"
                                            overlay={popoverCoupon}
                                            onClick={() => this.props.showBackDrop()}
                            >
                                {
                                    CartTotalsDiscountComponent.getDiscountElement(
                                        total,
                                        hasPaidOrWaitingGatewayPayment
                                    )
                                }
                            </OverlayTrigger>
                        )
                    }
                </ButtonToolbar>
            </Fragment>
        )
    }
}

export class CartTotalsDiscountContainer extends CoreContainer {
    static className = 'CartTotalsDiscountContainer';

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
                removeCouponCode: (quote) => dispatch(QuoteAction.removeCouponCode(quote)),
                addCouponCodeAfter: (quote) => dispatch(QuoteAction.addCouponCodeAfter(quote)),
                setQuote: (quote) => dispatch(QuoteAction.setQuote(quote)),
                checkoutToSelectPayments: (quote, initPayments) => dispatch(
                    CheckoutAction.checkoutToSelectPayments(quote, initPayments)
                ),
            }
        }
    }
}

/**
 *
 * @type {CartTotalsTaxContainer}
 */
const container = ContainerFactory.get(CartTotalsDiscountContainer);
export default container.getConnect(ComponentFactory.get(CartTotalsDiscountComponent));
