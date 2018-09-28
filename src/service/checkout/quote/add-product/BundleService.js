import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import {AbstractAddProductService} from "./AbstractService";
import ItemService from "../ItemService";
import i18n from "../../../../config/i18n";
import NumberHelper from "../../../../helper/NumberHelper";
import CheckoutHelper from "../../../../helper/CheckoutHelper";

export class AddBundleProductService extends AbstractAddProductService {
    static className = 'AddBundleProductService';

    /**
     * Add configurable product
     *
     * @param quote
     * @param data
     * @return {*}
     */
    addProduct(quote, data) {
        let qty = parseFloat(data.qty);
        let addedItemId = null;
        let existedItem = this.getExistedItem(quote, data);
        if (existedItem) {
            existedItem.qty = NumberHelper.addNumber(existedItem.qty, qty);
            addedItemId = existedItem.item_id;
        } else {
            let parentItem = {...ItemService.createItem(data.product, qty), quote_id: quote.id};
            parentItem.product_options = data.product_options;
            parentItem.custom_options = data.product.custom_options;
            parentItem.has_children = true;
            if (data.has_custom_price) {
                parentItem = {
                    ...parentItem,
                    custom_price: data.custom_price,
                    os_pos_custom_price_reason: data.os_pos_custom_price_reason
                }
            }
            let suffixId = 1;
            let childrenItems = data.childrens.map(children => {
                let childrenItem = {...ItemService.createItem(children.product, children.qty), quote_id: quote.id};
                childrenItem.item_id = parentItem.item_id + "" + suffixId;
                childrenItem.parent_item_id = parentItem.item_id;
                childrenItem.product_options = children.product_options;
                suffixId++;
                return childrenItem;
            });
            quote.items.push(parentItem, ...childrenItems);
            addedItemId = parentItem.item_id;
        }
        return {
            success: true,
            quote: quote,
            added_item_id: addedItemId
        };
    }

    /**
     * Get existed item in cart
     *
     * @param quote
     * @param data
     * @return {*}
     */
    getExistedItem(quote, data) {
        let existedItem = null;
        let items = this.getItemsByProductId(quote, data.product.id);
        if (items && items.length) {
            existedItem = items.find(item => {
                let cartItemCustomOptions = item.custom_options;
                let addItemCustomOptions = data.product.custom_options;
                return cartItemCustomOptions.bundle_identity === addItemCustomOptions.bundle_identity;
            });
        }
        return existedItem
    }

    /**
     *
     * @param product
     * @param qty
     * @param totalQtys
     * @return {*}
     */
    validateOptionQty(product, qty, totalQtys) {
        let stock = product.stocks && product.stocks.length ? product.stocks[0] : null;
        if (!stock) {
            return {
                success: false,
                message: i18n.translator.translate("You cannot add this product to cart")
            };
        }
        let productStockService = this.getProductStockService(product);
        let minSaleQty = productStockService.getMinSaleQty(product);
        if (stock.is_qty_decimal) {
            minSaleQty = Math.max(0, minSaleQty);
        } else {
            minSaleQty = Math.max(1, minSaleQty);
        }
        if (minSaleQty > qty) {
            return {
                success: false,
                message: i18n.translator.translate(
                    'The minimum "{{product_name}}" qty to sell is {{qty}}',
                    {product_name: product.name, qty: minSaleQty}
                )
            }
        }
        let maxSaleQty = productStockService.getMaxSaleQty(product);
        if (!CheckoutHelper.isAllowToAddOutOfStockProduct() && productStockService.isManageStock(product)) {
            let minQty = productStockService.getOutOfStockThreshold(product);
            let productQty = productStockService.getProductQty(product);
            maxSaleQty = Math.min(maxSaleQty, productQty - minQty);
        }
        maxSaleQty = Math.max(maxSaleQty, 0);
        if (qty > maxSaleQty || totalQtys > maxSaleQty) {
            return {
                success: false,
                message: i18n.translator.translate(
                    'The maximum "{{product_name}}" qty to sell is {{qty}}',
                    {product_name: product.name, qty: maxSaleQty}
                )
            }
        }
        return {success: true};
    }
}

/** @type AddBundleProductService */
let addBundleProductService = ServiceFactory.get(AddBundleProductService);

export default addBundleProductService;