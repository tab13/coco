import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import QuoteItemService from "../checkout/quote/ItemService";
import TaxHelper from "../../helper/TaxHelper";
import NumberHelper from "../../helper/NumberHelper";
import ProductTypeConstant from "../../view/constant/ProductTypeConstant";

export class WeeeDataService extends CoreService {
    static className = 'WeeeDataService';

    KEY_WEEE_AMOUNT_INVOICED = 'weee_amount_invoiced';
    KEY_BASE_WEEE_AMOUNT_INVOICED = 'base_weee_amount_invoiced';
    KEY_WEEE_TAX_AMOUNT_INVOICED = 'weee_tax_amount_invoiced';
    KEY_BASE_WEEE_TAX_AMOUNT_INVOICED = 'base_weee_tax_amount_invoiced';
    KEY_WEEE_AMOUNT_REFUNDED = 'weee_amount_refunded';
    KEY_BASE_WEEE_AMOUNT_REFUNDED = 'base_weee_amount_refunded';
    KEY_WEEE_TAX_AMOUNT_REFUNDED = 'weee_tax_amount_refunded';
    KEY_BASE_WEEE_TAX_AMOUNT_REFUNDED = 'base_weee_tax_amount_refunded';

    /**
     * Check if the FPT totals line(s) should be displayed with tax included
     *
     * @return {*|boolean}
     */
    displayTotalsInclTax() {
        return TaxHelper.priceIncludesTax();
    }

    /**
     * Sets applied weee taxes
     *
     * @param {object} item
     * @param {Array} value
     * @return {WeeeDataService}
     */
    setApplied(item, value) {
        item.weee_tax_applied = JSON.stringify(value);
        return this;
    }

