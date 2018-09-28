import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractQuoteService} from "./AbstractService";
import AddressConstant from "../../../view/constant/checkout/quote/AddressConstant";
import Config from "../../../config/Config";
import QuoteConstant from "../../../view/constant/checkout/QuoteConstant";
import GuestCustomerHelper from "../../../helper/GuestCustomerHelper";
import LocationHelper from "../../../helper/LocationHelper";
import CountryHelper from "../../../helper/CountryHelper";
import NumberHelper from "../../../helper/NumberHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import ShippingService from "../../shipping/ShippingService";

export class QuoteAddressService extends AbstractQuoteService {
    static className = 'QuoteAddressService';

    /**
     * Create quote address
     *
     * @param {string} address_type
     * @param {object} address
     * @param {object} customer
     * @return {{quote_id: null, customer_id: null, address_type: string, email: null, prefix: null, firstname: *, middlename: null, lastname: null, suffix: null, customer_address_id: *, street: *, city: *, region: *, region_id: *, post_code: *, country_id: number, telephone: *, fax: *, same_as_billing: number, shipping_method: null, shipping_description: null, subtotal: number, base_subtotal: number, subtotal_with_discount: number, base_subtotal_with_discount: number, tax_amount: number, base_tax_amount: number, shipping_amount: number, base_shipping_amount: number, shipping_tax_amount: number, base_shipping_tax_amount: number, discount_amount: number, base_discount_amount: number, grand_total: number, base_grand_total: number, customer_notes: null, discount_description: null, shipping_discount_amount: number, base_shipping_discount_amount: number, subtotal_incl_tax: number, base_subtotal_incl_tax: number, shipping_incl_tax: number, base_shipping_incl_tax: number}}
     */
    createAddress(address_type, address = null, customer = null) {
        let isGuest = !customer || !customer.id;
        return {
            address_id: address && address.id ? address.id : null,
            quote_id: null,
            customer_id: isGuest ? null : customer.id,
            address_type: address_type || AddressConstant.SHIPPING_ADDRESS_TYPE,
            email: customer ? customer.email : GuestCustomerHelper.getEmail(),
            prefix: address ? address.prefix : GuestCustomerHelper.getPrefix(),
            firstname: address ? address.firstname :
                (customer ? customer.firstname : GuestCustomerHelper.getFirstname()),
            middlename: address ? address.middlename :
                (customer ? customer.middlename : GuestCustomerHelper.getMiddlename()),
            lastname: address ? address.lastname :
                (customer ? customer.lastname : GuestCustomerHelper.getLastname()),
            suffix: address ? address.suffix :
                (customer ? customer.suffix : GuestCustomerHelper.getSuffix()),
            customer_address_id: isGuest ? null : (address ? address.id : null),
            street: address ? address.street : [LocationHelper.getStreet()],
            city: address ? address.city : LocationHelper.getCity(),
            region: address && address.region ? address.region.region :
                (LocationHelper.getRegion() ? LocationHelper.getRegion().region : null),
            region_id: address ? address.region_id : LocationHelper.getRegionId(),
            postcode: address ? address.postcode : LocationHelper.getPostcode(),
            country_id: address ? address.country_id : LocationHelper.getCountryId(),
            telephone: address ? address.telephone :
                (customer ? customer.telephone : GuestCustomerHelper.getTelephone()),
            fax: address ? address.fax :
                (customer ? customer.telephone : GuestCustomerHelper.getFax()),
            same_as_billing: 0,
            shipping_method: null,
            shipping_description: null,
            subtotal: 0,
            base_subtotal: 0,
            subtotal_with_discount: 0,
            base_subtotal_with_discount: 0,
            tax_amount: 0,
            base_tax_amount: 0,
            shipping_amount: 0,
            base_shipping_amount: 0,
            shipping_tax_amount: 0,
            base_shipping_tax_amount: 0,
            discount_amount: 0,
            base_discount_amount: 0,
            grand_total: 0,
            base_grand_total: 0,
            customer_notes: null,
            discount_description: null,
            shipping_discount_amount: 0,
            base_shipping_discount_amount: 0,
            subtotal_incl_tax: 0,
            base_subtotal_incl_tax: 0,
            base_subtotal_total_incl_tax: 0,
            shipping_incl_tax: 0,
            base_shipping_incl_tax: 0
        }
    }

