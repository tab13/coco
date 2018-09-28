import {AbstractTotalService} from "./AbstractService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import PriceService from "../../../catalog/product/PriceService";
import QuoteItemService from "../ItemService";
import AddressService from "../AddressService";
import ProductTypeConstant from "../../../../view/constant/ProductTypeConstant";

export class QuoteTotalSubtotalService extends AbstractTotalService {
    static className = 'QuoteTotalSubtotalService';

    code = 'subtotal';

    /**
     * Collect address subtotal
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} total
     * @return {QuoteTotalSubtotalService}
     */
    collect(quote, address, total) {
        super.collect(quote, address, total);
        let virtualAmount = 0,
            baseVirtualAmount = 0;
        address.total_qty = 0;
        let isVirtual = this.isVirtual(quote);
        if ((isVirtual && AddressService.isBillingAddress(address)) ||
            (!isVirtual && AddressService.isShippingAddress(address))
        ) {
            quote.items.map((item, index) => {
                if (this._initItem(quote, address, item) && item.qty > 0) {
                    if (item.product.is_virtual) {
                        virtualAmount += item.row_total;
                        baseVirtualAmount += item.base_row_total;
                    }
                } else {
                    quote.items.splice(index, 1);
                }
                return true;
            });
        }
        total.virtual_amount = virtualAmount;
        total.base_virtual_amount = baseVirtualAmount;
        return this;
    }

    /**
     * Address item initialization
     *
     * @param {object} quote
     * @param {object} address
     * @param {object} item
     * @return {boolean}
     * @private
     */
    _initItem(quote, address, item) {
        let product = item.product;
        if (!product) {
            return false;
        }
        item.converted_price = null;
        let originalPrice = item.product.price;
        if (item.product_type === ProductTypeConstant.CONFIGURABLE) {
            let childItem = quote.items.find(x => x.parent_item_id === item.item_id);
            if (childItem) {
                originalPrice = childItem.product.price;
            }
        }

        product.customer_group_id = address.customer_id;
        if (item.parent_item_id && QuoteItemService.isChildrenCalculated(item, quote)) {
            /*let pricePrice = PriceService.getPriceService(item.product).getChildFinalPrice(
                null,
                null,
                item.product,
                item.qty,
                quote
            );
            this._calculateRowTotal(quote, item, pricePrice, originalPrice);*/
            let parentItem = QuoteItemService.getParentItem(quote, item);
            let pricePrice = PriceService.getPriceService(parentItem.product).getChildFinalPrice(
                parentItem.product,
                parentItem.qty,
                item.product,
                item.qty,
                quote,
                item
            );
            this._calculateRowTotal(quote, item, pricePrice, originalPrice);
        } else if (!item.parent_item_id) {
            let pricePrice = PriceService.getPriceService(item.product).getFinalPrice(item.qty, item.product, quote, item);

            this._calculateRowTotal(quote, item, pricePrice, originalPrice);
            this._addAmount(item.row_total);
            this._addBaseAmount(item.base_row_total);
            address.total_qty = address.total_qty ? address.total_qty + item.qty : item.qty;
        }
        return true;
    }

    /**
     * Processing calculation of row price for address item
     *
     * @param {object} quote
     * @param {object} item
     * @param {number} finalPrice
     * @param {number} originalPrice
     */
    _calculateRowTotal(quote, item, finalPrice, originalPrice) {
        if (!originalPrice) {
            originalPrice = finalPrice;
        }
        item.price = finalPrice;
        item.base_original_price = originalPrice;
        QuoteItemService.getOriginalPrice(item);
        QuoteItemService.calcRowTotal(item, quote);
        return this;
    }
}

let quoteTotalSubtotalService = ServiceFactory.get(QuoteTotalSubtotalService);

export default quoteTotalSubtotalService;