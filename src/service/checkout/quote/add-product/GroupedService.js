import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import {AbstractAddProductService} from "./AbstractService";
import ItemService from "../ItemService";
import i18n from "../../../../config/i18n";
import NumberHelper from "../../../../helper/NumberHelper";
import CheckoutHelper from "../../../../helper/CheckoutHelper";

export class AddGroupedProductService extends AbstractAddProductService {
    static className = 'AddGroupedProductService';

    /**
     * Add configurable product
     *
     * @param quote
     * @param data
     * @return {*}
     */
    addProduct(quote, data) {
        let addedItemIds = [];
        let index = 0;
        let childrenItems = [];
        data.childrens.map(children => {
            let existedItem = this.getExistedItem(quote, children);
            if (existedItem) {
                existedItem.qty = NumberHelper.addNumber(existedItem.qty, children.qty);
                addedItemIds.push(existedItem.item_id);
            } else {
                let childrenItem = {...ItemService.createItem(children.product, children.qty), quote_id: quote.id};
                childrenItem.item_id = childrenItem.item_id + index;
                childrenItem.product_options = children.product_options;
                index++;
                childrenItems.push(childrenItem);
                addedItemIds.push(childrenItem.item_id);
            }
            return children;
        });

        quote.items.push(...childrenItems);

        return {
            success: true,
            quote: quote,
            added_item_id: (addedItemIds.length ? Math.max(...addedItemIds) : null)
        };
    }

    /**
     * Get existed item in cart
     *
     * @param quote
     * @param children
     * @return {*}
     */
    getExistedItem(quote, children) {
        let existedItem = null;
        let items = this.getItemsByProductId(quote, children.product.id);
        if (items && items.length) {
            existedItem = items.find(item => {
                let cartItemCustomOptions = item.product_options;
                let addItemCustomOptions = children.product_options;
                if (!cartItemCustomOptions) {
                    return false;
                }
                if (!cartItemCustomOptions.super_product_config) {
                    return false;
                }
                let cartItemSuperProductConfig = cartItemCustomOptions.super_product_config;
                let addItemSuperProductConfig = addItemCustomOptions.super_product_config;
                if (!cartItemSuperProductConfig.product_code || !cartItemSuperProductConfig.product_type ||
                    !cartItemSuperProductConfig.product_id) {
                    return false;
                }
                if (cartItemSuperProductConfig.product_type !== addItemSuperProductConfig.product_type) {
                    return false;
                }
                if (cartItemSuperProductConfig.product_id !== addItemSuperProductConfig.product_id) {
                    return false;
                }
                return true;
            });
        }
        return existedItem
    }

    /**
     *
     * @param product
     * @param qty
     * @param totalQty
     * @return {*}
     */
    validateChildrenQty(product, qty, totalQty) {
        let stock = product.stocks && product.stocks.length ? product.stocks[0] : null;
        if (!stock) {
            return {
                success: false,
                message: i18n.translator.translate("You cannot add this product to cart")
            };
        }
        let productStockService = this.getProductStockService(product);
        let maxSaleQty = productStockService.getMaxSaleQty(product);
        if (!CheckoutHelper.isAllowToAddOutOfStockProduct() && productStockService.isManageStock(product)) {
            let minQty = productStockService.getOutOfStockThreshold(product);
            let productQty = productStockService.getProductQty(product);
            maxSaleQty = Math.min(maxSaleQty, productQty - minQty);
        }
        maxSaleQty = Math.max(maxSaleQty, 0);
        if (totalQty > maxSaleQty) {
            return {
                success: false,
                message: i18n.translator.translate("The maximum qty to sell is {{qty}}", {qty: maxSaleQty})
            }
        }
        let isEnableQtyIncrement = productStockService.isEnableQtyIncrements(product);
        if (isEnableQtyIncrement) {
            let qtyIncrement = productStockService.getAddQtyIncrement(product);
            if (qty % qtyIncrement !== 0) {
                return {
                    success: false,
                    message: i18n.translator.translate("Please enter multiple of {{qty}}", {qty: qtyIncrement})
                }
            }
        }
        return {success: true};
    }
}

/** @type AddGroupedProductService */
let addGroupedProductService = ServiceFactory.get(AddGroupedProductService);

export default addGroupedProductService;