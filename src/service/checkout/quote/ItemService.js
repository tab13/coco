import ServiceFactory from "../../../framework/factory/ServiceFactory";
import {AbstractQuoteItemService} from "./item/AbstractItemService";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import TaxHelper from "../../../helper/TaxHelper";
import WeeeHelper from "../../../helper/WeeeHelper";
import WeeeDataService from "../../weee/WeeeDataService";
import NumberHelper from "../../../helper/NumberHelper";
import ProductTypeConstant from "../../../view/constant/ProductTypeConstant";
import GiftCardProductConstant from "../../../view/constant/catalog/GiftCardProductConstant";
import PriceService from "../../catalog/product/PriceService";

export class QuoteItemService extends AbstractQuoteItemService {
    static className = 'QuoteItemService';

    /**
     * Create quote item
     *
     * @param product
     * @param qty
     * @returns {{item_id: number, parent_item_id: null, quote_id: null, product_id, is_virtual, sku: *|string|string, name, description: string, additional_data: string, is_qty_decimal: number, qty: *, price: number, base_price: number, discount_percent: number, discount_amount: number, base_discount_amount: number, tax_percent: number, tax_amount: number, base_tax_amount: number, row_total: number, base_row_total: number, row_total_with_discount: number, product_type: *, base_tax_before_discount: number, tax_before_discount: number, price_incl_tax: number, base_price_incl_tax: number, row_total_incl_tax: number, base_row_total_incl_tax: number, product: {} & any}}
     */
    createItem(product, qty) {
        return {
            item_id: new Date().getTime(),
            parent_item_id: null,
            quote_id: null,
            product_id: product.id,
            is_virtual: (
                product.is_virtual
                || (
                    product.type_id === ProductTypeConstant.GIFT_CARD
                    && product.gift_card_price_config.gift_card_type !== GiftCardProductConstant.GIFT_CARD_TYPE_PHYSICAL
                )
            ) ? 1 : 0,
            sku: product.sku,
            name: product.name,
            description: '',
            additional_data: '',
            is_qty_decimal: 0,
            qty: qty,
            price: 0,
            base_price: 0,
            discount_percent: 0,
            discount_amount: 0,
            base_discount_amount: 0,
            tax_percent: 0,
            tax_amount: 0,
            base_tax_amount: 0,
            row_total: 0,
            base_row_total: 0,
            row_total_with_discount: 0,
            product_type: product.type_id,
            base_tax_before_discount: 0,
            tax_before_discount: 0,
            price_incl_tax: 0,
            base_price_incl_tax: 0,
            row_total_incl_tax: 0,
            base_row_total_incl_tax: 0,
            weight: product.weight,
            product: Object.assign({}, product)
        }
    }

    /**
     * Get price display in cart
     *
     * @param item
     * @param quote
     * @return {*}
     */
    getDisplayPrice(item, quote) {
        let price = 0;
        if (TaxHelper.shoppingCartDisplayPriceIncludeTax()) {
            price = item.row_total_incl_tax;
        } else {
            price = item.row_total;
        }
        if (WeeeHelper.priceDisplayTypeIncludeFPT()) {
            price = NumberHelper.addNumber(price, WeeeDataService.getCartItemAmount([item], quote));
        }
        return CurrencyHelper.format(price, null, null);
    }

    /**
     * check show original price
     * @param item
     * @returns {boolean}
     */
    showOriginalPrice(item, quote) {
        let showOriginal = false;
        if(typeof item.custom_price !== 'undefined' && item.custom_price !== null){
            showOriginal = true;
        }else{
            let finalPrice = PriceService.getPriceService(item.product).getFinalPrice(item.qty, item.product, quote, item);
            if(finalPrice !== item.price){
                showOriginal = true;
            }
        }
        return showOriginal;
    }


    /**
     * Get price display in cart
     *
     * @param item
     * @param quote
     * @return {*}
     */
    getDisplayOriginalPrice(item, quote) {
        let originalPrice = 0;
        if (TaxHelper.shoppingCartDisplayPriceIncludeTax()) {
            originalPrice = item.pos_original_price_incl_tax ? item.pos_original_price_incl_tax * item.qty : 0;
        } else {
            originalPrice = item.pos_original_price_excl_tax ? item.pos_original_price_excl_tax * item.qty : 0;
        }
        if (WeeeHelper.priceDisplayTypeIncludeFPT()) {
            originalPrice = NumberHelper.addNumber(originalPrice, WeeeDataService.getCartItemAmount([item], quote));
        }
        return CurrencyHelper.format(originalPrice, null, null);
    }

    /**
     * Get price display in cart
     *
     * @param item
     * @param quote
     * @return {*}
     */
    getProductListDisplayPrice(item, quote) {
        let price = 0;
        if (item) {
            if (TaxHelper.productListDisplayPriceIncludeTax()) {
                price = item.base_price_incl_tax;
            } else {
                price = item.base_price;
            }
            if (WeeeHelper.priceDisplayTypeIncludeFPT()) {
                price = NumberHelper.addNumber(price, WeeeDataService.getProductListItemAmount(item, quote));
            }
        }
        return price;
    }

    /**
     * Checking can we ship product separately (each child separately)
     * or each parent product item can be shipped only like one item
     *
     * @return {boolean}
     */
    isShipSeparately(item, quote) {
        let shipmentType = null;
        if (item.parent_item_id) {
            shipmentType = this.getParentItem(quote, item).product.shipment_type;
        } else {
            shipmentType = item.product.shipment_type;
        }
        return shipmentType !== null && +shipmentType === 1;
    }
}

/** @type QuoteItemService */
let quoteItemService = ServiceFactory.get(QuoteItemService);

export default quoteItemService;