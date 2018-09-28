import {AbstractCalculatorService} from "./AbstractCalculatorService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import CalculationToolService from "../CalculationToolService";
import TaxHelper from "../../../helper/TaxHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import NumberHelper from "../../../helper/NumberHelper";

export class UnitBaseCalculatorService extends AbstractCalculatorService {
    static className = 'UnitBaseCalculatorService';

    /**
     * {@inheritdoc}
     */
    roundAmount(amount,
                rate = null,
                direction = null,
                type = this.KEY_REGULAR_DELTA_ROUNDING,
                round = true,
                item = null) {
        if (item.associated_item_code) {
            // Use delta rounding of the product's instead of the weee's
            type = type + item.associated_item_code;
        } else {
            type = type + item.code;
        }

        return this.deltaRound(amount, rate, direction, type, round);
    }

    /**
     *
     * @param item
     * @param quantity
     * @param round
     * @return {{code, type, row_tax: number, price: number, price_incl_tax: *|number, row_total: *|number, row_total_incl_tax: *|number, discount_tax_compensation_amount: number, associated_item_code: *, tax_percent: number, applied_taxes: Object}}
     */
    calculateWithTaxInPrice(item, quantity, round = true) {
        let taxRateRequest = this.getAddressRateRequest();
        taxRateRequest.product_class_id = item.tax_class_key.value;
        let rate = CalculationToolService.getRate(taxRateRequest);
        let storeRate = CalculationToolService.getStoreRate(taxRateRequest);

        let applyTaxAfterDiscount = TaxHelper.applyTaxAfterDiscount();
        let priceInclTax = CurrencyHelper.roundToFloat(item.unit_price);
        let originalPriceInclTax = CurrencyHelper.roundToFloat(item.original_price);
        if (!this.isSameRateAsStore(rate, storeRate)) {
            priceInclTax = this.calculatePriceInclTax(priceInclTax, storeRate, rate, round);
            originalPriceInclTax = this.calculatePriceInclTax(originalPriceInclTax, storeRate, rate, round);
        }
        let uniTax = CalculationToolService.calcTaxAmount(priceInclTax, rate, true, false);
        let uniOriginalPriceTax = CalculationToolService.calcTaxAmount(originalPriceInclTax, rate, true, false);

        let deltaRoundingType = this.KEY_REGULAR_DELTA_ROUNDING;
        if (applyTaxAfterDiscount) {
            deltaRoundingType = this.KEY_TAX_BEFORE_DISCOUNT_DELTA_ROUNDING;
        }

        uniTax = this.roundAmount(uniTax, rate, true, deltaRoundingType, round, item);
        uniOriginalPriceTax = this.roundAmount(uniOriginalPriceTax, rate, true, deltaRoundingType, round, item);
        let price = priceInclTax - uniTax;
        let originalPriceExclTax = originalPriceInclTax - uniOriginalPriceTax;
        let discountTaxCompensationAmount = 0;
        let discountAmount = item.discount_amount;

        if (applyTaxAfterDiscount) {
            /*@todo: handle originalDiscountAmount*/
            let unitDiscountAmount = discountAmount / quantity;
            let taxableAmount = Math.max(priceInclTax - unitDiscountAmount, 0);
            let unitTaxAfterDiscount = CalculationToolService.calcTaxAmount(taxableAmount, rate, true, false);
            unitTaxAfterDiscount = this.roundAmount(
                unitTaxAfterDiscount,
                rate,
                true,
                this.KEY_REGULAR_DELTA_ROUNDING,
                round,
                item
            );

            // Set discount tax compensation
            let unitDiscountTaxCompensationAmount = uniTax - unitTaxAfterDiscount;
            discountTaxCompensationAmount = unitDiscountTaxCompensationAmount * quantity;
            uniTax = unitTaxAfterDiscount;
        }
        let rowTax = uniTax * quantity;

        let appliedRates = CalculationToolService.getAppliedRates(taxRateRequest);
        let appliedTaxes = this.getAppliedTaxes(rowTax, rate, appliedRates);
        return {
            code: item.code,
            type: item.type,
            row_tax: rowTax,
            price: price,
            price_incl_tax: priceInclTax,
            original_price_excl_tax: originalPriceExclTax,
            original_price_incl_tax: originalPriceInclTax,
            row_total: NumberHelper.multipleNumber(price, quantity),
            row_total_incl_tax: NumberHelper.multipleNumber(priceInclTax, quantity),
            discount_tax_compensation_amount: discountTaxCompensationAmount,
            associated_item_code: item.associated_item_code,
            tax_percent: rate,
            applied_taxes: appliedTaxes
        }
    }

