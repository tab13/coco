import {QuoteTotalCommonTaxCollectorService} from "./CommonTaxCollectorService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import AddressService from "../../../checkout/quote/AddressService";
import TaxHelper from "../../../../helper/TaxHelper";
import TaxCalculationService from "../../TaxCalculationService";

export class QuoteTotalTaxService extends QuoteTotalCommonTaxCollectorService {
    static className = 'QuoteTotalTaxService';

    code = 'tax';

    /**
     * Collect address tax
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {QuoteTotalSubtotalService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        this.clearValues(total);
        let isVirtual = this.isVirtual(quote);
        if ((isVirtual && AddressService.isBillingAddress(address)) ||
            (!isVirtual && AddressService.isShippingAddress(address))
        ) {
            let baseTaxDetails = this.getQuoteTaxDetails(quote, address, total, true);
            let taxDetails = this.getQuoteTaxDetails(quote, address, total, false);

            let itemsByType = this.organizeItemTaxDetailsByType(taxDetails, baseTaxDetails);

            if (typeof itemsByType[this.ITEM_TYPE_PRODUCT] !== 'undefined') {
                this.processProductItems(quote, address, itemsByType[this.ITEM_TYPE_PRODUCT], total);
            }

            if (typeof itemsByType[this.ITEM_TYPE_SHIPPING] !== 'undefined') {
                let shippingTaxDetails = itemsByType[this.ITEM_TYPE_SHIPPING][this.ITEM_CODE_SHIPPING][this.KEY_ITEM];
                let baseShippingTaxDetails =
                    itemsByType[this.ITEM_TYPE_SHIPPING][this.ITEM_CODE_SHIPPING][this.KEY_BASE_ITEM];
                this.processShippingTaxInfo(quote, address, total, shippingTaxDetails, baseShippingTaxDetails);
            }
            /*Process taxable items that are not product or shipping*/
            this.processExtraTaxables(total, itemsByType);

            /*Save applied taxes for each item and the quote in aggregation*/
            this.processAppliedTaxes(total, quote, address, itemsByType);

            if (this.includeExtraTax()) {
                this._addAmount(total.extra_tax_amount, 'extra_tax');
                this._addBaseAmount(total.base_extra_tax_amount, 'extra_tax');
            }

