import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory"
import QuoteService from "./QuoteService";
import ActionLogService from "../../service/sync/ActionLogService";
import SyncConstant from "../../view/constant/SyncConstant";
import OrderResourceModel from "../../resource-model/order/OrderResourceModel";
import StatusConstant from "../../view/constant/order/StatusConstant";
import Config from "../../config/Config";
import DateTimeHelper from "../../helper/DateTimeHelper";
import CustomPrefixHelper from "../../helper/CustomPrefixHelper";
import ProductTypeConstant from "../../view/constant/ProductTypeConstant";
import NumberHelper from "../../helper/NumberHelper";
import UserService from "../user/UserService";
import ConfigHelper from "../../helper/ConfigHelper";
import SearchConstant from "../../view/constant/SearchConstant";
import OrderService from "../sales/OrderService";
import ShipmentService from "../sales/order/ShipmentService";
import InvoiceService from "../sales/order/InvoiceService";
import PaymentHelper from "../../helper/PaymentHelper";
import cloneDeep from "lodash/cloneDeep";
import AddressConstant from "../../view/constant/checkout/quote/AddressConstant";

export class CheckoutService extends CoreService {
    static className = 'CheckoutService';

    /**
     * place order
     * @param quote
     * @param {Object | boolean} additionalData
     * @return {Promise<{entity_id: number}>}
     */
    async placeOrder(quote, additionalData = false) {
        quote = cloneDeep(quote);
        QuoteService.placeOrderBefore(quote);
        let orderResource = this.getResourceModel(OrderResourceModel);
        let order = this.convertQuoteToOrder(quote);

        /** merge additional data to order */
        if (additionalData) {
            Object.assign(order, additionalData);
        }

        let create_shipment = quote.shipping_method || quote.is_virtual ? 0 : 1;
        /*let hasCustomSale = quote.items.find(item => item.product.id < 0);
        if (hasCustomSale) {
            create_shipment = 0;
        }*/
        let create_invoice = OrderService.getBaseTotalDue(order) === 0 ? 1 : 0;

        let params = {
            order: PaymentHelper.filterOrderData(order),
            create_shipment: create_shipment,
            create_invoice: create_invoice
        };

        let url_api = orderResource.getResourceOnline().getPathPlaceOrder();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_PLACE_ORDER, url_api, SyncConstant.METHOD_POST, params
        );

        if (
            (create_shipment && create_invoice)
            || (create_invoice && order.is_virtual)
        ) {
            order.state = StatusConstant.STATE_COMPLETE;
            order.status = StatusConstant.STATUS_COMPLETE;
        } else if ((create_shipment || create_invoice) && !order.is_virtual) {
            order.state = StatusConstant.STATE_PROCESSING;
            order.status = StatusConstant.STATUS_PROCESSING;
        }

        order.search_string = this.generateSearchString(order);

        /** Add gift codes available refund **/
        order.gift_voucher_gift_codes_available_refund = order.gift_voucher_gift_codes_discount;

