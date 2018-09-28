import {AbstractCalculatorService} from "./AbstractCalculatorService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import CalculationToolService from "../CalculationToolService";
import TaxHelper from "../../../helper/TaxHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import NumberHelper from "../../../helper/NumberHelper";

export class AbstractAggregateCalculatorService extends AbstractCalculatorService {
    static className = 'AbstractAggregateCalculatorService';

    /**
     * Round amount
     *
     * @param amount
     * @param rate
     * @param direction
     * @param type
     * @param round
     * @param item
     */
    roundAmount(amount, rate = null, direction = null,
                type = this.KEY_REGULAR_DELTA_ROUNDING, round = true, item = null) {
    }

    /**
     *
     * @param item
     * @param quantity
     * @param round
     * @return {{code, type, row_tax: *, price: number, price_incl_tax: *|number, row_total: number, row_total_incl_tax: number, discount_tax_compensation_amount: number, associated_item_code: *, tax_percent: number, applied_taxes: Object}}
     */
    calculateWithTaxInPrice(item, quantity, round = true) {
        let taxRateRequest = this.getAddressRateRequest();
        taxRateRequest.product_class_id = item.tax_class_key.value;
        let rate = CalculationToolService.getRate(taxRateRequest);
        let storeRate = CalculationToolService.getStoreRate(taxRateRequest);

        let discountTaxCompensationAmount = 0;
        let applyTaxAfterDiscount = TaxHelper.applyTaxAfterDiscount();
        let discountAmount = item.discount_amount || 0;

        let priceInclTax = CurrencyHelper.roundToFloat(item.unit_price);
        let originalPriceInclTax = CurrencyHelper.roundToFloat(item.original_price);
        let rowTotalInclTax = priceInclTax * quantity;
        let rowTotalOriginalPriceInclTax = originalPriceInclTax * quantity;
        if (!this.isSameRateAsStore(rate, storeRate)) {
            priceInclTax = this.calculatePriceInclTax(priceInclTax, storeRate, rate, round);
            rowTotalInclTax = priceInclTax * quantity;
            originalPriceInclTax = this.calculatePriceInclTax(originalPriceInclTax, storeRate, rate, round);
            rowTotalOriginalPriceInclTax = originalPriceInclTax * quantity;
        }
        let rowTaxExact = CalculationToolService.calcTaxAmount(rowTotalInclTax, rate, true, false);
        let rowTaxOriginalPriceExact = CalculationToolService.calcTaxAmount(
            rowTotalOriginalPriceInclTax, rate, true, false
        );
        let deltaRoundingType = this.KEY_REGULAR_DELTA_ROUNDING;
        if (applyTaxAfterDiscount) {
            deltaRoundingType = this.KEY_TAX_BEFORE_DISCOUNT_DELTA_ROUNDING;
        }
        let rowTax = this.roundAmount(rowTaxExact, rate, true, deltaRoundingType, round, item);
        let rowTaxOriginalPrice = this.roundAmount(
            rowTaxOriginalPriceExact, rate, true, deltaRoundingType, round, item
        );
        let rowTotal = rowTotalInclTax - rowTax;
        let rowTotalOriginalPrice = rowTotalOriginalPriceInclTax - rowTaxOriginalPrice;
        let price = rowTotal / quantity;
        let originalPriceExclTax = rowTotalOriginalPrice / quantity;
        if (round) {
            price = CurrencyHelper.roundToFloat(price);
            originalPriceExclTax = CurrencyHelper.roundToFloat(originalPriceExclTax);
        }

        /*Handle discount*/
        if (applyTaxAfterDiscount) {
            /*@todo: handle originalDiscountAmount*/
            let taxableAmount = Math.max(rowTotalInclTax - discountAmount, 0);
            let rowTaxAfterDiscount = CalculationToolService.calcTaxAmount(taxableAmount, rate, true, false);
            rowTaxAfterDiscount = this.roundAmount(
                rowTaxAfterDiscount,
                rate,
                true,
                this.KEY_REGULAR_DELTA_ROUNDING,
                round,
                item
            );
            // Set discount tax compensation
            discountTaxCompensationAmount = rowTax - rowTaxAfterDiscount;
            rowTax = rowTaxAfterDiscount;
        }

        /*Calculate applied taxes*/
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
            row_total: rowTotal,
            row_total_incl_tax: rowTotalInclTax,
            discount_tax_compensation_amount: discountTaxCompensationAmount,
            associated_item_code: item.associated_item_code,
            tax_percent: rate,
            applied_taxes: appliedTaxes
        }
    }

    /**
     * Calculate tax not it price
     *
     * @param item
     * @param quantity
     * @param round
     * @return {{code, type, row_tax: *, price: *|number, price_incl_tax: number, original_price_excl_tax: *|number, original_price_incl_tax: number, row_total: number, row_total_incl_tax: *, discount_tax_compensation_amount: number, associated_item_code: *, tax_percent: number, applied_taxes: {}}}
     */
    calculateWithTaxNotInPrice(item, quantity, round = true) {
        let taxRateRequest = this.getAddressRateRequest();
        taxRateRequest.product_class_id = item.tax_class_key.value;
        let rate = CalculationToolService.getRate(taxRateRequest);
        let appliedRates = CalculationToolService.getAppliedRates(taxRateRequest);

        let applyTaxAfterDiscount = TaxHelper.applyTaxAfterDiscount();
        let discountAmount = item.discount_amount || 0;
        let discountTaxCompensationAmount = 0;

        /*Calculate row total*/
        let price = CurrencyHelper.roundToFloat(item.unit_price);
        let originalPriceExclTax = CurrencyHelper.roundToFloat(item.original_price);
        let rowTotal = price * quantity;
        let rowTotalOriginalPriceExclTax = originalPriceExclTax * quantity;
        let rowTaxes = [];
        let rowTaxesBeforeDiscount = [];
        let rowTaxesOriginalPrice = [];
        let appliedTaxes = {};

        appliedRates.forEach(appliedRate => {
            let taxId = appliedRate['id'];
            let taxRate = appliedRate['percent'];
            let rowTaxPerRate = CalculationToolService.calcTaxAmount(rowTotal, taxRate, false, false);
            let rowTaxOriginalPricePerRate = CalculationToolService.calcTaxAmount(
                rowTotalOriginalPriceExclTax, taxRate, false, false
            );
            let deltaRoundingType = this.KEY_REGULAR_DELTA_ROUNDING;
            if (applyTaxAfterDiscount) {
                deltaRoundingType = this.KEY_TAX_BEFORE_DISCOUNT_DELTA_ROUNDING;
            }
            rowTaxPerRate = this.roundAmount(rowTaxPerRate, taxId, false, deltaRoundingType, round, item);
            rowTaxOriginalPricePerRate = this.roundAmount(
                rowTaxOriginalPricePerRate, taxId, false, deltaRoundingType, round, item
            );
            let rowTaxAfterDiscount = rowTaxPerRate;

            /*Handle discount*/
            if (applyTaxAfterDiscount) {
                /*@todo: handle originalDiscountAmount*/
                let taxableAmount = Math.max(rowTotal - discountAmount, 0);
                rowTaxAfterDiscount = CalculationToolService.calcTaxAmount(taxableAmount, taxRate, false, false);
                rowTaxAfterDiscount = this.roundAmount(
                    rowTaxAfterDiscount,
                    taxId,
                    false,
                    this.KEY_REGULAR_DELTA_ROUNDING,
                    round,
                    item
                );
            }
            appliedTaxes[taxId] = this.getAppliedTax(rowTaxAfterDiscount, appliedRate);
            rowTaxes.push(rowTaxAfterDiscount);
            rowTaxesBeforeDiscount.push(rowTaxPerRate);
            rowTaxesOriginalPrice.push(rowTaxOriginalPricePerRate);
        });
        let rowTax = rowTaxes.length ? rowTaxes.reduce((a, b) => NumberHelper.addNumber(a, b)) : 0;
        let rowTaxBeforeDiscount = rowTaxesBeforeDiscount.length ?
            rowTaxesBeforeDiscount.reduce((a, b) => NumberHelper.addNumber(a, b)) :
            0;
        let rowTaxOriginalPrice = rowTaxesOriginalPrice.length ?
            rowTaxesOriginalPrice.reduce((a, b) => NumberHelper.addNumber(a, b)) :
            0;
        let rowTotalInclTax = rowTotal + rowTaxBeforeDiscount;
        let rowTotalOriginalPriceInclTax = rowTotalOriginalPriceExclTax + rowTaxOriginalPrice;
        let priceInclTax = rowTotalInclTax / quantity;
        let originalPriceInclTax = rowTotalOriginalPriceInclTax / quantity;
        if (round) {
            priceInclTax = CurrencyHelper.roundToFloat(priceInclTax);
            originalPriceInclTax = CurrencyHelper.roundToFloat(originalPriceInclTax);
        }
        return {
            code: item.code,
            type: item.type,
            row_tax: rowTax,
            price: price,
            price_incl_tax: priceInclTax,
            original_price_excl_tax: originalPriceExclTax,
            original_price_incl_tax: originalPriceInclTax,
            row_total: rowTotal,
            row_total_incl_tax: rowTotalInclTax,
            discount_tax_compensation_amount: discountTaxCompensationAmount,
            associated_item_code: item.associated_item_code,
            tax_percent: rate,
            applied_taxes: appliedTaxes
        }
    }
}

/** @type AbstractAggregateCalculatorService */
let abstractAggregateCalculatorService = ServiceFactory.get(AbstractAggregateCalculatorService);

export default abstractAggregateCalculatorService;