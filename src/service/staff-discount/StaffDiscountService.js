import NumberHelper from "../../helper/NumberHelper";
import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import ConfigHelper from "../../helper/ConfigHelper";
import CurrencyHelper from "../../helper/CurrencyHelper";
import StaffDiscountResourceModel from '../../resource-model/staff-discount/StaffDiscountResourceModel';

export class StaffDiscountService extends CoreService{
    static className = 'StaffDiscountService';
    resourceModel = StaffDiscountResourceModel;

    checkManagerStaffPinCode(pincode) {
        return this.getResourceModel().checkManagerStaffPinCode(pincode);
    }

    /**
     * Get total original price of products in cart
     *
     * @param {object} quote
     * @returns {number}
     */
    getTotalPriceOfProductInCart(quote) {
        let itemPriceTotal = 0;
        quote.items.map(item => {
            itemPriceTotal = NumberHelper.addNumber(itemPriceTotal,item.product.price * item.qty);
        });
        return itemPriceTotal;
    }

    /**
     * discount rate of staff from config
     *
     * @returns {*|null}
     */
    getConfigStaffDiscount() {

        let staff_discount = ConfigHelper.getConfig('webpos/discount_configuration/staff_discount/discount_structure');
        if (staff_discount.length > 0) {
            for (let i=0; i < staff_discount.length; i++) {
                console.log(JSON.parse(staff_discount[i]));
            }
        }
    }


    /**
     * discount rate of manager from config
     *
     * @returns {*|null}
     */
    getConfigManagerDiscount() {
        return ConfigHelper.getConfig('webpos/discount_configuration/manager_discount/max_discount');
    }

    /**
     * get max discount of staff by total amount
     * @param totalAmount
     * @returns {number}
     */
    getMaxStaffDiscountByAmount(totalAmount) {
        let staff_discount = 0;
        let staff_discount_config = ConfigHelper.getConfig('webpos/discount_configuration/staff_discount/discount_structure');
        if (staff_discount_config.length > 0) {
            for (let i=0; i < staff_discount_config.length; i++) {
                let discount = JSON.parse(staff_discount_config[i]);
                if (parseFloat(totalAmount) >= parseFloat(discount.min_order_total)) {
                    if (parseFloat(staff_discount) < parseFloat(discount.rate)) {
                        staff_discount = discount.rate;
                    }
                }
            }
        }

        return staff_discount;
    }
    /**
     * Get total original price of products in cart after discount
     *
     * @param {object} quote
     * @returns {number}
     */
    getTotalPriceOfProductAfterDiscountInCart(quote) {
        return this.getTotalPriceOfProductInCart(quote) - CurrencyHelper.roundToFloat(quote.subtotal - quote.grand_total + quote.tax_amount);
    }

    /**
     * get max, min discount when apply staff discount
     * @param quote
     * @param max_staff_discount
     * @returns {{min_discount: number, max_discount: number}}
     */
    discountRangeForStaffDiscount(quote, max_staff_discount) {
        let items = quote.items;
        let min_discount = 0;
        let max_discount = 0;

        if (items.length > 0) {
            items.map(function (item) {
                min_discount = min_discount + (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                if (parseFloat(max_staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
                    max_discount = max_discount + parseFloat((max_staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                } else {
                    max_discount = max_discount + min_discount;
                }
            })
        }

        return {
            'min_discount': min_discount,
            'max_discount': max_discount
        }
    }

    /**
     * get staff discount amount when apply staff discount
     * @param quote
     * @param staff_discount
     * @returns {number}
     */
    getStaffDiscountAmountApply(quote, staff_discount) {
        let items = quote.items;
        let staff_discount_apply = 0;
        let min_discount = 0;
        if (items.length > 0) {
            items.map(function (item) {
                min_discount = (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                if (parseFloat(staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
                    staff_discount_apply = staff_discount_apply + parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                } else {
                    staff_discount_apply = staff_discount_apply + min_discount;
                }
            })
        }

        return staff_discount_apply;
    }

    /**
     * get staff discount percent when fill discount amount
     * @param quote
     * @param staff_discount
     * @returns {number}
     */
    getStaffDiscountPercentApply(quote, staff_discount_amount) {
        let items = quote.items;

        let total_item_qty = 0;
        let total_rrp_items = 0;
        if (items.length > 0) {
            items.map(function (item) {
                total_item_qty = total_item_qty + parseFloat(item.qty);
                total_rrp_items = total_rrp_items + parseFloat(item.price) * parseFloat(item.qty);
            })
        }

        let discount_avarage_percent = (parseFloat(staff_discount_amount) / total_rrp_items) * 100;
        let total_discount_greater_than_avg = 0
        let total_item_less_than_avg = 0;
        if (items.length > 0) {
            items.map(function (item) {
                if (parseFloat(discount_avarage_percent) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
                    total_item_less_than_avg = total_item_less_than_avg + parseFloat(item.original_price) * parseFloat(item.qty);
                } else {
                    total_discount_greater_than_avg = total_discount_greater_than_avg + parseFloat(item.original_price) - parseFloat(item.price);
                }
            })
        }

        let staff_discount_percent_apply = ((parseFloat(staff_discount_amount) - total_discount_greater_than_avg) / total_item_less_than_avg);

        return staff_discount_percent_apply;
    }

    /**
     * get total amount when apply discount change
     * @param quote
     * @param staff_discount
     */
    getTotalAmountWhenApplyDiscount(quote, staff_discount) {
        let total_amount = quote.grand_total;
        let items = quote.items;
        if (items.length > 0) {
            items.map(function (item) {
                let current_discount = (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                if (parseFloat(staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
                    total_amount = total_amount - parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty) + current_discount;
                } else {
                    //max_discount = max_discount + min_discount;
                }
            })
        }

        return total_amount;
    }

}

/**
 * @type {StaffDiscountService}
 */
let staffDiscountService = ServiceFactory.get(StaffDiscountService);

export default staffDiscountService;