            return this;
        }
    }

    /**
     * Clear tax related total values in address
     *
     * @param total
     */
    clearValues(total) {
        this._setAmount(0, 'subtotal');
        this._setBaseAmount(0, 'subtotal');
        this._setAmount(0, 'tax');
        this._setBaseAmount(0, 'tax');
        this._setAmount(0, 'discount_tax_compensation');
        this._setBaseAmount(0, 'discount_tax_compensation');
        this._setAmount(0, 'shipping_discount_tax_compensation');
        this._setBaseAmount(0, 'shipping_discount_tax_compensation');
        total.subtotal_incl_tax = 0;
        total.base_subtotal_incl_tax = 0;
    }

    /**
     * Call tax calculation service to get tax details on the quote and items
     *
     * @param quote
     * @param address
     * @param total
     * @param useBaseCurrency
     * @return {{subtotal: number, tax_amount: number, discount_tax_compensation_amount: number, applied_taxes: Array, items: Array}}
     */
    getQuoteTaxDetails(quote, address, total, useBaseCurrency) {
        let priceIncludesTax = TaxHelper.priceIncludesTax();
        let itemDataObjects = this.mapItems(quote, address, priceIncludesTax, useBaseCurrency);
        let shippingDataObject = this.getShippingDataObject(quote, address, total, useBaseCurrency);
        if (shippingDataObject !== null) {
            itemDataObjects.push(shippingDataObject);
        }

        let quoteExtraTaxables = this.mapQuoteExtraTaxables(
            address,
            useBaseCurrency
        );

        if (!quoteExtraTaxables.length) {
            itemDataObjects = [...itemDataObjects, ...quoteExtraTaxables];
        }

        let quoteDetails = this.prepareQuoteDetails(quote, address, itemDataObjects);

        let taxDetails = TaxCalculationService.calculateTax(quoteDetails);

        return taxDetails;
    }

    /**
     * Map extra taxables associated with quote
     *
     * @param address
     * @param useBaseCurrency
     * @return {Array}
     */
    mapQuoteExtraTaxables(address, useBaseCurrency) {
        let itemDataObjects = [];
        let extraTaxables = address.associated_taxables;
        if (!extraTaxables) {
            return [];
        }

        extraTaxables.forEach(extraTaxable => {
            let unitPrice = 0;
            if (useBaseCurrency) {
                unitPrice = extraTaxable[this.KEY_ASSOCIATED_TAXABLE_BASE_UNIT_PRICE];
            } else {
                unitPrice = extraTaxable[this.KEY_ASSOCIATED_TAXABLE_UNIT_PRICE];
            }
            itemDataObjects.push({
                code: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_CODE],
                type: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_TYPE],
                quantity: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_QUANTITY],
                tax_class_key: {
                    type: 'id',
                    value: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_TAX_CLASS_ID]
                },
                unit_price: unitPrice,
                is_tax_included: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_PRICE_INCLUDES_TAX],
                associated_item_code: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_ASSOCIATION_ITEM_CODE],
            });
        });
        return itemDataObjects;
    }

    /**
     * Process everything other than product or shipping, save the result in quote
     *
     * @param total
     * @param itemsByType
     */
    processExtraTaxables(total, itemsByType) {
        let extraTaxableDetails = {};
        Object.keys(itemsByType).forEach(itemType => {
            if (itemType !== this.ITEM_TYPE_PRODUCT && itemType !== this.ITEM_TYPE_SHIPPING) {
                Object.keys(itemsByType[itemType]).forEach(itemCode => {
                    let itemTaxDetail = itemsByType[itemType][itemCode];
                    let taxDetails = itemTaxDetail[this.KEY_ITEM];
                    let baseTaxDetails = itemTaxDetail[this.KEY_BASE_ITEM];

                    let appliedTaxes = taxDetails.applied_taxes;
                    let baseAppliedTaxes = baseTaxDetails.applied_taxes;

                    let associatedItemCode = taxDetails.associated_item_code;

                    let appliedTaxesArray = this.convertAppliedTaxes(appliedTaxes, baseAppliedTaxes);

                    if(!extraTaxableDetails[itemType]) {
                        extraTaxableDetails[itemType] = {};
                    }
                    if(!extraTaxableDetails[itemType][associatedItemCode]) {
                        extraTaxableDetails[itemType][associatedItemCode] = [];
                    }
                    extraTaxableDetails[itemType][associatedItemCode].push({
                        [this.KEY_TAX_DETAILS_TYPE]: taxDetails.type,
                        [this.KEY_TAX_DETAILS_CODE]: taxDetails.code,
                        [this.KEY_TAX_DETAILS_PRICE_EXCL_TAX]: taxDetails.price,
                        [this.KEY_TAX_DETAILS_PRICE_INCL_TAX]: taxDetails.price_incl_tax,
                        [this.KEY_TAX_DETAILS_BASE_PRICE_EXCL_TAX]: baseTaxDetails.price,
                        [this.KEY_TAX_DETAILS_BASE_PRICE_INCL_TAX]: baseTaxDetails.price_incl_tax,
                        [this.KEY_TAX_DETAILS_ROW_TOTAL]: taxDetails.row_total,
                        [this.KEY_TAX_DETAILS_ROW_TOTAL_INCL_TAX]: taxDetails.row_total_incl_tax,
                        [this.KEY_TAX_DETAILS_BASE_ROW_TOTAL]: baseTaxDetails.row_total,
                        [this.KEY_TAX_DETAILS_BASE_ROW_TOTAL_INCL_TAX]: baseTaxDetails.row_total_incl_tax,
                        [this.KEY_TAX_DETAILS_TAX_PERCENT]: taxDetails.tax_percent,
                        [this.KEY_TAX_DETAILS_ROW_TAX]: taxDetails.row_tax,
                        [this.KEY_TAX_DETAILS_BASE_ROW_TAX]: baseTaxDetails.row_tax,
                        [this.KEY_TAX_DETAILS_APPLIED_TAXES]: appliedTaxesArray,
                    });

                    this._addAmount(taxDetails.row_tax, 'tax');
                    this._addBaseAmount(baseTaxDetails.row_tax, 'tax');
                });
            }
        });
        total.extra_taxable_details = extraTaxableDetails;
        return this;
    }
}

/** @type QuoteTotalTaxService */
let quoteTotalTaxService = ServiceFactory.get(QuoteTotalTaxService);

export default quoteTotalTaxService;