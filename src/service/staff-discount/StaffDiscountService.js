import NumberHelper from "../../helper/NumberHelper";
import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import ConfigHelper from "../../helper/ConfigHelper";
import CurrencyHelper from "../../helper/CurrencyHelper";
import StaffDiscountResourceModel from '../../resource-model/staff-discount/StaffDiscountResourceModel';
import QuoteAction from "../../view/action/checkout/QuoteAction";

export class StaffDiscountService extends CoreService {
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
            itemPriceTotal = NumberHelper.addNumber(itemPriceTotal, item.product.price * item.qty);
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
            for (let i = 0; i < staff_discount.length; i++) {
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
            for (let i = 0; i < staff_discount_config.length; i++) {
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
                // if (item.product.special_price) {
                //     min_discount = min_discount + (parseFloat(item.original_price) - parseFloat(item.product.special_price)) * parseFloat(item.qty);
                // } else {
                // }
                // if (parseFloat(max_staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
                if (item.product.item_product_status == 'dropship') {
                    max_discount = max_discount + (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                } else {
                    //tinh theo price dc discount
                    if (parseFloat(max_staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) * 100)) {
                        max_discount = max_discount + parseFloat((max_staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                    } else {
                        max_discount = max_discount + (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                    }


                    //tinh theo special price
                    // if (item.product.special_price) {
                    //     if (parseFloat(max_staff_discount) > ((1 - (parseFloat(item.product.special_price) / parseFloat(item.original_price))) * 100)) {
                    //         max_discount = max_discount + parseFloat((max_staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                    //     } else {
                    //         max_discount = max_discount + (parseFloat(item.original_price) - parseFloat(item.product.special_price)) * parseFloat(item.qty);
                    //     }
                    // } else {
                    //     max_discount = max_discount + parseFloat((max_staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                    // }
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
                // if (item.product.special_price) {
                //     min_discount = (parseFloat(item.original_price) - parseFloat(item.product.special_price)) * parseFloat(item.qty);
                // } else {
                //     // min_discount = (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                //     min_discount = 0;
                // }

                if (item.product.item_product_status == 'dropship') {
                    staff_discount_apply = staff_discount_apply + min_discount;
                } else {
                    if (parseFloat(staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) * 100)) {
                        staff_discount_apply = staff_discount_apply + parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                    } else {
                        staff_discount_apply = staff_discount_apply + min_discount
                    }
                    //tinh theo special price
                    // if (item.product.special_price) {
                    //     if (parseFloat(staff_discount) > ((1 - (parseFloat(item.product.special_price) / parseFloat(item.original_price))) * 100)) {
                    //         staff_discount_apply = staff_discount_apply + parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                    //     } else {
                    //         staff_discount_apply = staff_discount_apply + min_discount
                    //     }
                    // } else {
                    //     staff_discount_apply = staff_discount_apply + parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                    // }
                }

                // if (parseFloat(staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
                // if (item.product.special_price && (parseFloat(staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.product.special_price))) *100))) {
                //     staff_discount_apply = staff_discount_apply + parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty);
                // } else {
                //     staff_discount_apply = staff_discount_apply + min_discount;
                // }
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
            // items.map(function (item) {
            //     if (parseFloat(discount_avarage_percent) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
            //         total_item_less_than_avg = total_item_less_than_avg + parseFloat(item.original_price) * parseFloat(item.qty);
            //     } else {
            //         total_discount_greater_than_avg = total_discount_greater_than_avg + parseFloat(item.original_price) - parseFloat(item.price);
            //     }
            // })

            items.map(function (item) {
                let current_discount = (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                if (item.product.item_product_status == 'dropship') {
                    total_discount_greater_than_avg = total_discount_greater_than_avg + (parseFloat(item.original_price) - parseFloat(item.product.special_price)) * parseFloat(item.qty);
                } else {

                    if (parseFloat(discount_avarage_percent) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) * 100)) {
                        total_item_less_than_avg = total_item_less_than_avg + parseFloat(item.original_price) * parseFloat(item.qty);
                    } else {
                        total_discount_greater_than_avg = total_discount_greater_than_avg + (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
                    }

                    //tinh theo special price
                    // if (item.product.special_price) {
                    //     if (parseFloat(discount_avarage_percent) > ((1 - (parseFloat(item.product.special_price) / parseFloat(item.original_price))) * 100)) {
                    //         total_item_less_than_avg = total_item_less_than_avg + parseFloat(item.original_price) * parseFloat(item.qty);
                    //     } else {
                    //         total_discount_greater_than_avg = total_discount_greater_than_avg + (parseFloat(item.original_price) - parseFloat(item.product.special_price)) * parseFloat(item.qty);
                    //     }
                    // } else {
                    //     total_item_less_than_avg = total_item_less_than_avg + parseFloat(item.original_price) * parseFloat(item.qty);
                    // }
                }

            });

        }

        let staff_discount_percent_apply = ((parseFloat(staff_discount_amount) - total_discount_greater_than_avg) / total_item_less_than_avg) * 100;

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
            // items.map(function (item) {
            //     let current_discount = (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);
            //     if (parseFloat(staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) *100)) {
            //         total_amount = total_amount - parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty) + current_discount;
            //     } else {
            //         //max_discount = max_discount + min_discount;
            //     }
            // })
            items.map(function (item) {
                let current_discount = (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty);

                if (item.product.item_product_status == 'dropship') {
                    total_amount = total_amount - (parseFloat(item.original_price) - parseFloat(item.price)) * parseFloat(item.qty) + current_discount;
                } else {
                    if (parseFloat(staff_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) * 100)) {
                        total_amount = total_amount - parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty) + current_discount;
                    } else {
                        // total_amount = total_amount + current_discount;
                    }
                    //tinh theo special price
                    // if (item.product.special_price) {
                    //     if (parseFloat(staff_discount) > ((1 - (parseFloat(item.product.special_price) / parseFloat(item.original_price))) * 100)) {
                    //         total_amount = total_amount - parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty) + current_discount;
                    //     } else {
                    //     }
                    // } else {
                    //     total_amount = total_amount - parseFloat((staff_discount / 100) * parseFloat(item.original_price)) * parseFloat(item.qty) + current_discount;
                    // }
                }
            });
        }
        return total_amount;
    }

