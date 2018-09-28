import {QuoteTotalCommonTaxCollectorService} from "./CommonTaxCollectorService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import AddressService from "../../../checkout/quote/AddressService";
import TaxCalculationService from "../../TaxCalculationService";

export class QuoteTotalTaxShippingService extends QuoteTotalCommonTaxCollectorService {
    static className = 'QuoteTotalTaxShippingService';

    code = 'tax_shipping';

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
        let isVirtual = this.isVirtual(quote);
        if (!quote.items || !quote.items.length) {
            return this;
        }
        if ((isVirtual && AddressService.isBillingAddress(address)) ||
            (!isVirtual && AddressService.isShippingAddress(address))
        ) {
            let shippingDataObject = this.getShippingDataObject(quote, address, total, false);
            let baseShippingDataObject = this.getShippingDataObject(quote, address, total, true);
            if (shippingDataObject === null || baseShippingDataObject === null) {
                return this;
            }
            let quoteDetais = this.prepareQuoteDetails(quote, address, [shippingDataObject]);
            let taxDetails = TaxCalculationService.calculateTax(quoteDetais);
            let baseQuoteDetails = this.prepareQuoteDetails(quote, address, [baseShippingDataObject]);
            let baseTaxDetails = TaxCalculationService.calculateTax(baseQuoteDetails);

            this.processShippingTaxInfo(
                quote,
                address,
                total,
                taxDetails.items[this.ITEM_CODE_SHIPPING],
                baseTaxDetails.items[this.ITEM_CODE_SHIPPING]
            );


        }
    }
}

/** @type QuoteTotalTaxShippingService */
let quoteTotalTaxShippingService = ServiceFactory.get(QuoteTotalTaxShippingService);

export default quoteTotalTaxShippingService;