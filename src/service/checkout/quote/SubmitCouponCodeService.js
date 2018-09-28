import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractQuoteService} from "./AbstractService";
import QuoteResourceModel from "../../../resource-model/quote/QuoteResourceModel";

export class SubmitCouponCodeService extends AbstractQuoteService {
    static className = 'SubmitCouponCodeService';
    resourceModel = QuoteResourceModel;

    /**
     * submit coupon code
     *
     * @param quote
     * @param couponCode
     * @return {rules|*|promise}
     */
    submit(quote, couponCode) {
        let params = {
            quote: this.prepareQuoteParams(quote),
            coupon_code: couponCode
        };
        return this.getResourceModel().submitCouponCode(params);
    }

    /**
     * prepare params
     *
     * @param quote
     */
    prepareQuoteParams(quote) {
        let quoteData = this.prepareQuoteData(quote);
        quoteData.addresses = this.prepareQuoteAddressesData(quote);
        quoteData.items = this.prepareQuoteItemsData(quote);
        return quoteData;
    }

    /**
     * prepare data
     * @param quote
     * @return {{entity_id}}
     */
    prepareQuoteData(quote) {
        let fields = [
            'store_id', 'is_virtual', 'items_count', 'items_qty', 'grand_total', 'base_grand_total',
            'checkout_method', 'customer_tax_class_id', 'customer_group_id', 'customer_id', 'customer_email',
            'customer_firstname', 'customer_lastname', 'subtotal', 'base_subtotal', 'store_to_base_rate',
            'store_to_base_rate', 'base_to_global_rate', 'base_to_quote_rate', 'base_currency_code',
            'store_currency_code', 'store_currency_code', 'quote_currency_code', 'global_currency_code'
        ];
        let quoteData = {entity_id: quote.id};
        fields.map(field => {
            quoteData[field] = quote[field];
            return field;
        });
        return quoteData;
    }

    /**
     * prepare address
     *
     * @param quote
     * @return {*}
     */
    prepareQuoteAddressesData(quote) {
        if (!quote.addresses || !quote.addresses.length) {
            return [];
        }
        let fields = [
            'address_id', 'quote_id', 'customer_id', 'customer_address_id', 'address_type', 'email', 'firstname',
            'lastname', 'company', 'city', 'region_id', 'postcode', 'country_id', 'telephone', 'same_as_billing',
            'shipping_method', 'shipping_description', 'weight', 'subtotal', 'base_sub_total', 'tax_amount',
            'base_tax_amount', 'shipping_amount', 'base_shipping_amount', 'shipping_tax_amount', 'grand_total',
            'base_grand_total', 'subtotal_incl_tax', 'base_subtotal_total_incl_tax', 'shipping_incl_tax',
            'base_shipping_incl_tax', 'vat_id'
        ];
        return quote.addresses.map(address => {
            let addressData = {};
            fields.map(field => {
                addressData[field] = address[field];
                return field;
            });
            addressData.street = JSON.stringify(address.street);
            addressData.region = address && address.region ? address.region : "";
            return addressData;
        })
    }

    /**
     * prepare items
     *
     * @param quote
     * @return {Array}
     */
    prepareQuoteItemsData(quote) {
        if (!quote.items || !quote.items.length) {
            return [];
        }

        let fields = [
            'item_id', 'quote_id', 'parent_item_id', 'product_id', 'store_id', 'is_virtual', 'sku', 'name',
            'additional_data', 'is_qty_decimal', 'no_discount', 'weight', 'qty', 'price', 'base_price', 'custom_price',
            'tax_percent', 'tax_amount', 'base_tax_amount', 'row_total', 'base_row_total', 'row_weight', 'product_type',
            'price_incl_tax', 'base_price_incl_tax', 'row_total_incl_tax', 'base_row_total_incl_tax'
        ];

        return quote.items.map(item => {
            let itemData = {};

            fields.map(field => {
                itemData[field] = item[field];
                return field;
            });

            return itemData;
        })
    }
}

/** @type SubmitCouponCodeService */
let changeCustomerService = ServiceFactory.get(SubmitCouponCodeService);
export default changeCustomerService;



