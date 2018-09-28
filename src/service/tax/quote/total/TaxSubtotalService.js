import {QuoteTotalCommonTaxCollectorService} from "./CommonTaxCollectorService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import TaxHelper from "../../../../helper/TaxHelper";
import AddressService from "../../../checkout/quote/AddressService";
import TaxCalculationService from "../../TaxCalculationService";

export class QuoteTotalTaxSubtotalService extends QuoteTotalCommonTaxCollectorService {
    static className = 'QuoteTotalTaxSubtotalService';

    code = 'tax_subtotal';

    /**
     * Collect address tax subtotal
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {QuoteTotalSubtotalService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        let priceInclTax = TaxHelper.priceIncludesTax();
        let isVirtual = this.isVirtual(quote);
        if ((isVirtual && AddressService.isBillingAddress(address)) ||
            (!isVirtual && AddressService.isShippingAddress(address))
        ) {
            let itemDataObjects = this.mapItems(quote, address, priceInclTax, false);
            let quoteDetails = this.prepareQuoteDetails(quote, address, itemDataObjects);
            let taxDetails = TaxCalculationService.calculateTax(quoteDetails);
            let baseItemDataObjects = this.mapItems(quote, address, priceInclTax, true);
            let baseQuoteDetails = this.prepareQuoteDetails(quote, address, baseItemDataObjects);
            let baseTaxDetails = TaxCalculationService.calculateTax(baseQuoteDetails);

            let itemByType = this.organizeItemTaxDetailsByType(taxDetails, baseTaxDetails);
            if (typeof itemByType[this.ITEM_TYPE_PRODUCT] !== 'undefined') {
                this.processProductItems(quote, address, itemByType[this.ITEM_TYPE_PRODUCT], total);
            }
        }
        return this;
    }
}

/** @type QuoteTotalTaxSubtotalService */
let quoteTotalTaxSubtotalService = ServiceFactory.get(QuoteTotalTaxSubtotalService);

export default quoteTotalTaxSubtotalService;