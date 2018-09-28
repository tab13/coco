import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import {AbstractQuoteService} from "../AbstractService";
import ItemService from "../ItemService";
import {toast} from "react-toastify";
import StockService from "../../../catalog/StockService";
import i18n from "../../../../config/i18n";
import NumberHelper from "../../../../helper/NumberHelper";
import CheckoutHelper from "../../../../helper/CheckoutHelper";

export class AbstractAddProductService extends AbstractQuoteService {
    static className = 'AbstractAddProductService';

    /**
     * Get product stock service of product
     *
     * @param product
     * @return {*}
     */
    getProductStockService(product) {
        return StockService.getProductStockService(product);
    }

    /**
     * sort options list by key
     * @param options
     */
    sortOptionsByKey(options) {
        let result = {};
        Object.keys(options).sort().forEach(function (key) {
            result[key] = options[key];
        });
        return result;
    }

    /**
     * check 2 options are same
     * @param options1
     * @param options2
     * @return {boolean}
     */
    isSameOptions(options1, options2) {
        return JSON.stringify(this.sortOptionsByKey(options1)) === JSON.stringify(this.sortOptionsByKey(options2));
    }

    getAddQty(product, qty) {
        let productStockService = this.getProductStockService(product);
        let minSaleQty = productStockService.getMinSaleQty(product);
        if (minSaleQty > qty) {
            qty = 0;
            let qtyIncrement = productStockService.getQtyIncrement(product);
            while (minSaleQty > qty) {
                qty += qtyIncrement;
            }
        }
        return qty;
    }

    /**
     * Add product to quote
     *
     * @param {object} quote
     * @param {object} data
     * @return {*}
     */
    addProduct(quote, data) {
        let items = this.getItemsByProductId(quote, data.product.id);
        let updateItem = null;
        let totalItemsQtyIncart = this.getProductTotalItemsQtyInCart(items, quote);
        let addedItemId = null;
        if (items && items.length > 0) {
            updateItem = items.find(item => {
                if (!item.parent_item_id && !item.product_options) return true;
                if (!item.product_options || !data.product_options) return false;
                if (!item.product_options.info_buyRequest || !data.product_options.info_buyRequest) return false;
                return (
                    this.isSameOptions(
                        item.product_options.info_buyRequest.options,
                        data.product_options.info_buyRequest.options
                    )
                )

            });
            if (!updateItem) {
                data.qty = this.getAddQty(data.product, data.qty);
            }
        } else {
            data.qty = this.getAddQty(data.product, data.qty);
        }
        let totalQty = parseFloat(data.qty);
        totalQty = NumberHelper.addNumber(totalQty, totalItemsQtyIncart);
        let validateQty = this.validateQty(data.product, data.qty, totalQty);
        if (!validateQty.success) {
            toast.error(
                i18n.translator.translate(validateQty.message),
                {
                    className: 'wrapper-messages messages-warning'
                }
            );
            return validateQty;
        }

        if (!updateItem) {
            let item = {...ItemService.createItem(data.product, parseFloat(data.qty)), quote_id: quote.id};
            if (data.has_custom_price) {
                item = {
                    ...item,
                    custom_price: data.custom_price,
                    os_pos_custom_price_reason: data.os_pos_custom_price_reason
                }
            }
            if (data.product_options) {
                item.product_options = data.product_options;
            }
            quote.items.push(item);
            addedItemId = item.item_id;
        } else {
            quote.items.forEach(item => {
                if (item.item_id === updateItem.item_id) {
                    item.product = data.product;
                    item.qty = item.qty + data.qty;
                    addedItemId = updateItem.item_id;
                }
            })
        }
        return {
            success: true,
            quote: quote,
            added_item_id: addedItemId
        };
    }

    /**
     * Validate added qty
     *
     * @param {object} product
     * @param {number} qty
     * @param {number} totalQty
     * @return {object}
     */
    validateQty(product, qty, totalQty) {
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
        if (minSaleQty > totalQty) {
            return {
                success: false,
                message: i18n.translator.translate("The minimum qty to sell is {{qty}}", {qty: minSaleQty})
            }
        }
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

/** @type AbstractAddProductService */
let abstractAddProductService = ServiceFactory.get(AbstractAddProductService);

export default abstractAddProductService;