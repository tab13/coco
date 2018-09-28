import {CreditmemoAbstractTotalService} from "./AbstractTotalService";
import ServiceFactory from "../../../../../framework/factory/ServiceFactory";
import CurrencyHelper from "../../../../../helper/CurrencyHelper";
import NumberHelper from "../../../../../helper/NumberHelper";

export class CreditmemoGrandTotalService extends CreditmemoAbstractTotalService {
    static className = 'CreditmemoGrandTotalService';

    /**
     * Collect creditmemo grand total
     *
     * @param creditmemo
     * @return {CreditmemoGrandTotalService}
     */
    collect(creditmemo) {
        let grandTotal = creditmemo.grand_total ? +creditmemo.grand_total : 0;
        let baseGrandTotal = creditmemo.base_grand_total ? +creditmemo.base_grand_total : 0;
        let adjustmentPositiveValue = creditmemo.adjustment_positive_value;
        let adjustmentNegativeValue = creditmemo.adjustment_negative_value;
        /*this.validateAdjustmentAmount(
            creditmemo, adjustmentPositiveValue, CreateCreditmemoConstant.ADJUSTMENT_POSITIVE_KEY
        );
        this.validateAdjustmentAmount(
            creditmemo, adjustmentNegativeValue, CreateCreditmemoConstant.ADJUSTMENT_NEGATIVE_KEY
        );*/
        let adjustmentPositive = this.calculateAdjustmentAmount(adjustmentPositiveValue, creditmemo);
        let adjustmentNegative = this.calculateAdjustmentAmount(adjustmentNegativeValue, creditmemo);

        creditmemo.adjustment_positive = adjustmentPositive;
        let baseAdjustmentPositive = CurrencyHelper.roundToFloat(
            adjustmentPositive * (1 / creditmemo.order.base_to_order_rate)
        );
        creditmemo.base_adjustment_positive = baseAdjustmentPositive;

        creditmemo.adjustment_negative = adjustmentNegative;
        let baseAdjustmentNegative = CurrencyHelper.roundToFloat(
            adjustmentNegative * (1 / creditmemo.order.base_to_order_rate)
        );
        creditmemo.base_adjustment_negative = baseAdjustmentNegative;

        grandTotal = NumberHelper.addNumber(grandTotal, adjustmentPositive, -adjustmentNegative);
        baseGrandTotal = NumberHelper.addNumber(baseGrandTotal, baseAdjustmentPositive, -baseAdjustmentNegative);

        creditmemo.grand_total = grandTotal;
        creditmemo.base_grand_total = baseGrandTotal;

        creditmemo.adjustment = NumberHelper.minusNumber(adjustmentPositive, adjustmentPositive);
        creditmemo.base_adjustment = NumberHelper.minusNumber(baseAdjustmentPositive, baseAdjustmentNegative);

        return this;
    }

    /**
     * Validate adjustment amount
     *
     * @param creditmemo
     * @param adjustmentValue
     * @param adjustmentType
     */
    /*validateAdjustmentAmount(creditmemo, adjustmentValue, adjustmentType) {
        if(adjustmentValue) {
            if (adjustmentValue.substr(-1) === '%') {
                adjustmentValue = adjustmentValue.substr(0, adjustmentValue.length - 1);
                if (adjustmentValue > 100) {
                    creditmemo.isValidated = false;
                    creditmemo.errors[adjustmentType] = i18n.translator.translate(
                        "Maximum adjustment allowed to refund is 100%"
                    );
                }
            }
        }
    }*/

    /**
     * Calculate adjustment amount
     *
     * @param adjustmentValue
     * @param creditmemo
     * @return {*|number}
     */
    calculateAdjustmentAmount(adjustmentValue, creditmemo) {
        let grandTotal = creditmemo.grand_total ? +creditmemo.grand_total : 0;
        let adjustmentAmount = 0;
        if (adjustmentValue) {
            adjustmentValue = adjustmentValue.toString();
            if (adjustmentValue.substr(-1) === '%') {
                grandTotal = creditmemo.order.grand_total;
                adjustmentAmount = adjustmentValue.substr(0, adjustmentValue.length - 1);
                adjustmentAmount = CurrencyHelper.formatCurrencyStringToNumberString(adjustmentAmount);
                adjustmentAmount = grandTotal * adjustmentAmount / 100;
            } else {
                adjustmentAmount = CurrencyHelper.formatCurrencyStringToNumberString(adjustmentValue);
            }
        }
        return CurrencyHelper.roundToFloat(adjustmentAmount);
    }
}

/** @type CreditmemoGrandTotalService */
let creditmemoGrandTotalService = ServiceFactory.get(CreditmemoGrandTotalService);

export default creditmemoGrandTotalService;