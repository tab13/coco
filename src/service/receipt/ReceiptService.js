import ServiceFactory from "../../framework/factory/ServiceFactory";
import CoreService from "../CoreService";
import CurrencyHelper from "../../helper/CurrencyHelper";
import ConfigHelper from "../../helper/ConfigHelper";
import TaxHelper from "../../helper/TaxHelper";
import CreditmemoItemService from "../sales/order/creditmemo/CreditmemoItemService";
import OrderService from "../sales/OrderService";
import OrderItemService from "../sales/order/OrderItemService";
import LocationService from "../LocationService";
import ProductTypeConstant from "../../view/constant/ProductTypeConstant";
import OptionConstant from "../../view/constant/catalog/OptionConstant";
import i18n from "../../config/i18n";

export class ReceiptService extends CoreService {
    static className = 'ReceiptService';
    
    /**
     * Get option label from item info
     * @param item
     * @returns {string}
     */
    getOptionLabelByItem(item){
        let optionLabel = "";
        if (item.product_type === ProductTypeConstant.CONFIGURABLE) {
            if (item['product_options']) {
                let strOptions = item['product_options'];
                if (strOptions && !Array.isArray(strOptions)) {
                    let options = JSON.parse(strOptions);
                    let attributes_info = options.attributes_info;
                    if (attributes_info) {
                        const options = attributes_info.map(attribute_info => {
                            return `${attribute_info.value}`;
                        });
                        optionLabel = options.join('/');
                    }
                }
            }
        }
        return optionLabel;
    }

    /**
     * Get custom options label from item info
     * @param item
     * @returns {Array}
     */
    getCustomOptionsByItem(item){
        let customOptions = [];
        if (
            item.product_type === ProductTypeConstant.CONFIGURABLE
            || item.product_type === ProductTypeConstant.SIMPLE
            || item.product_type === ProductTypeConstant.VIRTUAL
        ) {
            let productOptionsStr = item.product_options;
            if (productOptionsStr && !Array.isArray(productOptionsStr)) {
                let productOptions = JSON.parse(productOptionsStr);
                let optionSelected = productOptions.options;

                if (Array.isArray(optionSelected)) {
                    optionSelected.forEach(option => {
                        if (
                            option.option_type === OptionConstant.TYPE_MULTIPLE
                            || option.option_type === OptionConstant.TYPE_CHECK_BOX
                        ) {
                            let printValues = option.print_value.split(', ');
                            customOptions.push(...printValues);
                        } else {
                            customOptions.push(option.print_value);
                        }
                    })
                }
            }
        }
        return customOptions;
    }

    /**
     * get bundle options
     * @param item
     * @param order
     * @return {Array}
     */
    getBundleOptionsByItem(item, order) {
        let bundleOptions = [];
        if (item.product_type === ProductTypeConstant.BUNDLE) {
            let orderChildItems = OrderItemService.getChildrenItems(item, order);
            orderChildItems.map(item => {
                let option = item.qty_ordered.toString().concat(" x ", item.name, " ", "[", item.sku, "]");
                bundleOptions.push(option);
                return item;
            });
        }
        return bundleOptions;
    }

    /**
     * get config options
     * @param item
     * @param order
     * @return {Array}
     */
    getGiftcardOptionsByItem(item, order) {
        let giftcardOptions = [];
        if(item.product_type === ProductTypeConstant.GIFT_CARD) {
            let productOptions = item.product_options ? JSON.parse(item.product_options) : null;
            if (!productOptions) {
                return [];
            }
            let giftcardAmount = productOptions.info_buyRequest && productOptions.info_buyRequest.amount ?
                                    productOptions.info_buyRequest.amount : 0;
            giftcardOptions.push(
                i18n.translator.translate(
                    "Value: {{value}}",
                    {value: CurrencyHelper.format(giftcardAmount, order.order_currency_code)}
                )
            );
        }
        return giftcardOptions;
    }

    /**
     * get custom price  reason
     * @param item
     * @param order
     * @param isCreditMemoItem
     * @returns {string}
     */
    getCustomPriceReason(item, order, isCreditMemoItem){
        if (isCreditMemoItem) {
            let orderItem = order.items.find(orderItem => {
                return orderItem.item_id === item.order_item_id
            });
            if (orderItem) {
                item = orderItem;
            }
        }
        if(ConfigHelper.isShowReasonOnReceipt()){
            return item.os_pos_custom_price_reason ? item.os_pos_custom_price_reason : '';
        }else {
            return '';
        }
    }

