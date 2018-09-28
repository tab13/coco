import React, {Fragment} from 'react';
import {CoreComponent} from "../../../../../../framework/component/index";
import CoreContainer from "../../../../../../framework/container/CoreContainer";
import ComponentFactory from "../../../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../../../framework/factory/ContainerFactory";
import OrderHelper from "../../../../../../helper/OrderHelper";
import TaxHelper from "../../../../../../helper/TaxHelper";
import CreditmemoAction from "../../../../../action/order/CreditmemoAction";
import NumberHelper from "../../../../../../helper/NumberHelper";
import GiftcardHelper from "../../../../../../helper/GiftcardHelper";

class CreateCreditmemoStepAdjustmentTotalsComponent extends CoreComponent {
    static className = 'CreateCreditmemoStepAdjustmentTotalsComponent';

    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            totals: this.prepareTotals(props)
        }
    }

    /**
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.setState({totals: this.prepareTotals(nextProps)});
    }

    /**
     * Prepare totals
     * @param props
     */
    prepareTotals(props) {
        let creditmemo = props.creditmemo;
        let order = props.order;
        let totals = [];
        let subtotalInclTax = TaxHelper.orderDisplaySubtotalIncludeTax();
        let subtotalAmount = subtotalInclTax ? creditmemo.subtotal_incl_tax : creditmemo.subtotal;
        let discountAmount = creditmemo.discount_amount || 0;
        let giftCodes = order.gift_voucher_gift_codes;
        let giftCodesRefundAmount = creditmemo.gift_voucher_gift_codes_refund_amount;
        let giftCodeTotals = [];
        if (giftCodes && giftCodesRefundAmount) {
            discountAmount = NumberHelper.addNumber(discountAmount, creditmemo.gift_voucher_discount);
            giftCodes = giftCodes.split(',');
            giftCodesRefundAmount = giftCodesRefundAmount.split(',');
            if (Array.isArray(giftCodes) && giftCodes.length &&
                Array.isArray(giftCodesRefundAmount) && giftCodesRefundAmount.length) {
                giftCodeTotals.push(
                    {
                        key: 'giftcode',
                        label: this.props.t('Gift code'),
                        value: "",
                        className: '',
                        sort_order: 52
                    }
                );
                giftCodes.forEach((code, index) => {
                     let refundAmount = Math.abs(giftCodesRefundAmount[index]);
                     if(refundAmount) {
                         giftCodeTotals.push(
                             {
                                 key: 'giftcode-' + code,
                                 label: `${GiftcardHelper.getHiddenCode(code)}`,
                                 value: OrderHelper.formatPrice(-refundAmount, order),
                                 className: "total-padding",
                                 sort_order: 52
                             }
                         )
                     }
                });
            }
        }
        totals.push({
            key: "subtotal",
            label: this.props.t(subtotalInclTax ? 'Subtotal incl. Tax' : 'Subtotal'),
            value: OrderHelper.formatPrice(subtotalAmount, order),
            sort_order: 10
        });
        if (props.max_allowed_shipping_refund && props.max_allowed_shipping_refund > 0) {
            let useAmountsWithTax = TaxHelper.orderDisplayShippingAmountIncludeTax();
            let shippingTotal = useAmountsWithTax ? creditmemo.shipping_incl_tax : creditmemo.shipping_amount;
            totals.push({
                key: 'shipping',
                label: this.props.t('Refund Shipping' + (useAmountsWithTax ? " (Incl. Tax)" : "")),
                value: OrderHelper.formatPrice(shippingTotal, order),
                sort_order: 20
            })
        }
        totals.push({
            key: "adjustment_positive",
            label: this.props.t('Adjustment Refund'),
            value: OrderHelper.formatPrice(creditmemo.adjustment_positive, order),
            sort_order: 30
        });
        totals.push({
            key: "adjustment_negative",
            label: this.props.t('Adjustment Fee'),
            value: OrderHelper.formatPrice(
                (creditmemo.adjustment_negative ? -creditmemo.adjustment_negative : 0),
                order
            ),
            sort_order: 40
        });
        if (discountAmount) {
            totals.push({
                key: "discount_amount",
                label: this.props.t('Discount') +
                (creditmemo.order.coupon_code ? " (" + creditmemo.order.coupon_code + ")" : ""),
                value: OrderHelper.formatPrice(discountAmount, order),
                sort_order: 50
            });
        }
        if (giftCodeTotals) {
            totals = [...totals, ...giftCodeTotals];
        }
        if (creditmemo.total_weee_amount && creditmemo.total_weee_amount > 0) {
            totals.push({
                key: "fpt_amount",
                label: this.props.t('FPT'),
                value: OrderHelper.formatPrice(creditmemo.total_weee_amount, order),
                sort_order: 60
            });
        }
        if (creditmemo.tax_amount || TaxHelper.orderDisplayZeroTaxSubTotal()) {
            totals.push({
                key: "tax_amount",
                label: this.props.t('Tax'),
                value: OrderHelper.formatPrice(creditmemo.tax_amount, order),
                sort_order: 70
            });
        }
        totals.push({
            key: "grand_total",
            label: this.props.t('Grand Total'),
            value: OrderHelper.formatPrice(creditmemo.grand_total, order),
            className: "total",
            sort_order: 100
        });
        this.props.actions.createCreditmemoPrepareTotals(creditmemo, order, totals);
        totals.sort((a, b) => {
            return +a.sort_order > +b.sort_order ? 1 : -1
        });
        return totals;
    }

    /**
     * template to render
     * @returns {*}
     */
    template() {
        return (
            <Fragment>
                <div className="box-title">{this.props.t('Refund Totals')}</div>
                <div className="box-content">
                    <ul>
                        {
                            this.state.totals.map(total => {
                                return <li key={total.key} className={total.className || ""}>
                                    <span className="label">{total.label}</span>
                                    <span className="value">{total.value}</span>
                                </li>
                            })
                        }
                    </ul>
                </div>
            </Fragment>
        );
    }
}

class CreateCreditmemoStepAdjustmentTotalsContainer extends CoreContainer {
    static className = 'CreateCreditmemoStepAdjustmentTotalsContainer';

    /**
     * Map dispatch to props
     *
     * @param dispatch
     * @return {{actions: {selectPayment: function(*=, *=): *, switchPage: function(*=): *, resetState: function(): *, addPayment: function(*=): *}}}
     */
    static mapDispatch(dispatch) {
        return {
            actions: {
                createCreditmemoPrepareTotals: (creditmemo, order, totals) =>
                    dispatch(CreditmemoAction.createCreditmemoPrepareTotals(creditmemo, order, totals))
            }
        }
    }
}

/**
 * @type {CreateCreditmemoStepAdjustmentTotalsContainer}
 */
export default ContainerFactory.get(CreateCreditmemoStepAdjustmentTotalsContainer).withRouter(
    ComponentFactory.get(CreateCreditmemoStepAdjustmentTotalsComponent)
)
