import {CreditmemoAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import NumberHelper from "../../../../../helper/NumberHelper";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import TaxHelper from "../../../../../helper/TaxHelper";
import i18n from "../../../../../config/i18n";
import CreditmemoService from "../../CreditmemoService";
import OrderHelper from "../../../../../helper/OrderHelper";
import CreateCreditmemoConstant from "../../../../../view/constant/order/creditmemo/CreateCreditmemoConstant";

export class CreditmemoShippingService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoShippingService';

    /**
     * Collect creditmemo shipping
     *
     * @param creditmemo
     * @return {CreditmemoShippingService}
     */
    collect(creditmemo) {
        CreditmemoService.prepareErrors(creditmemo);
        creditmemo.errors[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] = null;
        let order = creditmemo.order;
        /*amounts without tax*/
        let orderShippingAmount = order.shipping_amount;
        let orderBaseShippingAmount = order.base_shipping_amount;
        let allowedAmount = NumberHelper.minusNumber(orderShippingAmount, order.shipping_refunded);
        let baseAllowedAmount = NumberHelper.minusNumber(orderBaseShippingAmount, order.base_shipping_refunded);
        /*amounts including tax*/
        let orderShippingInclTax = order.shipping_incl_tax;
        let orderBaseShippingInclTax = order.base_shipping_incl_tax;
        let allowedTaxAmount = NumberHelper.minusNumber(order.shipping_tax_amount, order.shipping_tax_refunded);
        let baseAllowedTaxAmount = NumberHelper.minusNumber(
            order.base_shipping_tax_amount, order.base_shipping_tax_refunded
        );
        let allowedAmountInclTax = NumberHelper.addNumber(allowedAmount, allowedTaxAmount);
        let baseAllowedAmountInclTax = NumberHelper.addNumber(baseAllowedAmount, baseAllowedTaxAmount);

        let shippingAmount = 0,
            baseShippingAmount = 0,
            shippingInclTax = 0,
            baseShippingInclTax = 0;
        let useAmountsWithTax = this.isSuppliedShippingAmountInclTax();
        if (typeof creditmemo[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] !== 'undefined') {
            let desiredAmount = CurrencyHelper.roundToFloat(
                creditmemo[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY]
            );
            let maxAllowedAmount = useAmountsWithTax ? allowedAmountInclTax : allowedAmount;
            let originalTotalAmount = useAmountsWithTax ? orderShippingInclTax : orderShippingAmount;
            if (desiredAmount < CurrencyHelper.roundToFloat(maxAllowedAmount) + 0.0001) {
                let ratio = 0;
                if (originalTotalAmount > 0) {
                    ratio = desiredAmount / originalTotalAmount;
                }
                if (desiredAmount > NumberHelper.minusNumber(maxAllowedAmount, 0.0001)) {
                    shippingAmount = allowedAmount;
                    baseShippingAmount = baseAllowedAmount;
                } else {
                    shippingAmount = CurrencyHelper.roundToFloat(orderShippingAmount * ratio);
                    baseShippingAmount = CurrencyHelper.roundToFloat(orderBaseShippingAmount * ratio);
                }
                shippingInclTax = CurrencyHelper.roundToFloat(orderShippingInclTax * ratio);
                baseShippingInclTax = CurrencyHelper.roundToFloat(orderBaseShippingInclTax * ratio);
            } else {
                creditmemo.isValidated = false;
                maxAllowedAmount = OrderHelper.formatPrice(maxAllowedAmount, order);
                creditmemo.errors[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] = i18n.translator.translate(
                    "Maximum shipping amount " +
                    (useAmountsWithTax ? "(incl. tax) " : "") +
                    "allowed to refund is {{amount}}",
                    {amount: maxAllowedAmount}
                );
            }
        } else {
            shippingAmount = allowedAmount;
            baseShippingAmount = baseAllowedAmount;
            shippingInclTax = CurrencyHelper.roundToFloat(allowedAmountInclTax);
            baseShippingInclTax = CurrencyHelper.roundToFloat(baseAllowedAmountInclTax);
            creditmemo[CreateCreditmemoConstant.ADJUSTMENT_SHIPPING_KEY] = useAmountsWithTax ?
                shippingInclTax :
                shippingAmount;
        }
        creditmemo.shipping_amount = shippingAmount;
        creditmemo.base_shipping_amount = baseShippingAmount;
        creditmemo.shipping_incl_tax = shippingInclTax;
        creditmemo.base_shipping_incl_tax = baseShippingInclTax;

        creditmemo.grand_total = NumberHelper.addNumber(creditmemo.grand_total, shippingAmount);
        creditmemo.base_grand_total = NumberHelper.addNumber(creditmemo.base_grand_total, baseShippingAmount);
        return this;
    }

    /**
     * Returns whether the user specified a shipping amount that already includes tax
     *
     * @return bool
     */
    isSuppliedShippingAmountInclTax() {
        /*returns true if we are only displaying shipping including tax, otherwise returns false*/
        return TaxHelper.orderDisplayShippingAmountIncludeTax();
    }
}

/** @type CreditmemoShippingService */
let creditmemoShippingService = ServiceFactory.get(CreditmemoShippingService);

export default creditmemoShippingService;