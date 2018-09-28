import CoreService from "../CoreService";
import StockResourceModel from "../../resource-model/catalog/StockResourceModel";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import SimpleProductStockService from "./stock/SimpleProductService";
import ConfigurableProductStockService from "./stock/ConfigurableProductService";
import BundleProductStockService from "./stock/BundleProductService";
import NumberHelper from "../../helper/NumberHelper";
import CheckoutHelper from "../../helper/CheckoutHelper";
import StockHelper from "../../helper/StockHelper";

export class StockService extends CoreService {
    static className = 'StockService';
    resourceModel = StockResourceModel;
    stockServices = {
        simple: SimpleProductStockService,
        configurable: ConfigurableProductStockService,
        bundle: BundleProductStockService
    };

    /**
     * Get product stock service by product type
     *
     * @param {object} product
     * @return {*}
     */
    getProductStockService(product = null) {
        if (product) {
            if (typeof product === 'string' && this.stockServices[product]) {
                return this.stockServices[product];
            }
            if (product.type_id && this.stockServices[product.type_id]) {
                return this.stockServices[product.type_id];
            }
        }
        return this.stockServices.simple;

    }

    /**
     * get available qty of config product child
     * @param productId
     * @returns {Promise<any>|Object|*}
     */
    getAvailableQty(productId) {
        return this.getResourceModel().getAvailableQty(productId);
    }

    /**
     * get external stock
     * @param productId
     * @returns {*}
     */
    getExternalStock(productId) {
        return this.getResourceModel().getExternalStock(productId);
    }

    /**
     *
     * @param product
     * @return {{min: number, max: *|number, qtyIncrement: *|number, isQtyDecimal: *|boolean}}
     */
    getStockInfo(product) {
        let productStockService = this.getProductStockService(product);
        let minSaleQty = productStockService.getMinSaleQty(product) * 1;
        let qtyIncrement = productStockService.getQtyIncrement(product) * 1;
        let isQtyDecimal = productStockService.isQtyDecimal(product);
        let maxSaleQty = productStockService.getMaxSaleQty(product);
        let minQty = productStockService.getOutOfStockThreshold(product);
        let productQty = productStockService.getProductQty(product);
        let maxSaleQtyPerQtyIncrement = maxSaleQty % qtyIncrement;
        /**
         * max = Min(maximumQty, available)
         * maximumQty =
         *   - maxSaleQty neu max sale qty chia het cho qty increment hoặc allow to add out of stock product
         *   - 1 so < maxSaleQty va chia het cho qty increment
         *   - la qty increment neu maxSaleQty < qty increment
         * available =
         *   - Available qty - outOfStockThreshold neu no chia het cho qty increment
         *   - int ( (Available qty - outOfStockThreshold) / qty increment ) * qty increment
         * */
        let max =
            (maxSaleQtyPerQtyIncrement === 0 || CheckoutHelper.isAllowToAddOutOfStockProduct())
                ? maxSaleQty :
                maxSaleQty > qtyIncrement ?
                    NumberHelper.multipleNumber((maxSaleQty / qtyIncrement), qtyIncrement) :
                    qtyIncrement;
        if (!CheckoutHelper.isAllowToAddOutOfStockProduct() && productStockService.isManageStock(product)) {
            let available = (productQty - minQty) % qtyIncrement === 0
                ? (productQty - minQty) :
                NumberHelper.multipleNumber(
                    (NumberHelper.minusNumber(productQty, minQty) / qtyIncrement),
                    qtyIncrement
                );
            max = Math.min(max, available);
        }
        let isEnableQtyIncrements = productStockService.isEnableQtyIncrements(product);

        return {
            min: Math.max(minSaleQty, qtyIncrement),
            max,
            minSaleQty,
            maxSaleQty,
            qtyIncrement,
            isQtyDecimal,
            isEnableQtyIncrements,
        }
    }

    /**
     * Get list product by product id
     *
     * @param productIds
     * @returns {*|Promise<any>}
     */
    getListByProductIds(productIds) {
        return this.getResourceModel().getResourceOffline().getListByProductIds(productIds);
    }

    /**
     * Retrieve can Manage Stock
     *
     * @param stockItem
     * @return {*}
     */
    getManageStock(stockItem) {
        if (stockItem.use_config_manage_stock) {
            return StockHelper.isManageStock()
        }
        return stockItem.manage_stock;
    }

    /**
     * Retrieve minimal quantity available for item status in stock
     *
     * @param stockItem
     */
    getMinQty(stockItem) {
        if (stockItem.use_config_min_qty) {
            return StockHelper.getMinQty();
        }
        return stockItem.min_qty;
    }

    /**
     * Is stock item qty decimal
     *
     * @param stockItem
     * @return {boolean}
     */
    isQtyDecimal(stockItem) {
        return !!stockItem.is_qty_decimal;
    }
}

/** @type StockService */
let stockService = ServiceFactory.get(StockService);

export default stockService;