        if (create_shipment) {
            ShipmentService.createShipmentAfterPlaceOrder(order);
        }
        if (create_invoice) {
            order = InvoiceService.createInvoiceAfterPlaceOrder(order);
        }
        order.payments.map(payment => payment.is_paid = 1);
        order = await orderResource.placeOrder(order);
        return order;
    }

    /**
     * submit order and save to indexedDb
     *
     * @param quote
     * @return {{entity_id: number}}
     */
    convertQuoteToOrder(quote) {
        let order = this.convertQuoteDataToOrder(quote);
        let billingAddress = QuoteService.getBillingAddress(quote);
        let shippingAddress = QuoteService.getShippingAddress(quote);
        if (quote.is_virtual) {
            this.convertQuoteAddressToOrder(billingAddress, order);
        } else {
            this.convertQuoteAddressToOrder(shippingAddress, order);
        }
        order.addresses = this.convertQuoteAdrressesToOrderAddresses(order, quote.addresses);
        order.items = this.convertQuoteItemsToOrderItems(quote, order, quote.items);
        order.billing_address_id = billingAddress ? billingAddress.id : null;
        order.shipping_address_id = shippingAddress ? shippingAddress.id : null;
        order.pos_staff_id = UserService.getStaffId();
        order.pos_staff_name = UserService.getStaffName();
        order.pos_location_id = Config.location_id;

        return order;
    }

    /**
     * Convert quote data to order
     *
     * @param {object} quote
     * @return {{entity_id: number,
     * increment_id: string,
     * status: string,
     * state: string,
     * quote_id, pos_id: *,
     * customer_email: string,
     * customer_firstname: string,
     * customer_lastname: string,
     * customer_middlename: string,
     * customer_prefix: string,
     * customer_suffix: string,
     * customer_taxvat: string,
     * customer_dob: string,
     * customer_gender: *,
     * payments: *|Array,
     * coupon_code: string,
     * store_id: *|number,
     * is_virtual: number,
     * base_to_global_rate: *|number,
     * base_to_order_rate: *,
     * base_total_paid: number,
     * total_paid: number,
     * base_total_qty_ordered: *,
     * total_qty_ordered: *|number,
     * store_to_base_rate: *|number,
     * store_to_order_rate: *,
     * customer_is_guest: *|number,
     * customer_note_notify: *|number,
     * customer_group_id: *|number,
     * email_sent: number,
     * send_email: number,
     * quote_address_id: null,
     * base_total_due: number,
     * total_due: number,
     * applied_rule_ids: string,
     * base_currency_code: string,
     * global_currency_code: string,
     * order_currency_code: string,
     * store_currency_code: string,
     * store_name: string,
     * customer_note: string,
     * total_item_count: number}}
     */
    convertQuoteDataToOrder(quote) {
        let currentTimestamp = new Date().getTime();
        let databaseCurrentTime = DateTimeHelper.getDatabaseDateTime(currentTimestamp);
        let increment_id = Config.pos_id + '-' + currentTimestamp;
        increment_id = CustomPrefixHelper.getUseCustomPrefix() ?
            CustomPrefixHelper.getCustomPrefix() + increment_id :
            increment_id;
        let deliveryDate = quote.pos_delivery_date;
        if (deliveryDate && Config.config.shipping && Config.config.shipping.delivery_date) {
            deliveryDate = DateTimeHelper.getDatabaseDateTime(new Date(deliveryDate).getTime());
        }
        let order = {
            entity_id: currentTimestamp,
            increment_id: increment_id,
            status: StatusConstant.STATUS_PENDING,
            state: StatusConstant.STATE_NEW,
            quote_id: quote.id,
            pos_id: Config.pos_id,
            customer_email: quote.customer_email ? quote.customer_email : "",
            customer_firstname: quote.customer_firstname ? quote.customer_firstname : "",
            customer_lastname: quote.customer_lastname ? quote.customer_lastname : "",
            customer_middlename: quote.customer_middlename ? quote.customer_middlename : "",
            customer_prefix: quote.customer_prefix ? quote.customer_prefix : "",
            customer_suffix: quote.customer_suffix ? quote.customer_suffix : "",
            customer_taxvat: quote.customer_taxvat ? quote.customer_taxvat : "",
            customer_dob: quote.customer_dob ? quote.customer_dob : "",
            customer_gender: quote.customer_gender,
            payments: quote.payments,
            coupon_code: quote.coupon_code ? quote.coupon_code : "",
            store_id: quote.store_id,
            is_virtual: quote.is_virtual ? 1 : 0,
            base_to_global_rate: quote.base_to_global_rate,
            base_to_order_rate: quote.base_to_quote_rate,
            base_total_paid: QuoteService.getBaseTotalPaid(quote),
            total_paid: QuoteService.getTotalPaid(quote),
            base_pos_change: QuoteService.getBasePosChange(quote),
            pos_change: QuoteService.getPosChange(quote),
            base_total_qty_ordered: quote.base_total_qty_ordered,
            total_qty_ordered: quote.items_qty,
            store_to_base_rate: quote.store_to_base_rate,
            store_to_order_rate: quote.store_to_quote_rate,
            customer_is_guest: quote.customer_is_guest,
            customer_note_notify: quote.customer_note_notify,
            customer_group_id: quote.customer_group_id,
            email_sent: 0,
            send_email: 1,
            quote_address_id: null,
            base_total_due: QuoteService.getBaseTotalDue(quote),
            total_due: QuoteService.getTotalDue(quote),
            applied_rule_ids: quote.applied_rule_ids ? quote.applied_rule_ids : "",
            base_currency_code: quote.base_currency_code ? quote.base_currency_code : "",
            global_currency_code: quote.global_currency_code ? quote.global_currency_code : "",
            order_currency_code: quote.quote_currency_code ? quote.quote_currency_code : "",
            store_currency_code: quote.store_currency_code ? quote.store_currency_code : "",
            store_name: quote.store_name ? quote.store_name : "",
            customer_note: quote.customer_note ? quote.customer_note : "",
            total_item_count: quote.items_count,
            pos_delivery_date: deliveryDate,
            created_at: databaseCurrentTime,
            updated_at: databaseCurrentTime
        };
        order.pos_fulfill_online = quote.pos_fulfill_online ? 1 : 0;

        /** reward point*/
        order.rewardpoints_spent = quote.rewardpoints_spent;
        order.rewardpoints_base_discount = quote.rewardpoints_base_discount;
        order.rewardpoints_discount = quote.rewardpoints_discount;
        order.rewardpoints_earn = quote.rewardpoints_earn;
        order.rewardpoints_base_amount = quote.rewardpoints_base_amount;
        order.rewardpoints_amount = quote.rewardpoints_amount;
        order.rewardpoints_base_discount_for_shipping = quote.rewardpoints_base_discount_for_shipping;
        order.rewardpoints_discount_for_shipping = quote.rewardpoints_discount_for_shipping;
        order.magestore_base_discount_for_shipping = quote.magestore_base_discount_for_shipping;
        order.magestore_discount_for_shipping = quote.magestore_discount_for_shipping;
        order.magestore_base_discount = quote.magestore_base_discount;
        order.magestore_discount = quote.magestore_discount;

        /** Gift card **/
        order.codes_base_discount = quote.codes_base_discount;
        order.codes_discount = quote.codes_discount;
        order.gift_voucher_gift_codes = quote.gift_voucher_gift_codes;
        order.gift_voucher_gift_codes_discount = quote.gift_voucher_gift_codes_discount;
        order.base_giftvoucher_discount_for_shipping = quote.base_giftvoucher_discount_for_shipping;
        order.giftvoucher_discount_for_shipping = quote.giftvoucher_discount_for_shipping;
        order.base_gift_voucher_discount = quote.base_gift_voucher_discount;
        order.gift_voucher_discount = quote.gift_voucher_discount;
        order.magestore_base_discount = quote.magestore_base_discount;
        order.magestore_discount = quote.magestore_discount;

        return order;
    }

    /**
     * Convert quote address to order data
     *
     * @param {object} quoteAdress
     * @param {object} order
     */
    convertQuoteAddressToOrder(quoteAdress, order) {
        order.weight = quoteAdress.weight;
        order.customer_id = quoteAdress.customer_id;
        order.base_discount_amount = quoteAdress.base_discount_amount;
        order.discount_amount = quoteAdress.discount_amount;
        order.base_grand_total = quoteAdress.base_grand_total;
        order.grand_total = quoteAdress.grand_total;
        order.base_shipping_amount = quoteAdress.base_shipping_amount;
        order.shipping_amount = quoteAdress.shipping_amount;
        order.base_shipping_tax_amount = quoteAdress.base_shipping_tax_amount;
        order.shipping_tax_amount = quoteAdress.shipping_tax_amount;
        order.base_subtotal = quoteAdress.base_subtotal;
        order.subtotal = quoteAdress.subtotal;
        order.base_tax_amount = quoteAdress.base_tax_amount;
        order.tax_amount = quoteAdress.tax_amount;
        order.base_shipping_discount_amount = quoteAdress.base_shipping_discount_amount;
        order.shipping_discount_amount = quoteAdress.shipping_discount_amount;
        order.base_subtotal_incl_tax = quoteAdress.base_subtotal_incl_tax;
        order.subtotal_incl_tax = quoteAdress.subtotal_incl_tax;
        order.weight = quoteAdress.weight;
        order.discount_description = Object.values(quoteAdress.discount_description).join(',');
        /** @todo create default shipping method */
        if (!order.is_virtual) {
            order.shipping_method = quoteAdress.shipping_method ?
                quoteAdress.shipping_method : 'webpos_shipping_storepickup';
            order.shipping_description = quoteAdress.shipping_description ?
                quoteAdress.shipping_description : "Pickup-at-store";
        }
        order.coupon_rule_name = quoteAdress.coupon_rule_name;
        order.base_shipping_incl_tax = quoteAdress.base_shipping_incl_tax;
        order.shipping_incl_tax = quoteAdress.shipping_incl_tax;
        order.base_discount_tax_compensation_amount = quoteAdress.base_discount_tax_compensation_amount;
        order.discount_tax_compensation_amount = quoteAdress.discount_tax_compensation_amount;
        order.base_shipping_discount_tax_compensation_amnt = quoteAdress.base_shipping_discount_tax_compensation_amnt;
        order.shipping_discount_tax_compensation_amount = quoteAdress.shipping_discount_tax_compensation_amount;
    }

    /**
     * Convert quote addresses to order addresses
     *
     * @param {object} order
     * @param {Array} quoteAddresses
     */
    convertQuoteAdrressesToOrderAddresses(order, quoteAddresses) {
        let orderAddress = [];
        quoteAddresses.forEach(address => {
            if (order.is_virtual && address.address_type === AddressConstant.SHIPPING_ADDRESS_TYPE) {
                return;
            }
            orderAddress.push({
                parent_id: order.entity_id,
                address_type: address.address_type,
                customer_address_id: address.customer_address_id,
                quote_address_id: address.address_id,
                region_id: address.region_id,
                customer_id: address.customer_id,
                fax: address.fax,
                region: address.region ? address.region : "",
                postcode: address.postcode ? address.postcode : "",
                lastname: address.lastname ? address.lastname : "",
                street: address.street ? address.street : [],
                city: address.city ? address.city : "",
                email: address.email ? address.email : "",
                telephone: address.telephone ? address.telephone : "",
                country_id: address.country_id ? address.country_id : "",
                firstname: address.firstname ? address.firstname : "",
                prefix: address.prefix ? address.prefix : "",
                middlename: address.middlename ? address.middlename : address.middlename,
                suffix: address.suffix ? address.suffix : "",
                company: address.company,
                vat_id: address.vat_id,
                vat_is_valid: address.vat_id,
                vat_request_id: address.vat_request_id,
                vat_request_date: address.vat_request_date,
                vat_request_success: address.vat_request_success
            });
        });
        return orderAddress;
    }

    /**
     * Convert quote items to order items
     *
     * @param {object} quote
     * @param {object} order
     * @param {Array} quoteItems
     */
    convertQuoteItemsToOrderItems(quote, order, quoteItems) {
        let parentItems = {};
        return quoteItems.map(item => {
            let qty = item.qty;
            let parentItemId = item.parent_item_id;
            if (parentItemId) {
                if (!parentItems[parentItemId]) {
                    let parentItem = QuoteService.getParentItem(quote, item);
                    if (parentItem && parentItem.item_id) {
                        parentItems[parentItemId] = parentItem;
                    }
                }
                if (parentItems[parentItemId] &&
                    (parentItems[parentItemId].product_type === ProductTypeConstant.BUNDLE ||
                        parentItems[parentItemId].product_type === ProductTypeConstant.CONFIGURABLE)) {
                    qty = NumberHelper.multipleNumber(qty, parentItems[parentItemId].qty);
                }
            }

            return {
                item_id: parseFloat(item.item_id),
                order_id: order.entity_id,
                parent_item_id: parseFloat(item.parent_item_id),
                quote_item_id: parseFloat(item.item_id),
                store_id: item.store_id,
                product_id: item.product_id,
                product_type: item.product_type,
                product_options: item.product_options ? JSON.stringify(item.product_options) : "",
                weight: item.weight,
                is_virtual: item.is_virtual,
                sku: item.sku,
                name: item.name,
                description: item.description,
                applied_rule_ids: item.applied_rule_ids,
                additional_data: item.additional_data,
                is_qty_decimal: item.is_qty_decimal,
                no_discount: item.no_discount,
                qty_backordered: item.qty_backordered,
                qty_ordered: qty,
                // qty_shipped: quote.create_shipment ? qty : 0,
                base_cost: item.base_cost,
                price: item.price,
                base_price: item.base_price,
                original_price: item.original_price,
                base_original_price: item.base_original_price,
                tax_percent: item.tax_percent,
                tax_amount: item.tax_amount,
                base_tax_amount: item.base_tax_amount,
                discount_percent: item.discount_percent,
                discount_amount: item.discount_amount,
                base_discount_amount: item.base_discount_amount,
                row_total: item.row_total,
                base_row_total: item.base_row_total,
                base_tax_before_discount: item.base_tax_before_discount,
                tax_before_discount: item.tax_before_discount,
                price_incl_tax: item.price_incl_tax,
                base_price_incl_tax: item.base_price_incl_tax,
                row_total_incl_tax: item.row_total_incl_tax,
                base_row_total_incl_tax: item.base_row_total_incl_tax,
                discount_tax_compensation_amount: item.discount_tax_compensation_amount,
                base_discount_tax_compensation_amount: item.base_discount_tax_compensation_amount,
                free_shipping: !item.free_shipping ? 0 : (!isNaN(item.free_shipping) ? 1 : +item.free_shipping),
                weee_tax_applied: item.weee_tax_applied,
                weee_tax_applied_amount: item.weee_tax_applied_amount,
                weee_tax_applied_row_amount: item.weee_tax_applied_row_amount,
                weee_tax_disposition: item.weee_tax_disposition,
                weee_tax_row_disposition: item.weee_tax_row_disposition,
                base_weee_tax_applied_amount: item.base_weee_tax_applied_amount,
                base_weee_tax_applied_row_amnt: item.base_weee_tax_applied_row_amnt,
                base_weee_tax_disposition: item.base_weee_tax_disposition,
                base_weee_tax_row_disposition: item.base_weee_tax_row_disposition,
                pos_base_original_price_excl_tax: item.pos_base_original_price_excl_tax,
                pos_original_price_excl_tax: item.pos_original_price_excl_tax,
                pos_base_original_price_incl_tax: item.pos_base_original_price_incl_tax,
                pos_original_price_incl_tax: item.pos_original_price_incl_tax,

                /** reward point */
                rewardpoints_base_discount: item.rewardpoints_base_discount,
                rewardpoints_discount: item.rewardpoints_discount,
                rewardpoints_earn: item.rewardpoints_earn,
                rewardpoints_spent: item.rewardpoints_spent,

                /** Gift card */
                base_gift_voucher_discount: item.base_gift_voucher_discount,
                gift_voucher_discount: item.gift_voucher_discount,

                /** reward point & Gift card */
                magestore_base_discount: item.magestore_base_discount,
                magestore_discount: item.magestore_discount,

                /** Custom price reason */
                os_pos_custom_price_reason: item.os_pos_custom_price_reason
            }
        });
    }

    /**
     * generate order's search string
     * @param order
     * @return {string}
     */
    generateSearchString(order) {
        let searchString = order.increment_id;
        searchString += " " + order.customer_email + " " + order.customer_firstname + " " + order.customer_lastname;
        order.addresses.map(address => searchString += " " + address.telephone);
        order.items.map(item => {
            if (!item.parent_item_id) {
                let searchStringProduct = item.name + " " + item.sku;
                let configBarcode = ConfigHelper.getConfig(SearchConstant.BARCODE_CONFIG);
                if (configBarcode && configBarcode !== 'name' && configBarcode !== 'sku') {
                    searchStringProduct += " " + item[configBarcode];
                }
                searchString += " " + searchStringProduct;
            }
            return searchString;
        });
        return searchString;
    }
}

/**
 *
 * @type {CheckoutService}
 */
let checkoutService = ServiceFactory.get(CheckoutService);

export default checkoutService;