    /**
     * get item price after discount
     * @param item
     * @param new_discount
     * @returns {boolean}
     */
    getItemPriceAfterDiscount(item, new_discount) {
        let new_price = false;
        if (item.product.item_product_status == 'dropship') {
            new_price = item.price;
        } else {
            if (parseFloat(new_discount) > ((1 - (parseFloat(item.price) / parseFloat(item.original_price))) * 100)) {
                new_price = (1 - parseFloat(new_discount) / 100) * parseFloat(item.original_price);
            } else {
                new_price = item.price;
            }

            //tinh theo special price
            // if (item.product.special_price) {
            //     if (parseFloat(new_discount) > ((1 - (parseFloat(item.product.special_price) / parseFloat(item.original_price))) * 100)) {
            //         new_price = (1 - parseFloat(new_discount) / 100) * parseFloat(item.original_price);
            //     } else {
            //         new_price = item.product.special_price;
            //     }
            // } else {
            //     new_price = (1 - parseFloat(new_discount) / 100) * parseFloat(item.original_price);
            // }
        }
        if (parseFloat(new_price) == parseFloat(item.price)) {
            return false;
        }
        return new_price;
    }

    /**
     * get total amount to get discount
     * @param quote
     */
    getTotalAmountToGetDiscount(quote) {
        let total_amount = quote.grand_total;
        let items = quote.items;
        items.map(function (item) {
            let product = item.product;
            if (product.special_price) {
                //total_amount = total_amount + parseFloat(product.special_price) - parseFloat(item.price);
            } else {
                total_amount = total_amount + parseFloat(item.original_price) - parseFloat(item.price);
            }
        });

        return total_amount;
    }

    // removeStaffDiscount(quote) {
    //     let items = quote.items;
    //     console.log(this.props);
    //     items.map(function (item) {
    //         let new_price = false;
    //         if (item.product.item_product_status == 'dropship') {
    //             new_price = item.price;
    //         } else {
    //             if (item.product.special_price) {
    //                 new_price = item.product.special_price;
    //             } else {
    //                 new_price = item.original_price;
    //             }
    //         }
    //         if (new_price) {
    //             QuoteAction.updateCustomPriceCartItem(item, new_price, '');
    //         }
    //     });
    // }

    /**
     * remove staff disscount when apply < 97.5%
     * @param item
     * @returns {boolean}
     */
    removeStaffDiscount(item) {
        let new_price = false;
        if (item.product.item_product_status == 'dropship') {
            new_price = item.price;
        } else {
            if (item.product.special_price) {
                new_price = item.product.special_price;
            } else {
                new_price = item.original_price;
            }
        }
        if (parseFloat(new_price) == parseFloat(item.price)) {
            return false;
        }
        // if (new_price) {
        //     QuoteAction.updateCustomPriceCartItem(item, new_price, '');
        // }

        return new_price;
    }

    /**
     * convert string to json
     *
     * @param order
     * @returns {*}
     */
    convertStaffDiscountToJson(order) {
        let staffDiscount = (order && (order.staff_discount !== undefined)) ? order.staff_discount : '';
        if (staffDiscount !== '' && typeof staffDiscount === 'string') {
            while(typeof staffDiscount === 'string'){
                staffDiscount = JSON.parse(staffDiscount);
            }
        }
        return staffDiscount
    }
}

/**
 * @type {StaffDiscountService}
 */
let staffDiscountService = ServiceFactory.get(StaffDiscountService);

export default staffDiscountService;