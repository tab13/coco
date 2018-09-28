import {QuoteTotalWeeeService} from "./WeeeService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import QuoteAddressService from "../../../checkout/quote/AddressService";
import WeeeDataService from "../../WeeeDataService";
import CommonTaxCollector from "../../../tax/quote/total/CommonTaxCollectorService";
import NumberHelper from "../../../../helper/NumberHelper";
import WeeeHelper from "../../../../helper/WeeeHelper";

export class QuoteTotalWeeeTaxService extends QuoteTotalWeeeService {
    static className = 'QuoteTotalWeeeTaxService';

    code = 'weee_tax';

    /**
     * Collect address weee
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {QuoteTotalSubtotalService}
     */
    collect(quote, address, total) {
        super.collectParent(quote, address, total);
        let isVirtual = this.isVirtual(quote);
        if ((isVirtual && QuoteAddressService.isBillingAddress(address)) ||
            (!isVirtual && QuoteAddressService.isShippingAddress(address))
        ) {
            if (!WeeeHelper.isTaxable()) {
                let weeeTotal = total.weee_total_excl_tax;
                let weeeBaseTotal = total.weee_base_total_excl_tax;

                /*Add to appropriate 'subtotal' or 'weee' accumulators*/
                this.processTotalAmount(total, weeeTotal, weeeBaseTotal, weeeTotal, weeeBaseTotal);
                return this;
            }
            let extraTaxableDetails = total.extra_taxable_details;

            if (typeof extraTaxableDetails[this.ITEM_TYPE] !== 'undefined') {
                /*Get mapping from weeeCode to item*/
                let weeeCodeToItemMap = total.weee_code_to_item_map;

                /*Create mapping from item to weeeCode*/
                let itemToWeeeCodeMap = this.createItemToWeeeCodeMapping(weeeCodeToItemMap);

                /*Create mapping from weeeCode to weeeTaxDetails*/
                let weeeCodeToWeeeTaxDetailsMap = {};

                Object.keys(extraTaxableDetails[this.ITEM_TYPE]).forEach(key => {
                    let weeeAttributesTaxDetails = extraTaxableDetails[this.ITEM_TYPE][key];
                    weeeAttributesTaxDetails.forEach(weeeTaxDetails => {
                        let weeeCode = weeeTaxDetails.code;
                        weeeCodeToWeeeTaxDetailsMap[weeeCode] = weeeTaxDetails;
                    })
                });

                Object.keys(itemToWeeeCodeMap).forEach(key => {
                    let mapping = itemToWeeeCodeMap[key];
                    let item = mapping['item'];
                    WeeeDataService.setApplied(item, []);
                    let productTaxes = [];

                    let totalValueInclTax = 0,
                        baseTotalValueInclTax = 0,
                        totalRowValueInclTax = 0,
                        baseTotalRowValueInclTax = 0,
                        totalValueExclTax = 0,
                        baseTotalValueExclTax = 0,
                        totalRowValueExclTax = 0,
                        baseTotalRowValueExclTax = 0;

                    mapping.weeeCodes.forEach(weeeCode => {
                        let weeeTaxDetails = weeeCodeToWeeeTaxDetailsMap[weeeCode];
                        if (!weeeTaxDetails) {
                            return false;
                        }
                        let attributeCode = weeeCode.split('-')[1];

                        let valueExclTax = weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_PRICE_EXCL_TAX],
                            baseValueExclTax = weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_BASE_PRICE_EXCL_TAX],
                            valueInclTax = weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_PRICE_INCL_TAX],
                            baseValueInclTax = weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_BASE_PRICE_INCL_TAX],
                            rowValueExclTax = weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_ROW_TOTAL],
                            baseRowValueExclTax = weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_BASE_ROW_TOTAL],
                            rowValueInclTax = weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_ROW_TOTAL_INCL_TAX],
                            baseRowValueInclTax =
                                weeeTaxDetails[CommonTaxCollector.KEY_TAX_DETAILS_BASE_ROW_TOTAL_INCL_TAX];

