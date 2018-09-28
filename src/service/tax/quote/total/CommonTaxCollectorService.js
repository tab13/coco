import {AbstractTotalService} from "../../../checkout/quote/total/AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import QuoteItemService from "../../../checkout/quote/ItemService";
import QuoteService from "../../../checkout/QuoteService";
import TaxHelper from "../../../../helper/TaxHelper";
import NumberHelper from "../../../../helper/NumberHelper";

export class QuoteTotalCommonTaxCollectorService extends AbstractTotalService {
    static className = 'QuoteTotalCommonTaxCollectorService';
    /**#@+
     * Constants defined for type of items
     */
    ITEM_TYPE_SHIPPING = 'shipping';
    ITEM_TYPE_PRODUCT = 'product';

    /**
     * Constant for shipping item code
     */
    ITEM_CODE_SHIPPING = 'shipping';

    /**#@+
     * Constants for array keys
     */
    KEY_ITEM = 'item';
    KEY_BASE_ITEM = 'base_item';

    /**#@+
     * Constants for fields in associated taxables array
     */
    KEY_ASSOCIATED_TAXABLE_TYPE = 'type';
    KEY_ASSOCIATED_TAXABLE_CODE = 'code';
    KEY_ASSOCIATED_TAXABLE_BASE_UNIT_PRICE = 'base_unit_price';
    KEY_ASSOCIATED_TAXABLE_UNIT_PRICE = 'unit_price';
    KEY_ASSOCIATED_TAXABLE_QUANTITY = 'quantity';
    KEY_ASSOCIATED_TAXABLE_TAX_CLASS_ID = 'tax_class_id';

    /**
     * When an extra taxable item is associated with quote and not with an item, this value
     * is used as associated item code
     */
    ASSOCIATION_ITEM_CODE_FOR_QUOTE = 'quote';

    /**#@+
     * Constants for fields in tax details for associated taxable items
     */
    KEY_TAX_DETAILS_TYPE = 'type';
    KEY_TAX_DETAILS_CODE = 'code';
    KEY_TAX_DETAILS_PRICE_EXCL_TAX = 'price_excl_tax';
    KEY_TAX_DETAILS_BASE_PRICE_EXCL_TAX = 'base_price_excl_tax';
    KEY_TAX_DETAILS_PRICE_INCL_TAX = 'price_incl_tax';
    KEY_TAX_DETAILS_BASE_PRICE_INCL_TAX = 'base_price_incl_tax';
    KEY_TAX_DETAILS_ROW_TOTAL = 'row_total_excl_tax';
    KEY_TAX_DETAILS_BASE_ROW_TOTAL = 'base_row_total_excl_tax';
    KEY_TAX_DETAILS_ROW_TOTAL_INCL_TAX = 'row_total_incl_tax';
    KEY_TAX_DETAILS_BASE_ROW_TOTAL_INCL_TAX = 'base_row_total_incl_tax';
    KEY_TAX_DETAILS_TAX_PERCENT = 'tax_percent';
    KEY_TAX_DETAILS_ROW_TAX = 'row_tax';
    KEY_TAX_DETAILS_BASE_ROW_TAX = 'base_row_tax';
    KEY_TAX_DETAILS_APPLIED_TAXES = 'applied_taxes';

    counter = 0;

