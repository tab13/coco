import NumberHelper from "../../helper/NumberHelper";
import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import ConfigHelper from "../../helper/ConfigHelper";
import {unserialize} from "locutus";
import CurrencyHelper from "../../helper/CurrencyHelper";

export class StaffDiscountService extends CoreService{
    static className = 'StaffDiscountService';

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

}

/**
 * @type {StaffDiscountService}
 */
let staffDiscountService = ServiceFactory.get(StaffDiscountService);

export default staffDiscountService;