    /**
     * Check show origin price
     * @param item
     * @param creditmemoItems
     * @returns {boolean}
     */
    showOriginPrice(item){
        let basePrice = CurrencyHelper.roundToFloat(item.base_price, CurrencyHelper.DEFAULT_DISPLAY_PRECISION);
        let posBaseOriginalPriceExclTax = CurrencyHelper.roundToFloat(
            item.pos_base_original_price_excl_tax, CurrencyHelper.DEFAULT_DISPLAY_PRECISION
        );
        let distance = Math.abs(basePrice - posBaseOriginalPriceExclTax);
        if (distance >= 0.01 && posBaseOriginalPriceExclTax) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Get display original price
     * @param item
     * @param creditmemoItems
     * @param order
     * @returns {*|string}
     */
    displayOriginalPrice(item, order) {
        if (TaxHelper.shoppingCartDisplayPriceIncludeTax()) {
            let posOriginalPriceInclTax = CurrencyHelper.roundToFloat(
                item.pos_original_price_incl_tax, CurrencyHelper.DEFAULT_DISPLAY_PRECISION
            );
            return CurrencyHelper.format(posOriginalPriceInclTax, order.order_currency_code, null);
        } else {
            let posOriginalPriceExclTax = CurrencyHelper.roundToFloat(
                item.pos_original_price_excl_tax, CurrencyHelper.DEFAULT_DISPLAY_PRECISION
            );
            return CurrencyHelper.format(posOriginalPriceExclTax, order.order_currency_code, null);
        }
    }

    /**
     * Get display price
     * @param item
     * @param isCreditMemoItem
     * @param order
     * @returns {*}
     */
    displayPrice(item, order, isCreditMemoItem = false){
        if (isCreditMemoItem) {
            let orderItem = order.items.find(orderItem => {
                return orderItem.item_id === item.item_id
            });
            if (orderItem) {
                item = orderItem;
            }
        }
        return OrderService.getItemDisplayPrice(item, order);
    }

    /**
     * Get display row total
     * @param item
     * @param isCreditMemoItem
     * @param order
     * @returns {*|string}
     */
    getRowTotal(item, order, isCreditMemoItem = false) {
        let rowTotal = item.row_total;
        if (isCreditMemoItem) {
            rowTotal = CreditmemoItemService.getTotalAmount(item);
        }
        return CurrencyHelper.format(rowTotal, order.order_currency_code, null);
    }

    /**
     * Get qty item
     * @param item
     * @param isCreditMemoItem
     * @returns {*}
     */
    getQty(item, isCreditMemoItem = false) {
        if (isCreditMemoItem) {
            return item.qty;
        } else {
            return item.qty_ordered;
        }
    }

    /**
     *
     * @param item
     * @returns {*}
     */
    getQtyRefunded(item) {
        return item.qty_refunded;
    }


    /**
     * display row total refunded
     * @param item
     * @param order
     */
    displayRefunded(item, order) {
        return CurrencyHelper.format((item.amount_refunded), order.order_currency_code, null);
    }

    /**
     * Get creditmemo item corresponding order item
     * @param item
     * @param creditmemoItems
     * @returns {*}
     */
    getCreditmemoItem(item, creditmemoItems) {
        let itemData = null;
        if (creditmemoItems) {
            creditmemoItems.forEach((creditmemoItem) => {
                if (creditmemoItem.order_item_id === item.item_id) {
                    itemData = creditmemoItem;
                }
            })
        }
        return itemData;
    }

    /**
     * Display Location Address
     * @returns {string}
     */
    getDisplayLocationAddress(locationId) {
        let address = {};
        if (locationId) {
            let locationsString = LocationService.getLocationsInLocalStorage();
            let locations = [];
            if (locationsString && locationsString !== "") {
                locations = JSON.parse(locationsString);
            }
            let location = locations.find(location => location.location_id === locationId);
            if (location)
                address = location.address;
        } else {
            address = LocationService.getCurrentLocationAddress();
        }
        return this.getFullAddress(address);
    }


    /**
     * get full address from address
     *
     * @param address
     * @return {string}
     */
    getFullAddress(address) {
        let addressArr = [];
        let street = "";
        if (address.street) {
            street = address.street;
            addressArr.push(street);
        }
        let city = "";
        if (address.city) {
            city = address.city;
            addressArr.push(city);
        }
        let region = "";
        if (address.region.region) {
            region = address.region.region;
            addressArr.push(region);
        }
        let postCode = "";
        if (address.postcode) {
            postCode = address.postcode;
            addressArr.push(postCode);
        }
        let country = "";
        if (address.country) {
            country = address.country;
            addressArr.push(country);
        }
        return addressArr.join(", ");
    }

    /**
     * get full name from order data
     *
     * @param order
     * @return {string}
     */
    getFullName(order) {
        let customerName = "";
        if (order.customer_firstname) {
            customerName = customerName + order.customer_firstname;
            if (order.customer_middlename) {
                customerName = customerName + " " + order.customer_middlename;
            } else if (order.customer_lastname) {
                customerName = customerName + " " + order.customer_lastname;
            }
        } else if (order.customer_middlename) {
            customerName = customerName + order.customer_middlename;
            if (order.customer_lastname) {
                customerName = customerName + " " + order.customer_lastname;
            }
        } else if (order.customer_lastname) {
            customerName = customerName + order.customer_lastname;
        }
        customerName = customerName.trim();
        return customerName;
    }
}

/** @type ReceiptService */
let receiptService = ServiceFactory.get(ReceiptService);

export default receiptService;