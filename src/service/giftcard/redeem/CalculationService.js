import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import QuoteItemService from "../../checkout/quote/ItemService";
import NumberHelper from "../../../helper/NumberHelper";

class GiftcardRedeemCalculationService extends CoreService {
    static className = 'GiftcardRedeemCalculationService';
    giftCodeItemsTotal = {};

    initTotals(quote, items, giftcodes, isApplyGiftAfterTax = false) {
        this.giftCodeItemsTotal = {};
        giftcodes.forEach(giftcode => {
            let totalItemsPrice = 0,
                totalBaseItemsPrice = 0,
                validItemsCount = 0;
            items.forEach(item => {
                /*Skipping child items to avoid double calculations*/
                if (item.parent_item_id) {
                    return false;
                }
                if (!giftcode.valid_item_ids.includes(+item.item_id)) {
                    return false;
                }
                let qty = QuoteItemService.getTotalQty(item, quote);

                let totalItemPriceQty = NumberHelper.multipleNumber(this.getItemPrice(item), qty);
                totalItemPriceQty = NumberHelper.minusNumber(totalItemPriceQty, item.discount_amount);
                totalItemsPrice = NumberHelper.addNumber(totalItemsPrice, totalItemPriceQty);

                let baseTotalItemPriceQty = NumberHelper.multipleNumber(this.getItemBasePrice(item), qty);
                baseTotalItemPriceQty = NumberHelper.minusNumber(baseTotalItemPriceQty, item.base_discount_amount);
                totalBaseItemsPrice = NumberHelper.addNumber(totalBaseItemsPrice, baseTotalItemPriceQty);

                if (isApplyGiftAfterTax) {
                    totalItemsPrice = NumberHelper.addNumber(totalItemsPrice, item.tax_amount);
                    totalBaseItemsPrice = NumberHelper.addNumber(totalBaseItemsPrice, item.base_tax_amount);
                }
                validItemsCount++;
            });
            this.giftCodeItemsTotal[giftcode.code] = {
                items_price: totalItemsPrice,
                base_items_price: totalBaseItemsPrice,
                items_count: validItemsCount
            };
        });
    }

    /**
     * Get gift code items total
     *
     * @param code
     * @return {*|null}
     */
    getGiftCodeItemsTotal(code) {
        return this.giftCodeItemsTotal[code] || null;
    }

    /**
     * Get Item base price
     *
     * @param item
     * @return number
     */
    getItemBasePrice(item) {
        let price = item.base_discount_calculation_price;
        if (price !== null && typeof price !== 'undefined') {
            return price;
        }
        return QuoteItemService.getBaseCalculationPrice(item);
    }

    /**
     * Get Item base price
     *
     * @param item
     * @return number
     */
    getItemPrice(item) {
        let price = item.discount_calculation_price;
        if (price !== null && typeof price !== 'undefined') {
            return price;
        }
        return QuoteItemService.getCalculationPrice(item);
    }
}

/**
 * @type {GiftcardRedeemCalculationService}
 */
let giftcardRedeemCalculationService = ServiceFactory.get(GiftcardRedeemCalculationService);

export default giftcardRedeemCalculationService;