    /**
     * Returns applied weee taxes
     *
     * @param item
     * @param quote
     * @return {*}
     */
    getApplied(item, quote) {
        if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
            let result = [];
            QuoteItemService.getChildrenItems(quote, item).forEach(child => {
                let childData = this.getApplied(child, quote);
                if (Array.isArray(childData)) {
                    result = [...result, ...childData];
                }
            });
            return result;
        }
        /*if order item data is old enough then weee_tax_applied might not be valid*/
        let data = item.weee_tax_applied;
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    }

    /**
     * Get the total weee including tax by row
     *
     * @param item
     * @param quote
     * @param useBaseCurrency
     * @return {number}
     */
    getRowWeeeTaxInclTax(item, quote, useBaseCurrency = false) {
        let weeeTaxAppliedAmounts = this.getApplied(item, quote);
        let totalWeeeTaxIncTaxApplied = 0;
        weeeTaxAppliedAmounts.forEach(weeeTaxAppliedAmount => {
            let rowAmountInclTax = useBaseCurrency ?
                weeeTaxAppliedAmount.base_row_amount_incl_tax : weeeTaxAppliedAmount.row_amount_incl_tax;
            totalWeeeTaxIncTaxApplied = NumberHelper.addNumber(
                totalWeeeTaxIncTaxApplied, Math.max(rowAmountInclTax || 0, 0)
            );
        });
        return totalWeeeTaxIncTaxApplied;
    }

    /**
     * Returns the total amount of FPT across all items.  Used for displaying the FPT totals line item.
     *
     * @param items
     * @param quote
     * @return {number}
     */
    getTotalAmounts(items, quote) {
        let weeeTotal = 0;
        let displayTotalsInclTax = this.displayTotalsInclTax();
        items.forEach(item => {
            if (displayTotalsInclTax) {
                weeeTotal = NumberHelper.addNumber(weeeTotal, this.getRowWeeeTaxInclTax(item, quote));
            } else {
                weeeTotal = NumberHelper.addNumber(weeeTotal, item.weee_tax_applied_row_amount);
            }
        });
        return weeeTotal;
    }

    /**
     * Returns the total amount of FPT across cart item.  Used for displaying the cart item.
     *
     * @param items
     * @param quote
     * @return {number}
     */
    getCartItemAmount(items, quote) {
        let weeeTotal = 0;
        let displayPriceInclTax = TaxHelper.shoppingCartDisplayPriceIncludeTax();
        items.forEach(item => {
            if (displayPriceInclTax) {
                weeeTotal = NumberHelper.addNumber(weeeTotal, this.getRowWeeeTaxInclTax(item, quote));
            } else {
                weeeTotal = NumberHelper.addNumber(weeeTotal, item.weee_tax_applied_row_amount);
            }
        });
        return weeeTotal;
    }

    /**
     * Returns the total amount of FPT across cart item.  Used for displaying the product list.
     *
     * @param item
     * @param quote
     * @return {number}
     */
    getProductListItemAmount(item, quote) {
        let weeeTotal = 0;
        let displayPriceInclTax = TaxHelper.shoppingCartDisplayPriceIncludeTax();
        if (displayPriceInclTax) {
            let weeeTaxAppliedAmounts = this.getApplied(item, quote);
            let totalWeeeTaxIncTaxApplied = 0;
            weeeTaxAppliedAmounts.forEach(weeeTaxAppliedAmount => {
                let amountInclTax = 0;
                if(item.product_type === ProductTypeConstant.BUNDLE) {
                    amountInclTax = weeeTaxAppliedAmount.row_amount_incl_tax;
                    amountInclTax = amountInclTax ? amountInclTax / item.qty : amountInclTax;
                } else {
                    amountInclTax = weeeTaxAppliedAmount.amount_incl_tax;
                }
                totalWeeeTaxIncTaxApplied = NumberHelper.addNumber(
                    totalWeeeTaxIncTaxApplied, Math.max(amountInclTax || 0, 0)
                );
            });
            weeeTotal = NumberHelper.addNumber(weeeTotal, totalWeeeTaxIncTaxApplied);
        } else {
            weeeTotal = NumberHelper.addNumber(weeeTotal, item.weee_tax_applied_amount_incl_tax);
        }
        return weeeTotal;
    }

    /**
     * @param orderItem
     * @param order
     * @param useBaseCurrency
     * @return {number}
     */
    getWeeeAmountInvoiced(orderItem, order, useBaseCurrency = false) {
        let keyAmount = useBaseCurrency ? this.KEY_BASE_WEEE_AMOUNT_INVOICED : this.KEY_WEEE_AMOUNT_INVOICED;
        return this.getWeeeAmount(orderItem, order, keyAmount);
    }

    /**
     * @param orderItem
     * @param order
     * @param useBaseCurrency
     * @return {number}
     */
    getWeeeAmountRefunded(orderItem, order, useBaseCurrency = false) {
        let keyAmount = useBaseCurrency ? this.KEY_BASE_WEEE_AMOUNT_REFUNDED : this.KEY_WEEE_AMOUNT_REFUNDED;
        return this.getWeeeAmount(orderItem, order, keyAmount);
    }

    /**
     * @param orderItem
     * @param order
     * @param useBaseCurrency
     * @return {number}
     */
    getWeeeTaxAmountInvoiced(orderItem, order, useBaseCurrency = false) {
        let keyAmount = useBaseCurrency ? this.KEY_BASE_WEEE_TAX_AMOUNT_INVOICED : this.KEY_WEEE_TAX_AMOUNT_INVOICED;
        return this.getWeeeAmount(orderItem, order, keyAmount);
    }

    /**
     * @param orderItem
     * @param order
     * @param useBaseCurrency
     * @return {number}
     */
    getWeeeTaxAmountRefunded(orderItem, order, useBaseCurrency = false) {
        let keyAmount = useBaseCurrency ? this.KEY_BASE_WEEE_TAX_AMOUNT_REFUNDED : this.KEY_WEEE_TAX_AMOUNT_REFUNDED;
        return this.getWeeeAmount(orderItem, order, keyAmount);
    }

    /**
     *
     * @param orderItem
     * @param order
     * @param keyAmount
     * @return {number}
     */
    getWeeeAmount(orderItem, order, keyAmount) {
        let weeeTaxAppliedAmounts = this.getApplied(orderItem, order);
        let isFound = false;
        let totalAmount = 0;
        weeeTaxAppliedAmounts.forEach(weeeTaxAppliedAmount => {
            if (isFound) {
                return false;
            }
            if (typeof weeeTaxAppliedAmount[keyAmount] !== 'undefined') {
                totalAmount = weeeTaxAppliedAmount[keyAmount];
                isFound = true;
            }
        });
        return totalAmount;
    }
}

/** @type WeeeDataService */
let weeeDataService = ServiceFactory.get(WeeeDataService);

export default weeeDataService;