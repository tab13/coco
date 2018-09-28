import {AbstractTotalService} from "../../../checkout/quote/total/AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import QuoteAddressService from "../../../checkout/quote/AddressService";
import WeeeDataService from "../../WeeeDataService";
import QuoteService from "../../../checkout/QuoteService";
import QuoteItemService from "../../../checkout/quote/ItemService";
import WeeeTaxService from "../../WeeeTaxService";
import CommonTaxCollectorService from "../../../tax/quote/total/CommonTaxCollectorService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import NumberHelper from "../../../../helper/NumberHelper";
import WeeeHelper from "../../../../helper/WeeeHelper";

export class QuoteTotalWeeeService extends AbstractTotalService {
    static className = 'QuoteTotalWeeeService';

    code = 'weee';

    /**
     * Constant for weee item code prefix
     */
    ITEM_CODE_WEEE_PREFIX = 'weee';
    /**
     * Constant for weee item type
     */
    ITEM_TYPE = 'weee';

    counter = 0;

    /**
     * Array to keep track of weee taxable item code to quote item
     *
     * @type {Array}
     */
    weeeCodeToItemMap;

    /**
     * Accumulates totals for Weee excluding tax
     *
     * @type {number}
     */
    weeeTotalExclTax;

    /**
     * Accumulates totals for Weee base excluding tax
     *
     * @type {number}
     */
    weeeBaseTotalExclTax;

    /**
     * Run collect of parent total
     *
     * @param quote
     * @param address
     * @param total
     */
    collectParent(quote, address, total) {
        super.collect(quote, address, total);
    }

    /**
     * Collect address weee
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {QuoteTotalSubtotalService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        if (!WeeeHelper.isFixedTaxEnabled()) {
            return this;
        }
        let virtualAmount = 0,
            baseVirtualAmount = 0;
        address.total_qty = 0;
        let isVirtual = this.isVirtual(quote);
        if ((isVirtual && QuoteAddressService.isBillingAddress(address)) ||
            (!isVirtual && QuoteAddressService.isShippingAddress(address))
        ) {
            this.weeeCodeToItemMap = {};
            this.weeeTotalExclTax = 0;
            this.weeeBaseTotalExclTax = 0;
            quote.items.forEach(item => {
                if (item.parent_item_id) {
                    return false;
                }
                this.resetItemData(item);
                if (item.has_children && QuoteItemService.isChildrenCalculated(item, quote)) {
                    QuoteAddressService.getChildrenItems(quote, item).forEach(child => {
                        this.resetItemData(child);
                        this.process(quote, address, total, child);
                    });
                    this.recalculateParent(item, quote);
                } else {
                    this.process(quote, address, total, item);
                }
            });
            total.weee_code_to_item_map = this.weeeCodeToItemMap;
            total.weee_total_excl_tax = this.weeeTotalExclTax;
            total.weee_base_total_excl_tax = this.weeeBaseTotalExclTax;
        }
        total.virtual_amount = virtualAmount;
        total.base_virtual_amount = baseVirtualAmount;
        return this;
    }

    /**
     * Process wee
     *
     * @param quote
     * @param address
     * @param total
     * @param item
     */
    process(quote, address, total, item) {
        let attributes = WeeeTaxService.getProductWeeeAttributes(
            quote,
            item.product,
            address,
            QuoteService.getBillingAddress(quote)
        );

        let productTaxes = [];

        let totalValueInclTax = 0,
            baseTotalValueInclTax = 0,
            totalRowValueInclTax = 0,
            baseTotalRowValueInclTax = 0,
            totalValueExclTax = 0,
            baseTotalValueExclTax = 0,
            totalRowValueExclTax = 0,
            baseTotalRowValueExclTax = 0;

        let associatedTaxables = item.associated_taxables;
        if (!associatedTaxables) {
            associatedTaxables = [];
        } else {
            associatedTaxables.forEach((taxable, index) => {
                if (taxable[CommonTaxCollectorService.KEY_ASSOCIATED_TAXABLE_TYPE] === this.ITEM_TYPE) {
                    associatedTaxables.splice(index, 1);
                }
            });
        }
        attributes.forEach(attribute => {
            let title = attribute.name;

            let baseValueExclTax = attribute.amount;
            let baseValueInclTax = attribute.amount;
            let valueExclTax = CurrencyHelper.roundToFloat(CurrencyHelper.convert(baseValueExclTax));
            let valueInclTax = valueExclTax;

            let totalQty = QuoteItemService.getTotalQty(item, quote);

            let rowValueInclTax = CurrencyHelper.roundToFloat(valueInclTax * totalQty);
            let rowValueExclTax = rowValueInclTax;
            let baseRowValueInclTax = CurrencyHelper.roundToFloat(baseValueInclTax * totalQty);
            let baseRowValueExclTax = baseRowValueInclTax;

            totalValueInclTax = NumberHelper.addNumber(totalValueInclTax, valueInclTax);
            baseTotalValueInclTax = NumberHelper.addNumber(baseTotalValueInclTax, baseValueInclTax);
            totalRowValueInclTax = NumberHelper.addNumber(totalRowValueInclTax, rowValueInclTax);
            baseTotalRowValueInclTax = NumberHelper.addNumber(baseTotalRowValueInclTax, baseRowValueInclTax);

            totalValueExclTax = NumberHelper.addNumber(totalValueExclTax, valueExclTax);
            baseTotalValueExclTax = NumberHelper.addNumber(baseTotalValueExclTax, baseValueExclTax);
            totalRowValueExclTax = NumberHelper.addNumber(totalRowValueExclTax, rowValueExclTax);
            baseTotalRowValueExclTax = NumberHelper.addNumber(baseTotalRowValueExclTax, baseRowValueExclTax);

            productTaxes.push({
                title: title,
                base_amount: baseValueExclTax,
                amount: valueExclTax,
                row_amount: rowValueExclTax,
                base_row_amount: baseRowValueExclTax,
                base_amount_incl_tax: baseValueInclTax,
                amount_incl_tax: valueInclTax,
                row_amount_incl_tax: rowValueInclTax,
                base_row_amount_incl_tax: baseRowValueInclTax
            });

            if (WeeeHelper.isTaxable()) {
                let weeeItemCode = this.ITEM_CODE_WEEE_PREFIX + this.getNextIncrement() + '-' + title;

                associatedTaxables.push({
                    [CommonTaxCollectorService.KEY_ASSOCIATED_TAXABLE_TYPE]: this.ITEM_TYPE,
                    [CommonTaxCollectorService.KEY_ASSOCIATED_TAXABLE_CODE]: weeeItemCode,
                    [CommonTaxCollectorService.KEY_ASSOCIATED_TAXABLE_UNIT_PRICE]: valueExclTax,
                    [CommonTaxCollectorService.KEY_ASSOCIATED_TAXABLE_BASE_UNIT_PRICE]: baseValueExclTax,
                    [CommonTaxCollectorService.KEY_ASSOCIATED_TAXABLE_QUANTITY]: totalQty,
                    [CommonTaxCollectorService.KEY_ASSOCIATED_TAXABLE_TAX_CLASS_ID]: item.product.tax_class_id,
                });
                this.weeeCodeToItemMap[weeeItemCode] = item;
            }
        });
        item.associated_taxables = associatedTaxables;

        item.weee_tax_applied_amount = totalValueExclTax;
        item.base_weee_tax_applied_amount = baseTotalValueExclTax;
        item.weee_tax_applied_row_amount = totalRowValueExclTax;
        item.base_weee_tax_applied_row_amnt = baseTotalRowValueExclTax;
        item.weee_tax_applied_amount_incl_tax = totalValueInclTax;
        item.base_weee_tax_applied_amount_incl_tax = baseTotalValueInclTax;
        item.weee_tax_applied_row_amount_incl_tax = totalValueInclTax;
        item.base_weee_tax_applied_row_amnt_incl_tax = baseTotalRowValueInclTax;

        this.processTotalAmount(
            total,
            totalRowValueExclTax,
            baseTotalRowValueExclTax,
            totalRowValueInclTax,
            baseTotalRowValueInclTax
        );

        WeeeDataService.setApplied(item, [...WeeeDataService.getApplied(item, quote), ...productTaxes]);
    }