    /**
     *
     * @param item
     * @param quantity
     * @param round
     * @return {{code, type, row_tax: number, price: *|number, price_incl_tax: *, row_total: *|number, row_total_incl_tax: *|number, discount_tax_compensation_amount: number, associated_item_code: *, tax_percent: number, applied_taxes: {}}}
     */
    calculateWithTaxNotInPrice(item, quantity, round = true) {
        let taxRateRequest = this.getAddressRateRequest();
        taxRateRequest.product_class_id = item.tax_class_key.value;

        let rate = CalculationToolService.getRate(taxRateRequest);
        let appliedRates = CalculationToolService.getAppliedRates(taxRateRequest);

        let applyTaxAfterDiscount = TaxHelper.applyTaxAfterDiscount();
        let discountAmount = item.discount_amount;
        let discountTaxCompensationAmount = 0;

        let price = CurrencyHelper.roundToFloat(item.unit_price);
        let originalPriceExclTax = CurrencyHelper.roundToFloat(item.original_price);
        let unitTaxes = [];
        let unitTaxesBeforeDiscount = [];
        let unitTaxesOriginalPrice = [];
        let appliedTaxes = {};

        appliedRates.forEach(appliedRate => {
            let taxId = appliedRate['id'];
            let taxRate = appliedRate['percent'];
            let unitTaxPerRate = CalculationToolService.calcTaxAmount(price, taxRate, false, false);
            let unitTaxOriginalPricePerRate = CalculationToolService.calcTaxAmount(
                originalPriceExclTax, taxRate, false, false
            );
            let deltaRoundingType = this.KEY_REGULAR_DELTA_ROUNDING;
            if (applyTaxAfterDiscount) {
                deltaRoundingType = this.KEY_TAX_BEFORE_DISCOUNT_DELTA_ROUNDING;
            }
            unitTaxPerRate = this.roundAmount(unitTaxPerRate, taxId, false, deltaRoundingType, round, item);
            unitTaxOriginalPricePerRate = this.roundAmount(
                unitTaxOriginalPricePerRate, taxId, false, deltaRoundingType, round, item
            );
            let unitTaxAfterDiscount = unitTaxPerRate;

            if (applyTaxAfterDiscount) {
                //TODO: handle originalDiscountAmount
                let unitDiscountAmount = discountAmount / quantity;
                let taxableAmount = Math.max(price - unitDiscountAmount, 0);
                unitTaxAfterDiscount = CalculationToolService.calcTaxAmount(taxableAmount, taxRate, false, false);
                unitTaxAfterDiscount = this.roundAmount(
                    unitTaxAfterDiscount,
                    taxId,
                    false,
                    this.KEY_REGULAR_DELTA_ROUNDING,
                    round,
                    item
                );
            }
            appliedTaxes[taxId] = this.getAppliedTax(unitTaxAfterDiscount * quantity, appliedRate);

            unitTaxes.push(unitTaxAfterDiscount);
            unitTaxesBeforeDiscount.push(unitTaxPerRate);
            unitTaxesOriginalPrice.push(unitTaxOriginalPricePerRate);
        });
        let unitTax = unitTaxes.length ? unitTaxes.reduce((a, b) => NumberHelper.addNumber(a, b)) : 0;
        let unitTaxBeforeDiscount = unitTaxesBeforeDiscount.length ?
            unitTaxesBeforeDiscount.reduce((a, b) => NumberHelper.addNumber(a, b)) :
            0;
        let unitTaxOriginalPrice = unitTaxesOriginalPrice.length ?
            unitTaxesOriginalPrice.reduce((a, b) => NumberHelper.addNumber(a, b)) :
            0;

        let rowTax = unitTax * quantity;
        let priceInclTax = price + unitTaxBeforeDiscount;
        let originalPriceInclTax = originalPriceExclTax + unitTaxOriginalPrice;

        return {
            code: item.code,
            type: item.type,
            row_tax: rowTax,
            price: price,
            price_incl_tax: priceInclTax,
            original_price_excl_tax: originalPriceExclTax,
            original_price_incl_tax: originalPriceInclTax,
            row_total: NumberHelper.multipleNumber(price, quantity),
            row_total_incl_tax: NumberHelper.multipleNumber(priceInclTax, quantity),
            discount_tax_compensation_amount: discountTaxCompensationAmount,
            associated_item_code: item.associated_item_code,
            tax_percent: rate,
            applied_taxes: appliedTaxes
        }
    }
}

/** @type UnitBaseCalculatorService */
let unitBaseCalculatorService = ServiceFactory.get(UnitBaseCalculatorService);

export default unitBaseCalculatorService;