                        totalValueInclTax = NumberHelper.addNumber(totalValueInclTax, valueInclTax);
                        baseTotalValueInclTax = NumberHelper.addNumber(baseTotalValueInclTax, baseValueInclTax);
                        totalRowValueInclTax = NumberHelper.addNumber(totalRowValueInclTax, rowValueInclTax);
                        baseTotalRowValueInclTax = NumberHelper.addNumber(totalRowValueInclTax, baseRowValueInclTax);
                        totalValueExclTax = NumberHelper.addNumber(totalValueExclTax, valueExclTax);
                        baseTotalValueExclTax = NumberHelper.addNumber(baseTotalValueExclTax, baseValueExclTax);
                        totalRowValueExclTax = NumberHelper.addNumber(totalRowValueExclTax, rowValueExclTax);
                        baseTotalRowValueExclTax = NumberHelper.addNumber(
                            baseTotalRowValueExclTax, baseRowValueExclTax
                        );
                        productTaxes.push({
                            title: attributeCode,
                            base_amount: baseValueExclTax,
                            amount: valueExclTax,
                            row_amount: rowValueExclTax,
                            base_row_amount: baseRowValueExclTax,
                            base_amount_incl_tax: baseValueInclTax,
                            amount_incl_tax: valueInclTax,
                            row_amount_incl_tax: rowValueInclTax,
                            base_row_amount_incl_tax: baseRowValueInclTax,
                        });
                    });
                    item.weee_tax_applied_amount = totalValueExclTax;
                    item.base_weee_tax_applied_amount = baseTotalValueExclTax;
                    item.weee_tax_applied_row_amount = totalRowValueExclTax;
                    item.base_weee_tax_applied_row_amnt = baseTotalRowValueExclTax;
                    item.weee_tax_applied_amount_incl_tax = totalValueInclTax;
                    item.base_weee_tax_applied_amount_incl_tax = baseTotalValueInclTax;
                    item.weee_tax_applied_row_amount_incl_tax = totalRowValueInclTax;
                    item.base_weee_tax_applied_row_amnt_incl_tax = baseTotalRowValueInclTax;

                    this.processTotalAmount(
                        total,
                        totalRowValueExclTax,
                        baseTotalRowValueExclTax,
                        totalRowValueInclTax,
                        baseTotalRowValueInclTax
                    );

                    WeeeDataService.setApplied(item, [...WeeeDataService.getApplied(item, quote), ...productTaxes]);
                })
            }
        }
        return this;
    }

    /**
     * Given a mapping from a weeeCode to an item, create a mapping from the item to the list of weeeCodes.
     *
     * @param weeeCodeToItemMap
     * @return {{}}
     */
    createItemToWeeeCodeMapping(weeeCodeToItemMap) {
        let itemToCodeMap = {};
        Object.keys(weeeCodeToItemMap).forEach(weeeCode => {
            let item = weeeCodeToItemMap[weeeCode];
            let key = item.item_id;
            if (itemToCodeMap[key]) {
                itemToCodeMap[key].weeeCodes.push(weeeCode);
            } else {
                itemToCodeMap[key] = {item: item, weeeCodes: [weeeCode]}
            }
        });
        return itemToCodeMap;
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
        if (WeeeHelper.includeInSubtotalInPOS()) {
            this._addAmount(rowValueExclTax, 'subtotal');
            this._addBaseAmount(baseRowValueExclTax, 'subtotal');
        } else {
            this._addAmount(rowValueExclTax, 'weee');
            this._addBaseAmount(baseRowValueExclTax, 'weee');
        }

        total.subtotal_incl_tax = NumberHelper.addNumber(total.subtotal_incl_tax || 0, rowValueInclTax || 0);
        total.base_subtotal_incl_tax = NumberHelper.addNumber(
            total.base_subtotal_incl_tax || 0, baseRowValueInclTax || 0
        );
        return this;
    }
}

/** @type QuoteTotalWeeeTaxService */
let quoteTotalWeeeTaxService = ServiceFactory.get(QuoteTotalWeeeTaxService);

export default quoteTotalWeeeTaxService;