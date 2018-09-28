import GiftCardProductConstant from "../view/constant/catalog/GiftCardProductConstant";
import CurrencyHelper from "./CurrencyHelper";
import ProductTypeConstant from "../view/constant/ProductTypeConstant";
import QuoteService from "../service/checkout/QuoteService";
import QuoteItemService from "../service/checkout/quote/ItemService";

export class GiftCardProductHelper {
    static giftCardHasFixedPrice(giftCardProduct) {
        let priceConfig = this.getPriceConfig(giftCardProduct);
        let dropDownHasFixedPrice =  priceConfig[GiftCardProductConstant.GIFT_PRICE_TYPE]
            === GiftCardProductConstant.GIFT_PRICE_TYPE_FIXED;
        return this.isTypeFixedValue(giftCardProduct) || dropDownHasFixedPrice;
    }
    /**
     *
     * @param product
     * @return {boolean}
     */
    static productIsGiftCard(product) {
        return product.type_id === ProductTypeConstant.GIFT_CARD;
    }
    /**
     *
     * @param giftCardPriceConfig
     * @return {*}
     */
    static getGiftMinValue(giftCardPriceConfig) {
        return giftCardPriceConfig[GiftCardProductConstant.GIFT_VALUE_FROM];
    }

    /**
     *
     * @param giftCardPriceConfig
     * @return {*}
     */
    static getGiftMaxValue(giftCardPriceConfig) {
        return giftCardPriceConfig[GiftCardProductConstant.GIFT_VALUE_TO];
    }

    /**
     *
     * @param giftCardPriceConfig
     * @param {boolean} format
     * @return {{min: *|string, max: *|string}}
     */
    static getGiftValues(giftCardPriceConfig, format) {
        format = format || false;

        let min = this.getGiftMinValue(giftCardPriceConfig);
        let max = this.getGiftMaxValue(giftCardPriceConfig);
        return {
            min: format ? CurrencyHelper.format(min) : min,
            max: format ? CurrencyHelper.format(max) : max,
        }
    }


    /**
     *
     * @param giftCardPriceConfig
     * @param format
     * @return {Array}
     */
    static getGiftDropdownValues (giftCardPriceConfig, format) {
        format = format || false;

        if (!giftCardPriceConfig) return [];
        if (!giftCardPriceConfig[GiftCardProductConstant.GIFT_DROPDOWN_VALUE]) return [];

        return giftCardPriceConfig[GiftCardProductConstant.GIFT_DROPDOWN_VALUE]
            .trim()
            .split(',')
            .map(value => {
                return format ? CurrencyHelper.format(value) : value * 1;
            });
    }

    /**
     *
     * @param product
     * @return {*}
     */
    static getPriceConfig(product) {
        return product[GiftCardProductConstant.GIFT_CARD_PRICE_CONFIG];
    }

    /**
     *
     * @param product
     * @return {boolean}
     */
    static isTypeFixedValue(product) {
        let priceConfig = this.getPriceConfig(product);

        if (!priceConfig) return false;

        return priceConfig[GiftCardProductConstant.GIFT_TYPE]
            === GiftCardProductConstant.GIFT_TYPE_FIXED_VALUE;
    }

    static getFixedValue(product) {
        let priceConfig = this.getPriceConfig(product);

        if (!priceConfig) return 0;

        return priceConfig[GiftCardProductConstant.GIFT_VALUE]
    }

    /**
     *
     * @param product
     * @return {{}}
     */
    static getDefaultTemplateOption(product = null) {
        let defaultValue = {
            [GiftCardProductConstant.GIFT_CARD_TEMPLATE_ID]: 1,
            [GiftCardProductConstant.GIFT_CARD_TEMPLATE_IMAGE]: 'default.png'
        };

        if (product) {
            let priceConfig = this.getPriceConfig(product);

            if (!priceConfig) return defaultValue;


            let hasTemplate = Array.isArray(priceConfig['templates']) && priceConfig['templates'].length;

            if (!hasTemplate) {
                return defaultValue;
            }

            let template = priceConfig['templates'][0];

            return {
                [GiftCardProductConstant.GIFT_CARD_TEMPLATE_ID]: template.template_id,
                [GiftCardProductConstant.GIFT_CARD_TEMPLATE_IMAGE]: template.images[0]
            }


        }

        return defaultValue;
    }

    /**
     * Get product price
     *
     * @param product
     * @param qty
     * @return {*}
     */
    static getGiftCardPrice(product, qty = 1) {
        let quote = QuoteService.getProductListQuote();
        quote.items = [{...QuoteItemService.createItem(product, qty)}];
        QuoteService.collectTotals(quote);
        let item = quote.items.find(item => item.product.id === product.id);
        return QuoteItemService.getProductListDisplayPrice(item, quote);
    }
}