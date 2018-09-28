import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import TaxHelper from "../../helper/TaxHelper";
import QuoteAddressService from "../checkout/quote/AddressService";
import CustomerGroupHelper from "../../helper/CustomerGroupHelper";
import TaxCalculationService from "../tax/TaxCalculationService";
import TaxConfigConstant from "../../view/constant/tax/ConfigConstant";
import CurrencyHelper from "../../helper/CurrencyHelper";

export class CatalogDataService extends CoreService {
    static className = 'CatalogDataService';

    /**
     * @param {object} address
     * @return {object}
     */
    convertDefaultTaxAddress(address) {
        if (!address) {
            return null;
        }
        let addressDataObject = {
            country_id: address.country_id,
            postcode: address.postcode
        };
        if (address.region_id) {
            addressDataObject.region = address.region;
        }
        return addressDataObject;
    }

    /**
     * Get product price with all tax settings processing
     *
     * @param {object} quote
     * @param {object} product
     * @param {number} price
     * @param {boolean} includingTax
     * @param {object} shippingAddress
     * @param {object} billingAddress
     * @param {number} ctc customer tax class id
     * @param {boolean} priceIncludesTax
     * @param {boolean} roundPrice
     * @return {*}
     */
    getTaxPrice(product, quote, price, includingTax = null, shippingAddress = null,
                billingAddress = null, ctc = null, priceIncludesTax = null, roundPrice = true) {
        if (!price) {
            return price;
        }
        if (TaxHelper.needPriceConversion()) {
            if (priceIncludesTax === null) {
                priceIncludesTax = TaxHelper.priceIncludesTax();
            }
            let shippingAddressDataObject = null;
            if (shippingAddress === null) {
                shippingAddressDataObject =
                    this.convertDefaultTaxAddress(QuoteAddressService.getShippingAddress(quote));
            }
            else if (shippingAddress) {
                shippingAddressDataObject = this.convertDefaultTaxAddress(shippingAddress);
            }

            let billingAddressDataObject = null;
            if (billingAddress === null) {
                billingAddressDataObject =
                    this.convertDefaultTaxAddress(QuoteAddressService.getBillingAddress(quote));
            }
            else if (billingAddress) {
                billingAddressDataObject = this.convertDefaultTaxAddress(billingAddress);
            }

            let taxClassKey = {
                type: 'id',
                value: product.tax_class_id
            };

            if (ctc === null) {
                let customerGroupId = CustomerGroupHelper.getQuoteCustomerGroupId(quote);
                ctc = CustomerGroupHelper.getTaxClassId(customerGroupId);
            }

            let customerTaxClassKey = {
                type: 'id',
                value: ctc
            };

            let item = {
                quantity: 1,
                code: product.sku,
                short_description: product.short_description,
                tax_class_key: taxClassKey,
                is_tax_included: priceIncludesTax,
                type: 'product',
                unit_price: price
            };

            let quoteDetails = {
                shipping_address: shippingAddressDataObject,
                billing_address: billingAddressDataObject,
                customer_tax_class_key: customerTaxClassKey,
                items: [item],
                customer_id: quote.customer ? quote.customer.id : null,
                customer: quote.customer ? quote.customer : null
            };

            let taxDetails = TaxCalculationService.calculateTax(quoteDetails, roundPrice);

            let items = taxDetails.items;
            if (items && Object.keys(items).length) {
                let taxDetailsItem = items[Object.keys(items)[0]];

                if (includingTax !== null) {
                    if (includingTax) {
                        price = taxDetailsItem.price_incl_tax;
                    } else {
                        price = taxDetailsItem.price;
                    }
                } else {
                    switch (TaxHelper.getPriceDisplayType()) {
                        case TaxConfigConstant.DISPLAY_TYPE_EXCLUDING_TAX:
                        case TaxConfigConstant.DISPLAY_TYPE_BOTH:
                            price = taxDetailsItem.price;
                            break;
                        case TaxConfigConstant.DISPLAY_TYPE_INCLUDING_TAX:
                            price = taxDetailsItem.price_incl_tax;
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        if (roundPrice) {
            return CurrencyHelper.roundToFloat(price);
        }
        return price;
    }
}

/** @type CatalogDataService */
let catalogDataService = ServiceFactory.get(CatalogDataService);

export default catalogDataService;