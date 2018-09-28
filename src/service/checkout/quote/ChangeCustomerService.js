import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractQuoteService} from "./AbstractService";
import GuestCustomerHelper from "../../../helper/GuestCustomerHelper";
import QuoteConstant from "../../../view/constant/checkout/QuoteConstant";
import QuoteAddressConstant from "../../../view/constant/checkout/quote/AddressConstant";
import QuoteAddressService from "./AddressService";
import CustomerGroupHelper from "../../../helper/CustomerGroupHelper";
import AppStore from "../../../view/store/store";
import QuoteAction from "../../../view/action/checkout/QuoteAction";

export class ChangeCustomerService extends AbstractQuoteService {
    static className = 'ChangeCustomerService';

    /**
     * Change customer for quote
     *
     * @param {object} quote
     * @param {object} customer
     * @return {object}
     */
    changeCustomer(quote, customer = null) {
        quote.customer = customer;
        quote = {...quote, ...this.prepareQuoteCustomerData(customer)};
        quote.customer_tax_class_id = CustomerGroupHelper.getTaxClassId(
            CustomerGroupHelper.getQuoteCustomerGroupId(quote)
        );
        quote = this.changeQuoteAddress(quote, customer);
        quote.shipping_method = null;
        quote.current_shipping_method = null;
        quote.pos_delivery_date = null;
        quote.pos_fulfill_online = null;
        AppStore.dispatch(QuoteAction.changeCustomerAfter(quote));
        return quote;
    }

    /**
     * Prepare customer data for quote
     *
     * @param customer
     * @return {{checkout_method: string, customer_id: null, customer_email: *|string, customer_firstname: *|string, customer_lastname: *|string, customer_middlename: *|string, customer_prefix: *|string, customer_suffix: *|string, customer_taxvat: *|string, customer_dob: *|string, customer_gender: *|string, customer_group_id: number, customer_is_guest: number}}
     */
    prepareQuoteCustomerData(customer = null) {
        let isGuest = !customer || !customer.id;
        return {
            checkout_method: isGuest ? QuoteConstant.METHOD_GUEST : QuoteConstant.METHOD_CUSTOMER,
            customer_id: isGuest ? null : customer.id,
            customer_email: isGuest ? GuestCustomerHelper.getEmail() : customer.email,
            customer_firstname: isGuest ? GuestCustomerHelper.getFirstname() : customer.firstname,
            customer_lastname: isGuest ? GuestCustomerHelper.getLastname() : customer.lastname,
            customer_middlename: isGuest ? GuestCustomerHelper.getMiddlename() : customer.middlename,
            customer_prefix: isGuest ? GuestCustomerHelper.getPrefix() : customer.prefix,
            customer_suffix: isGuest ? GuestCustomerHelper.getSuffix() : customer.suffix,
            customer_taxvat: isGuest ? GuestCustomerHelper.getTaxvat() : customer.taxvat,
            customer_dob: isGuest ? GuestCustomerHelper.getDob() : customer.dob,
            customer_gender: isGuest ? GuestCustomerHelper.getGender() : customer.gender,
            customer_group_id: isGuest ? 0 : customer.group_id,
            customer_is_guest: isGuest ? 1 : 0
        }
    }

    /**
     * Change quote address for customer
     *
     * @param quote
     * @param customer
     * @return {*}
     */
    changeQuoteAddress(quote, customer) {
        let customerBillingAddress = null;
        let customerShippingAddress = null;
        let quoteBillingAddress = null;
        let quoteShippingAddress = null;
        if (quote.addresses && quote.addresses.length) {
            quote.addresses.map(address => {
                if (address.address_type === QuoteAddressConstant.BILLING_ADDRESS_TYPE) {
                    quoteBillingAddress = address;
                }
                if (address.address_type === QuoteAddressConstant.SHIPPING_ADDRESS_TYPE) {
                    quoteShippingAddress = address;
                }
                return address;
            });
        } else {
            quote.addresses = [];
        }

        if (customer && customer.addresses && customer.addresses.length) {
            customer.addresses.map((address/*, index*/) => {
                if (address.default_billing) {
                    customerBillingAddress = address;
                }
                if (quoteShippingAddress && quoteShippingAddress.customer_address_id === address.id) {
                    customerShippingAddress = address;
                }
                return address;
            });
        }

        if (!quoteBillingAddress) {
            quoteBillingAddress = QuoteAddressService.createAddress(
                QuoteAddressConstant.BILLING_ADDRESS_TYPE, customerBillingAddress, customer
            );
            quoteBillingAddress.quote_id = quote.id;
            quote.addresses.push(quoteBillingAddress);
        } else {
            quoteBillingAddress = QuoteAddressService.updateAddress(
                quoteBillingAddress, customerBillingAddress, customer
            );
        }
        if (!quoteShippingAddress) {
            quoteShippingAddress = QuoteAddressService.createAddress(
                QuoteAddressConstant.SHIPPING_ADDRESS_TYPE, customerShippingAddress, customer
            );
            quoteShippingAddress.quote_id = quote.id;
            quote.addresses.push(quoteShippingAddress);
        } else {
            quoteShippingAddress = QuoteAddressService.updateAddress(
                quoteShippingAddress, customerShippingAddress, customer
            );
        }
        if (!customerShippingAddress) {
            quoteShippingAddress.shipping_method = "";
            quoteShippingAddress.current_shipping_method = null;
            quoteShippingAddress.shipping_description = "";
        }
        return quote;
    }
}

/** @type ChangeCustomerService */
let changeCustomerService = ServiceFactory.get(ChangeCustomerService);

export default changeCustomerService;