    /**
     * Update quote address
     *
     * @param quoteAddress
     * @param address
     * @param customer
     * @return {object}
     */
    updateAddress(quoteAddress = {}, address = null, customer = null) {
        let isGuest = !customer || !customer.id;
        quoteAddress.address_id = address && address.id ? address.id : null;
        quoteAddress.customer_id = isGuest ? null : customer.id;
        quoteAddress.email = customer ? customer.email : GuestCustomerHelper.getEmail();
        quoteAddress.prefix = address ? address.prefix : GuestCustomerHelper.getPrefix();
        quoteAddress.firstname = address ? address.firstname :
            (customer ? customer.firstname : GuestCustomerHelper.getFirstname());
        quoteAddress.middlename = address ? address.middlename :
            (customer ? customer.middlename : GuestCustomerHelper.getMiddlename());
        quoteAddress.lastname = address ? address.lastname :
            (customer ? customer.lastname : GuestCustomerHelper.getLastname());
        quoteAddress.suffix = address ? address.suffix :
            (customer ? customer.suffix : GuestCustomerHelper.getSuffix());
        quoteAddress.customer_address_id = isGuest ? null : (address ? address.id : null);
        quoteAddress.street = address ? address.street : [LocationHelper.getStreet()];
        quoteAddress.city = address ? address.city : LocationHelper.getCity();
        quoteAddress.region = address && address.region ? address.region.region :
            (LocationHelper.getRegion() ? LocationHelper.getRegion().region : null);
        quoteAddress.region_id = address ? address.region_id : LocationHelper.getRegionId();
        quoteAddress.postcode = address ? address.postcode : LocationHelper.getPostcode();
        quoteAddress.country_id = address ? address.country_id : LocationHelper.getCountryId();
        quoteAddress.telephone = address ? address.telephone :
            (customer ? customer.telephone : GuestCustomerHelper.getTelephone());
        quoteAddress.fax = address ? address.fax :
            (customer ? customer.telephone : GuestCustomerHelper.getFax());
        return quoteAddress;
    }

    /**
     * Check address is billing address
     *
     * @param {object} address
     * @return {boolean}
     */
    isBillingAddress(address) {
        return address.address_type === AddressConstant.BILLING_ADDRESS_TYPE;
    }

    /**
     * Check address is shipping address
     *
     * @param {object} address
     * @return {boolean}
     */
    isShippingAddress(address) {
        return address.address_type === AddressConstant.SHIPPING_ADDRESS_TYPE;
    }

    /**
     *
     * @param quote
     * @returns {*}
     */
    createTempAddress(quote) {
        if (quote.addresses.length <= 0) {
            let billingAddress = this.createAddress(AddressConstant.BILLING_ADDRESS_TYPE);
            billingAddress.quote_id = quote.id;
            quote.addresses.push(billingAddress);
            let shippingAddress = this.createAddress(AddressConstant.SHIPPING_ADDRESS_TYPE);
            shippingAddress.quote_id = quote.id;
            quote.addresses.push(shippingAddress);

            if (!quote.customer_id && !quote.customer_email) {
                let guestCustomer = Config.config.guest_customer;
                quote.checkout_method = QuoteConstant.METHOD_GUEST;
                quote.customer_email = guestCustomer.email;
                quote.customer_firstname = guestCustomer.first_name;
                quote.customer_lastname = guestCustomer.last_name;
                quote.customer_email = guestCustomer.email;
            }
        }
        return quote;
    }

    requestShippingRates(quote, address, allowShippingMethods = []) {
        let request = {
            all_items: quote.items,
            dest_country_id: address.country_id,
            dest_region_id: address.region_id,
            dest_region_code: CountryHelper.getRegionCode(address.country_id, +address.region_id),
            dest_street: this.getStreetFull(address),
            dest_city: address.city,
            dest_postcode: address.postcode,
            package_value: address.base_subtotal,
            package_value_with_discount: address.base_subtotal_with_discount,
            package_weight: address.weight,
            package_qty: quote.items_qty,
            package_physical_value: NumberHelper.minusNumber(address.base_subtotal, address.base_virtual_amount),
            free_method_weight: address.free_method_weight,
            free_shipping: address.free_shipping,
            base_currency: CurrencyHelper.getBaseCurrency(),
            package_currency: CurrencyHelper.getCurrentCurrency(),
            base_subtotal_incl_tax: address.base_subtotal_total_incl_tax,
        };
        let result = ShippingService.collectRates(request, allowShippingMethods, quote);
        if (result) {
            return result.getAllRates();
        }
        return [];
    }

    getStreetFull(address) {
        let street = address.street;
        return Array.isArray(street) ? street.join("\n", street) : street;
    }
}

/** @type QuoteAddressService */
let quoteAddressService = ServiceFactory.get(QuoteAddressService);

export default quoteAddressService;