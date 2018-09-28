import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import AddressConstant from "../../../view/constant/checkout/quote/AddressConstant";
import NumberHelper from "../../../helper/NumberHelper";

export class AbstractQuoteService extends CoreService {
    static className = 'AbstractQuoteService';

    /**
     * Reset quote data before collect total
     *
     * @param quote
     */
    resetQuoteData(quote) {
        quote.addresses.map(address => {
            address.grand_total = 0;
            address.base_grand_total = 0;
            address.discount_description = {};
            delete address.shipping_amount_for_discount;
            delete address.item_qty;
            delete address.weight;
            delete address.free_method_weight;
            delete address.free_shipping;
            return address;
        });
        quote.items.map(item => {
            delete item.base_price;
            delete item.price;
            delete item.original_price;
            delete item.base_original_price;
            delete item.unit_price;
            delete item.base_price_incl_tax;
            delete item.price_incl_tax;
            delete item.base_row_total_incl_tax;
            delete item.row_total_incl_tax;
            delete item.base_row_total;
            delete item.row_total;
            delete item.base_tax_amount;
            delete item.tax_amount;
            delete item.tax_percent;
            delete item.converted_price;
            delete item.original_custom_price;
            delete item.base_calculation_price;
            delete item.calculation_price;
            delete item.base_tax_calculation_price;
            delete item.tax_calculation_price;
            delete item.associated_taxables;
            delete item.tax_calculation_item_id;
            delete item.base_discount_amount;
            delete item.discount_amount;
            delete item.base_discount_calculation_price;
            delete item.discount_calculation_price;
            delete item.base_discount_tax_compensation_amount;
            delete item.discount_tax_compensation_amount;
            delete item.associated_item_code;
            delete item.applied_taxes;
            delete item.is_tax_included;
            delete item.base_weee_tax_applied_amount;
            delete item.weee_tax_applied_amount;
            delete item.base_weee_tax_applied_row_amnt;
            delete item.weee_tax_applied_row_amount;
            delete item.base_weee_tax_applied_amount_incl_tax;
            delete item.weee_tax_applied_amount_incl_tax;
            delete item.base_weee_tax_applied_row_amnt_incl_tax;
            delete item.weee_tax_applied_row_amount_incl_tax;
            delete item.weee_tax_applied;
            delete item.base_weee_tax_disposition;
            delete item.weee_tax_disposition;
            delete item.base_weee_tax_row_disposition;
            delete item.weee_tax_row_disposition;
            delete item.row_weight;
            delete item.free_shipping;
            return item;
        })
    }

    /**
     * Check quote is virtual
     *
     * @param quote
     * @return {boolean}
     */
    isVirtual(quote) {
        let isVirtual = true;
        let countItems = 0;
        quote.items.map(item => {
            if (item.parent_item_id) {
                return true;
            }
            countItems++;
            if (!item.is_virtual) {
                isVirtual = false;
                return false;
            }
            return true;
        });
        return countItems === 0 ? false : isVirtual;
    }

    /**
     * Get all visible items in quote
     *
     * @param quote
     */
    getAllVisibleItems(quote) {
        return quote.items.filter(item => !item.parent_item_id);
    }

    /**
     * Get quote item from product id
     *
     * @param quote
     * @param productId
     */
    getItemsByProductId(quote, productId) {
        return quote.items.filter(item => item.product.id === productId);
    }

    /**
     * Get children items from quote item parent id
     *
     * @param quote
     * @param parentItem
     * @return {boolean}
     */
    getChildrenItems(quote, parentItem) {
        if (parentItem.type_id === 'simple') {
            return false;
        }
        return quote.items.filter(item => item.parent_item_id === parentItem.item_id);
    }

    /**
     * Get parent item id from quote item id
     *
     * @param quote
     * @param childItem
     */
    getParentItem(quote, childItem) {
        return quote.items.find(item => (parseFloat(item.item_id) === parseFloat(childItem.parent_item_id)));
    }


    /**
     * Get all qty of product in cart
     *
     * @param items
     * @param quote
     * @param productId
     * @return {number}
     */
    getProductTotalItemsQtyInCart(items = null, quote = null, productId = null) {
        let qty = 0;
        if (!items) {
            items = this.getItemsByProductId(quote, productId);
        }
        if (items && items.length > 0) {
            let parentItems = {};
            items.map(item => {
                if (!item.parent_item_id) {
                    qty = NumberHelper.addNumber(qty, item.qty);
                } else {
                    let parentItem = null;
                    if (parentItems[+item.parent_item_id]) {
                        parentItem = parentItems[+item.parent_item_id];
                    } else {
                        parentItem = this.getParentItem(quote, item);
                        parentItems[+item.parent_item_id] = parentItem;
                    }
                    if (parentItem) {
                        qty = NumberHelper.addNumber(qty, NumberHelper.multipleNumber(item.qty, parentItem.qty));
                    }
                }
                return item;
            });
        }
        return qty;
    }

    /**
     * Get quote billing address
     *
     * @param quote
     * @return {object}
     */
    getBillingAddress(quote) {
        if (!quote.addresses || quote.addresses.length < 1) {
            return false;
        }
        return quote.addresses.find(address => address.address_type === AddressConstant.BILLING_ADDRESS_TYPE);
    }

    /**
     * Get quote shipping address
     *
     * @param quote
     * @return {object}
     */
    getShippingAddress(quote) {
        if (!quote.addresses || quote.addresses.length < 1) {
            return false;
        }
        return quote.addresses.find(address => address.address_type === AddressConstant.SHIPPING_ADDRESS_TYPE);
    }
}

let abstractQuoteService = ServiceFactory.get(AbstractQuoteService);

export default abstractQuoteService;