    /**
     * Process row amount based on FPT total amount configuration setting
     *
     * @param total
     * @param rowValueExclTax
     * @param baseRowValueExclTax
     * @param rowValueInclTax
     * @param baseRowValueInclTax
     * @return {QuoteTotalWeeeService}
     */
    processTotalAmount(total, rowValueExclTax, baseRowValueExclTax, rowValueInclTax, baseRowValueInclTax) {
        if (!WeeeHelper.isTaxable()) {
            this.weeeTotalExclTax = CurrencyHelper.roundToFloat(
                NumberHelper.addNumber(this.weeeTotalExclTax || 0, rowValueExclTax)
            );
            this.weeeBaseTotalExclTax = CurrencyHelper.roundToFloat(
                NumberHelper.addNumber(this.weeeBaseTotalExclTax || 0, baseRowValueExclTax)
            );
        }
        total.subtotal_incl_tax = NumberHelper.addNumber(
            total.subtotal_incl_tax, CurrencyHelper.roundToFloat(rowValueInclTax)
        );
        total.base_subtotal_incl_tax = NumberHelper.addNumber(
            total.base_subtotal_incl_tax, CurrencyHelper.roundToFloat(baseRowValueInclTax)
        );
        return this;
    }

    /**
     * Recalculate parent item amounts based on children results
     *
     * @param item
     * @param quote
     */
    recalculateParent(item, quote) {
        let associatedTaxables = [];
        QuoteItemService.getChildrenItems(quote, item).forEach(child => {
            associatedTaxables = [...associatedTaxables, ...child.associated_taxables];
        });
        item.associated_taxables = associatedTaxables;
    }

    /**
     * Reset information about Tax and Wee on FPT for shopping cart item
     *
     * @type {object} item
     */
    resetItemData(item) {
        WeeeDataService.setApplied(item, []);
        item.associated_taxables = [];

        item.base_weee_tax_disposition = 0;
        item.weee_tax_disposition = 0;

        item.base_weee_tax_row_disposition = 0;
        item.weee_tax_row_disposition = 0;

        item.base_weee_tax_applied_amount = 0;
        item.base_weee_tax_applied_row_amnt = 0;

        item.weee_tax_applied_amount = 0;
        item.weee_tax_applied_row_amount = 0;
    }

    /**
     * Increment and return counter. This function is intended to be used to generate temporary
     * id for an item.
     *
     * @return {number}
     */
    getNextIncrement() {
        return ++this.counter;
    }
}

/** @type QuoteTotalWeeeService */
let quoteTotalWeeeService = ServiceFactory.get(QuoteTotalWeeeService);

export default quoteTotalWeeeService;