    /**
     * Map quote items
     *
     * @param quote
     * @param address
     * @param priceIncludesTax
     * @param useBaseCurrency
     * @returns {Array}
     */
    mapItems(quote, address, priceIncludesTax, useBaseCurrency) {
        if (!quote.items || !quote.items.length) {
            return [];
        }
        let itemDataObjects = [];
        quote.items.map(item => {
            if (item.parent_item_id) {
                return false;
            }
            if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
                let parentItemDataObject = this.mapItem(item, priceIncludesTax, useBaseCurrency);
                itemDataObjects.push(parentItemDataObject);
                this.getChildrenItems(quote, item).map(children => {
                    let childItemDataObject = this.mapItem(
                        children, priceIncludesTax, useBaseCurrency, parentItemDataObject.code
                    );
                    itemDataObjects.push(childItemDataObject);
                    let extraTaxableItems = this.mapItemExtraTaxables(item, priceIncludesTax, useBaseCurrency);
                    itemDataObjects = [...itemDataObjects, ...extraTaxableItems];
                    return children;
                })
            } else {
                let itemDataObject = this.mapItem(item, priceIncludesTax, useBaseCurrency);
                itemDataObjects.push(itemDataObject);
                let extraTaxableItems = this.mapItemExtraTaxables(item, priceIncludesTax, useBaseCurrency);
                itemDataObjects = [...itemDataObjects, ...extraTaxableItems];
            }
            return item;
        });
        return itemDataObjects;
    }

    /**
     * Map item price
     *
     * @param item
     * @param priceIncludesTax
     * @param useBaseCurrency
     * @param parentCode
     * @returns {{code: string|*, quantity, tax_class_key: {type: string, value: *}, is_tax_included: *, type: string}}
     */
    mapItem(item, priceIncludesTax, useBaseCurrency, parentCode) {
        if (!item.tax_calculation_item_id) {
            item.tax_calculation_item_id = 'sequence-' + this.getNextIncrement();
        }
        let itemDataObject = {
            code: item.tax_calculation_item_id,
            quantity: item.qty,
            tax_class_key: {
                type: 'id',
                value: item.product.tax_class_id
            },
            is_tax_included: priceIncludesTax,
            type: this.ITEM_TYPE_PRODUCT
        };
        if (useBaseCurrency) {
            if (!item.base_tax_calculation_price) {
                item.base_tax_calculation_price = QuoteItemService.getBaseCalculationPriceOriginal(item);
            }
            itemDataObject.unit_price = item.base_tax_calculation_price;
            itemDataObject.discount_amount = item.base_discount_amount;
            itemDataObject.original_price = item.base_original_price;
        } else {
            if (!item.tax_calculation_price) {
                item.tax_calculation_price = QuoteItemService.getCalculationPriceOriginal(item);
            }
            itemDataObject.unit_price = item.tax_calculation_price;
            itemDataObject.discount_amount = item.discount_amount;
            itemDataObject.original_price = item.original_price;
        }
        itemDataObject.parent_code = parentCode;
        return itemDataObject;
    }

    /**
     * Map item extra tax
     *
     * @param item
     * @param priceIncludesTax
     * @param useBaseCurrency
     * @returns {Array}
     */
    mapItemExtraTaxables(item, priceIncludesTax, useBaseCurrency) {
        let itemDataObjects = [];
        let extraTaxables = item.associated_taxables;
        if (!extraTaxables) {
            return [];
        }
        extraTaxables.map(extraTaxable => {
            let extraTaxableIncludesTax = typeof extraTaxable.price_includes_tax !== 'undefined' ?
                extraTaxable.price_includes_tax : priceIncludesTax;
            let unitPrice = 0;
            if (useBaseCurrency) {
                unitPrice = extraTaxable[this.KEY_ASSOCIATED_TAXABLE_BASE_UNIT_PRICE]
            } else {
                unitPrice = extraTaxable[this.KEY_ASSOCIATED_TAXABLE_UNIT_PRICE]
            }

            let itemDataObject = {
                code: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_CODE],
                type: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_TYPE],
                quantity: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_QUANTITY],
                tax_class_key: {
                    type: 'id',
                    value: extraTaxable[this.KEY_ASSOCIATED_TAXABLE_TAX_CLASS_ID]
                },
                unit_price: unitPrice,
                is_tax_included: extraTaxableIncludesTax,
                associated_item_code: item.tax_calculation_item_id
            };
            itemDataObjects.push(itemDataObject);
            return extraTaxable;
        });
        return itemDataObjects;
    }

    /**
     * Populate QuoteDetails object from quote address object
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} itemDataObjects
     */
    prepareQuoteDetails(quote, address, itemDataObjects) {
        let items = quote.items;
        if (!items || !items.length) {
            return {};
        }

        let quoteDetails = {};
        this.populateAddressData(quoteDetails, quote, address);
        /* Set customer tax class */
        quoteDetails.customer_tax_class_key = {
            type: 'id',
            value: quote.customer_tax_class_id
        };
        quoteDetails.items = itemDataObjects;
        quoteDetails.customer_id = quote.customer_id;
        quoteDetails.customer = quote.customer;
        return quoteDetails;
    }


    /**
     * Populate the quote details with address information
     *
     * @param {object} quoteDetails
     * @param {object} quote
     * @param {object} address
     * @return {object}
     * */
    populateAddressData(quoteDetails, quote, address) {
        quoteDetails.billing_address = this.mapAddress(QuoteService.getBillingAddress(quote));
        quoteDetails.shipping_address = this.mapAddress(address);
        return quoteDetails;
    }

    /**
     * @param quote
     * @param address
     * @param total
     * @param useBaseCurrency
     * @return {*}
     */
    getShippingDataObject(quote, address, total, useBaseCurrency) {
        if (typeof total.shipping_tax_calculation_amount === 'undefined'
            || total.shipping_tax_calculation_amount === null) {
            total.shipping_tax_calculation_amount = total.shipping_amount;
            total.base_shipping_tax_calculation_amount = total.base_shipping_amount;
        }
        if (typeof total.shipping_tax_calculation_amount !== 'undefined'
            || total.shipping_tax_calculation_amount !== null) {
            let itemDataObject = {
                type: 'shipping',
                code: 'shipping',
                quantity: 1
            };
            if (useBaseCurrency) {
                itemDataObject.unit_price = total.base_shipping_tax_calculation_amount;
            } else {
                itemDataObject.unit_price = total.shipping_tax_calculation_amount;
            }
            if (total.shipping_discount_amount) {
                if (useBaseCurrency) {
                    itemDataObject.discount_amount = total.base_shipping_discount_amount;
                } else {
                    itemDataObject.discount_amount = total.shipping_discount_amount;
                }
            }
            itemDataObject.tax_class_key = {
                type: 'id',
                value: TaxHelper.getShippingTaxClass()
            };
            itemDataObject.is_tax_included = TaxHelper.shippingPriceIncludesTax();
            return itemDataObject;
        }
        return null;
    }

    /**
     * Map quote address to customer address
     *
     * @param address
     * @return {{country_id: *, region: {region_id: *}, postcode: *, city: *|string, street: *}}
     */
    mapAddress(address) {
        let customerAddress = {
            country_id: address.country_id,
            region: {
                region_id: address.region_id
            },
            postcode: address.postcode,
            city: address.city,
            street: address.street
        };
        return customerAddress;
    }

    /**
     * Organize tax details by type and by item code
     *
     * @param {object} taxDetails
     * @param {object} baseTaxDetails
     * @return {{}}
     */
    organizeItemTaxDetailsByType(taxDetails, baseTaxDetails) {
        let keyedItems = {};
        Object.keys(taxDetails.items).forEach(key => {
            let item = taxDetails.items[key];
            keyedItems[item.code] = item;
        });
        let baseKeyedItems = {};
        Object.keys(baseTaxDetails.items).forEach(key => {
            let item = baseTaxDetails.items[key];
            baseKeyedItems[item.code] = item;
        });
        let itemsByType = {};
        Object.keys(keyedItems).map(code => {
            let baseItem = baseKeyedItems[code];
            let itemType = keyedItems[code].type;
            if (!itemsByType[itemType]) {
                itemsByType[itemType] = {};
            }
            itemsByType[itemType][code] = {[this.KEY_ITEM]: keyedItems[code], [this.KEY_BASE_ITEM]: baseItem};
            return code;
        });
        return itemsByType;
    }

    /**
     * Process product items in the quote.
     * Set the following aggregated values in the quote object:
     * subtotal, subtotalInclTax, tax, discount_tax_compensation,
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} itemTaxDetails
     * @param {object} total
     */
    processProductItems(quote, address, itemTaxDetails, total) {
        let keyedAddressItems = {};
        quote.items.map(item => {
            keyedAddressItems[item.tax_calculation_item_id] = item;
            return item;
        });
        let subtotal = 0,
            baseSubtotal = 0,
            discountTaxCompensation = 0,
            baseDiscountTaxCompensation = 0,
            tax = 0,
            baseTax = 0,
            subtotalInclTax = 0,
            baseSubtotalInclTax = 0;

        Object.keys(itemTaxDetails).map(code => {
            let itemTaxDetail = itemTaxDetails[code];
            let taxDetail = itemTaxDetail[this.KEY_ITEM];
            let baseTaxDetail = itemTaxDetail[this.KEY_BASE_ITEM];
            let quoteItem = keyedAddressItems[code];

            this.updateItemTaxInfo(quoteItem, taxDetail, baseTaxDetail);

            if (quoteItem.has_children && QuoteItemService.isChildrenCalculated(quoteItem, quote)) {
                return code;
            }

            subtotal += taxDetail.row_total;
            baseSubtotal += baseTaxDetail.row_total;
            discountTaxCompensation += taxDetail.discount_tax_compensation_amount;
            baseDiscountTaxCompensation += baseTaxDetail.discount_tax_compensation_amount;
            tax += taxDetail.row_tax;
            baseTax += baseTaxDetail.row_tax;
            subtotalInclTax += taxDetail.row_total_incl_tax;
            baseSubtotalInclTax += baseTaxDetail.row_total_incl_tax;

            return code;
        });

        this._setAmount(subtotal, 'subtotal');
        this._setBaseAmount(baseSubtotal, 'subtotal');
        this._setAmount(tax, 'tax');
        this._setBaseAmount(baseTax, 'tax');
        this._setAmount(discountTaxCompensation, 'discount_tax_compensation');
        this._setBaseAmount(baseDiscountTaxCompensation, 'discount_tax_compensation');

        total.subtotal_incl_tax = subtotalInclTax;
        total.base_subtotal_total_incl_tax = baseSubtotalInclTax;
        total.base_subtotal_incl_tax = baseSubtotalInclTax;
        address.base_subtotal_incl_tax = baseSubtotalInclTax;
        return this;
    }

    /**
     * Process applied taxes for items and quote
     *
     * @param total
     * @param quote
     * @param address
     * @param itemsByType
     */
    processAppliedTaxes(total, quote, address, itemsByType) {
        total.applied_taxes = [];
        let allAppliedTaxesArray = {};
        let keyedAddressItems = {};

        quote.items.forEach(item => {
            keyedAddressItems[item.tax_calculation_item_id] = item;
        });

        Object.keys(itemsByType).forEach(itemType => {
            let items = itemsByType[itemType];
            Object.keys(items).forEach(itemTaxCalculationId => {
                let itemTaxDetails = items[itemTaxCalculationId];
                let taxDetails = itemTaxDetails[this.KEY_ITEM];
                let baseTaxDetails = itemTaxDetails[this.KEY_BASE_ITEM];

                let appliedTaxes = taxDetails.applied_taxes;
                let baseAppliedTaxes = baseTaxDetails.applied_taxes;

                let itemType = taxDetails.type;
                let itemId = null;
                let associatedItemId = null;
                if (itemType === this.ITEM_TYPE_PRODUCT) {
                    /*Use item id instead of tax calculation id*/
                    itemId = keyedAddressItems[itemTaxCalculationId].item_id;
                } else {
                    if (taxDetails.associated_item_code
                        && taxDetails.associated_item_code !== this.ASSOCIATION_ITEM_CODE_FOR_QUOTE) {
                        /*This item is associated with a product item*/
                        associatedItemId = keyedAddressItems[taxDetails.associated_item_code].id;
                    } else {
                        /*This item is associated with an order, e.g., shipping, etc.*/
                        itemId = null;
                    }
                }

                let extraInfo = {
                    item_id: itemId,
                    item_type: itemType,
                    associated_item_id: associatedItemId,
                };

                let appliedTaxesArray = this.convertAppliedTaxes(appliedTaxes, baseAppliedTaxes, extraInfo);
                if (itemType === this.ITEM_TYPE_PRODUCT) {
                    let quoteItem = keyedAddressItems[itemTaxCalculationId];
                    quoteItem.applied_taxes = appliedTaxesArray;
                }
                allAppliedTaxesArray[itemTaxCalculationId] = appliedTaxesArray;

                appliedTaxesArray.forEach(appliedTaxArray => {
                    this._saveAppliedTaxes(
                        total,
                        [appliedTaxArray],
                        appliedTaxArray.amount,
                        appliedTaxArray.base_amount,
                        appliedTaxArray.percent
                    );
                });
            });
        });
        total.items_applied_taxes = allAppliedTaxesArray;

        return this;
    }

    /**
     * Update item tax info
     *
     * @param quoteItem
     * @param itemTaxDetails
     * @param baseItemTaxDetails
     * @returns {QuoteTotalCommonTaxCollectorService}
     */
    updateItemTaxInfo(quoteItem, itemTaxDetails, baseItemTaxDetails) {
        quoteItem.price = baseItemTaxDetails.price;
        quoteItem.converted_price = itemTaxDetails.price;
        quoteItem.price_incl_tax = itemTaxDetails.price_incl_tax;
        quoteItem.row_total = itemTaxDetails.row_total;
        quoteItem.row_total_incl_tax = itemTaxDetails.row_total_incl_tax;
        quoteItem.tax_amount = itemTaxDetails.row_tax;
        quoteItem.tax_percent = itemTaxDetails.tax_percent;
        quoteItem.discount_tax_compensation_amount = itemTaxDetails.discount_tax_compensation_amount;
        quoteItem.pos_original_price_excl_tax = itemTaxDetails.original_price_excl_tax;
        quoteItem.pos_original_price_incl_tax = itemTaxDetails.original_price_incl_tax;

        quoteItem.base_price = baseItemTaxDetails.price;
        quoteItem.base_price_incl_tax = baseItemTaxDetails.price_incl_tax;
        quoteItem.base_row_total = baseItemTaxDetails.row_total;
        quoteItem.base_row_total_incl_tax = baseItemTaxDetails.row_total_incl_tax;
        quoteItem.base_tax_amount = baseItemTaxDetails.row_tax;
        quoteItem.tax_percent = baseItemTaxDetails.tax_percent;
        quoteItem.base_discount_tax_compensation_amount = baseItemTaxDetails.discount_tax_compensation_amount;
        quoteItem.pos_base_original_price_excl_tax = baseItemTaxDetails.original_price_excl_tax;
        quoteItem.pos_base_original_price_incl_tax = baseItemTaxDetails.original_price_incl_tax;


        if (TaxHelper.discountTax()) {
            quoteItem.discount_calculation_price = itemTaxDetails.price_incl_tax;
            quoteItem.base_discount_calculation_price = baseItemTaxDetails.price_incl_tax;
        } else {
            quoteItem.discount_calculation_price = itemTaxDetails.price;
            quoteItem.base_discount_calculation_price = baseItemTaxDetails.price;
        }

        return this;
    }

    /**
     * Update tax related fields for shipping
     *
     * @param quote
     * @param address
     * @param total
     * @param shippingTaxDetails
     * @param baseShippingTaxDetails
     */
    processShippingTaxInfo(quote, address, total, shippingTaxDetails, baseShippingTaxDetails) {
        this._setAmount(shippingTaxDetails.row_total, 'shipping');
        this._setBaseAmount(baseShippingTaxDetails.row_total, 'shipping');
        this._setAmount(shippingTaxDetails.discount_tax_compensation_amount, 'shipping_discount_tax_compensation');
        this._setBaseAmount(
            baseShippingTaxDetails.discount_tax_compensation_amount, 'shipping_discount_tax_compensation'
        );
        total.shipping_incl_tax = shippingTaxDetails.row_total_incl_tax;
        total.base_shipping_incl_tax = baseShippingTaxDetails.row_total_incl_tax;
        total.shipping_tax_amount = shippingTaxDetails.row_tax;
        total.base_shipping_tax_amount = baseShippingTaxDetails.row_tax;

        /*Add the shipping tax to total tax amount*/
        this._addAmount(shippingTaxDetails.row_tax, 'tax');
        this._addBaseAmount(baseShippingTaxDetails.row_tax, 'tax');

        if (TaxHelper.discountTax()) {
            total.shipping_amount_for_discount = shippingTaxDetails.row_total_incl_tax;
            total.base_shipping_amount_for_discount = baseShippingTaxDetails.row_total_incl_tax;
        }
        return this;
    }

    /**
     * Convert appliedTax data object from tax calculation service to internal array format
     *
     * @param appliedTaxes
     * @param baseAppliedTaxes
     * @param extraInfo
     * @return {Array}
     */
    convertAppliedTaxes(appliedTaxes, baseAppliedTaxes, extraInfo = {}) {
        let appliedTaxesArray = [];
        if (!appliedTaxes || !baseAppliedTaxes) {
            return appliedTaxesArray;
        }

        Object.keys(appliedTaxes).forEach(taxId => {
            let appliedTax = appliedTaxes[taxId];
            let baseAppliedTax = baseAppliedTaxes[taxId];
            let rateDataObjects = appliedTax.rates;
            let rates = [];

            Object.keys(rateDataObjects).forEach(code => {
                let rateDataObject = rateDataObjects[code];
                rates.push({
                    percent: rateDataObject.percent,
                    code: rateDataObject.code,
                    title: rateDataObject.title
                });
            });
            let appliedTaxArray = {
                amount: appliedTax.amount,
                base_amount: baseAppliedTax.amount,
                percent: appliedTax.percent,
                id: appliedTax.tax_rate_key,
                rates: rates,
            };
            if (extraInfo && Object.keys(extraInfo).length) {
                appliedTaxArray = {...appliedTaxArray, ...extraInfo};
            }
            appliedTaxesArray.push(appliedTaxArray);
        });
        return appliedTaxesArray;
    }

    /**
     * Collect applied tax rates information on address level
     *
     * @param total
     * @param applied
     * @param amount
     * @param baseAmount
     * @param rate
     * @private
     */
    _saveAppliedTaxes(total, applied, amount, baseAmount, rate) {
        let previouslyAppliedTaxes = total.applied_taxes;
        let process = previouslyAppliedTaxes.length;

        applied.forEach(row => {
            if (row.percent === 0) {
                return false;
            }
            if (typeof previouslyAppliedTaxes[row.id] === 'undefined') {
                row.process = process;
                row.amount = 0;
                row.base_amount = 0;
                previouslyAppliedTaxes[row.id] = row;
            }

            let appliedAmount = 0;
            let baseAppliedAmount = 0;

            if (row.percent !== null) {
                row.percent = row.percent ? row.percent : 1;
                rate = rate ? rate : 1;

                appliedAmount = amount / rate * row.percent;
                baseAppliedAmount = baseAmount / rate * row.percent;
            } else {
                appliedAmount = 0;
                baseAppliedAmount = 0;
                Object.keys(row.rates).forEach(key => {
                    let rate = row.rates[key];
                    appliedAmount = NumberHelper.addNumber(appliedAmount, rate.amount);
                    baseAppliedAmount = NumberHelper.addNumber(baseAppliedAmount, rate.base_amount);
                });
            }
            if (appliedAmount || previouslyAppliedTaxes[row.id]['amount']) {
                if (!previouslyAppliedTaxes[row.id]) {
                    previouslyAppliedTaxes[row.id] = {};
                }
                previouslyAppliedTaxes[row.id]['amount'] = NumberHelper.addNumber(
                    previouslyAppliedTaxes[row.id]['amount'], appliedAmount
                );
                previouslyAppliedTaxes[row.id]['base_amount'] = NumberHelper.addNumber(
                    previouslyAppliedTaxes[row.id]['base_amount'], baseAppliedAmount
                );
            } else {
                delete previouslyAppliedTaxes[row.id];
            }
        });
        total.applied_taxes = previouslyAppliedTaxes;
    }

    /**
     * Determine whether to include item in tax calculation
     *
     * @return {boolean}
     */
    includeExtraTax() {
        return false;
    }


    /**
     * get next increment
     *
     * @returns {number}
     */
    getNextIncrement() {
        return ++this.counter;
    }
}

/** @type QuoteTotalCommonTaxCollectorService */
let quoteTotalCommonTaxCollectorService = ServiceFactory.get(QuoteTotalCommonTaxCollectorService);

export default quoteTotalCommonTaxCollectorService;