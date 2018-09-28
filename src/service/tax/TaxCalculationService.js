import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import CalculatorFactory from "./calculation/CalculatorFactoryService";
import TaxHelper from "../../helper/TaxHelper";
import CurrencyHelper from "../../helper/CurrencyHelper";

export class TaxCalculationService extends CoreService {
    static className = 'TaxCalculationService';

    keyedItems = {};
    parentToChildren = {};

    /**
     * @param quoteDetails
     * @param round
     * @returns {{subtotal: number, tax_amount: number, discount_tax_compensation_amount: number, applied_taxes: Array, items: Array}}
     */
    calculateTax(quoteDetails, round = true) {
        let taxDetailsData = {
            subtotal: 0.0,
            tax_amount: 0.0,
            discount_tax_compensation_amount: 0.0,
            applied_taxes: [],
            items: []
        };
        let items = quoteDetails.items;
        if (!items || !items.length) {
            return taxDetailsData;
        }
        this.computeRelationships(items);

        let calculator = CalculatorFactory.create(
            TaxHelper.getAlgorithm(),
            quoteDetails.billing_address,
            quoteDetails.shipping_address,
            quoteDetails.customer_tax_class_key ? quoteDetails.customer_tax_class_key.value : null,
            quoteDetails.customer
        );

        let processedItems = {};
        Object.keys(this.keyedItems).map(key => {
            let item = this.keyedItems[key];
            let processedItem = null;
            if (this.parentToChildren[item.code]) {
                let processedChildren = [];
                this.parentToChildren[item.code].map(child => {
                    let processedChildrenItem = this.processItem(child, calculator, round);
                    taxDetailsData = this.aggregateItemData(taxDetailsData, processedChildrenItem);
                    processedItems[processedChildrenItem.code] = processedChildrenItem;
                    processedChildren.push(processedChildrenItem);
                    return child;
                });
                processedItem = this.calculateParent(processedChildren, item.quantity);
                processedItem.code = item.code;
                processedItem.type = item.type;
            } else {
                processedItem = this.processItem(item, calculator, round);
                taxDetailsData = this.aggregateItemData(taxDetailsData, processedItem);
            }
            processedItems[processedItem.code] = processedItem;
            return item;
        });

        let taxDetailsDataObject = taxDetailsData;
        taxDetailsDataObject.items = processedItems;
        return taxDetailsDataObject;
    }

    /**
     * Computes relationships between items, primarily the child to parent relationship.
     *
     * @param {object[]} items
     */
    computeRelationships(items) {
        this.keyedItems = {};
        this.parentToChildren = {};
        items.map(item => {
            if (typeof item.parent_code === 'undefined' || item.parent_code === null) {
                this.keyedItems[item.code] = item;
            } else {
                if (!this.parentToChildren[item.parent_code]) {
                    this.parentToChildren[item.parent_code] = [];
                }
                this.parentToChildren[item.parent_code].push(item);
            }
            return item;
        });
    }

    /**
     * Calculate item tax with customized rounding level
     *
     * @param {object} item
     * @param {object} calculator
     * @param {boolean} round
     * @return {object}
     */
    processItem(item, calculator, round = true) {
        let quantity = this.getTotalQuantity(item);
        return calculator.calculate(item, quantity, round);
    }

    /**
     * Calculate row information for item based on children calculation
     *
     * @param {object} children
     * @param {number} quantity
     * @return {{price: *|number, price_incl_tax: *|number, row_total: number, row_total_incl_tax: number, row_tax: number}}
     */
    calculateParent(children, quantity) {
        let rowTotal = 0.00;
        let rowTotalInclTax = 0.00;
        let rowTax = 0.00;
        /*let taxableAmount = 0.00;*/
        children.map(child => {
            rowTotal += child.row_total;
            rowTotalInclTax += child.row_total_incl_tax;
            rowTax += child.row_tax;
            /*taxableAmount += child.taxable_amount;*/
            return child;
        });
        let price = CurrencyHelper.roundToFloat(rowTotal / quantity);
        let priceInclTax = CurrencyHelper.roundToFloat(rowTotalInclTax / quantity);
        let taxDetailsItemDataObject = {
            price: price,
            price_incl_tax: priceInclTax,
            row_total: rowTotal,
            row_total_incl_tax: rowTotalInclTax,
            row_tax: rowTax
        };

        return taxDetailsItemDataObject;
    }

    /**
     * Add row total item amount to subtotal
     *
     * @param {object} taxDetailsData
     * @param {object} item
     * @return {object}
     */
    aggregateItemData(taxDetailsData, item) {
        taxDetailsData['subtotal']
            = taxDetailsData['subtotal'] + item.row_total;

        taxDetailsData['tax_amount']
            = taxDetailsData['tax_amount'] + item.row_tax;

        taxDetailsData['discount_tax_compensation_amount'] =
            taxDetailsData['discount_tax_compensation_amount'] + item.discount_tax_compensation_amount;

        let itemAppliedTaxes = item.applied_taxes;
        if (itemAppliedTaxes === null) {
            return taxDetailsData;
        }
        let appliedTaxes = taxDetailsData['applied_taxes'];
        Object.keys(itemAppliedTaxes).map(taxId => {
            let itemAppliedTax = itemAppliedTaxes[taxId];
            if (typeof appliedTaxes[taxId] === 'undefined') {
                let rates = {};
                let rateDataObjects = itemAppliedTax.rates;
                Object.keys(rateDataObjects).forEach(key => {
                    let rateDataObject = rateDataObjects[key];
                    rates[rateDataObject.code] = {
                        code: rateDataObject.code,
                        title: rateDataObject.title,
                        percent: rateDataObject.percent
                    };
                });
                appliedTaxes[taxId] = {
                    amount: itemAppliedTax.amount,
                    percent: itemAppliedTax.percent,
                    rates: rates,
                    tax_rate_key: itemAppliedTax.tax_rate_key
                };
            } else {
                appliedTaxes[taxId]['amount'] += itemAppliedTax.amount;
            }
            return taxId;
        });
        taxDetailsData['applied_taxes'] = appliedTaxes;
        return taxDetailsData;
    }

    /**
     * Calculates the total quantity for this item.
     *
     * What this really means is that if this is a child item, it return the parent quantity times
     * the child quantity and return that as the child's quantity.
     *
     * @param {object} item
     * @return {number}
     */
    getTotalQuantity(item) {
        if (item.parent_code) {
            let parentQuantity = this.keyedItems[item.parent_code].quantity;
            return parentQuantity * item.quantity;
        }
        return item.quantity;
    }
}

/** @type TaxCalculationService */
let taxCalculationService = ServiceFactory.get(TaxCalculationService);

export default taxCalculationService;