import NumberHelper from "../../helper/NumberHelper";
import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";

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
}

/**
 * @type {StoreCreditService}
 */
let staffDiscountService = ServiceFactory.get(StaffDiscountService);

export default staffDiscountService;