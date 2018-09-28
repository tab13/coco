import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import ProductResourceModel from "../../resource-model/catalog/ProductResourceModel";
import CheckoutHelper from "../../helper/CheckoutHelper";
import ProductTypeConstant from "../../view/constant/ProductTypeConstant";
import StockService from "./StockService";

export class ProductService extends CoreService {
    static className = 'ProductService';
    resourceModel = ProductResourceModel;

    /**
     * Call ProductResourceModel request get list product
     * @param searchKey
     * @param pageSize
     * @param currentPage
     * @returns {Object}
     */
    getProductList(queryService) {
        return this.getList(queryService);
    }

    /**
     * Get options product
     *
     * @param productId
     * @return {*|Promise<any>}
     */
    getOptions(productId) {
        return this.getResourceModel().getOptions(productId);
    }

    /**
     * Get options product and stock children product
     *
     * @param productId
     * @return {*|Promise<any>}
     */
    getOptionsAndStockChildrens(productId) {
        return this.getResourceModel().getOptionsAndStockChildrens(productId);
    }

    /**
     * Get stock from product ids
     *
     * @param productIds
     * @return {*|Promise<any>}
     */
    getStockProducts(productIds) {
        return this.getResourceModel().getStockProducts(productIds);
    }

    /**
     * Get list product ids from response get list product
     * @param response
     * @return {*|Array}
     */
    getProductIdsFromResponse(response) {
        return this.getResourceModel().getProductIdsFromResponse(response);
    }

    /**
     * Add stock for product
     *
     * @param response
     * @param stocks
     */
    addStockProducts(response, stocks) {
        return this.getResourceModel().addStockProducts(response, stocks);
    }

    /**
     * get stocks data
     * @param response
     * @return {Promise<*>}
     */
    async getStocksDataForResponse(response) {
        let productIds = this.getProductIdsFromResponse(response);
        if (!productIds.length) {
            return response;
        } else {
            try {
                let stocks = await this.getStockProducts(productIds);
                if (stocks) {
                    this.addStockProducts(response, stocks);
                }
                return response;
            } catch (e) {
                return response;
            }
        }
    }

    /**
     * Call ProductResourceModel request search product by barcode
     * @param code
     * @returns {*|{type: string, code: *}}
     */
    searchByBarcode(code) {
        return this.getResourceModel().searchByBarcode(code);
    }

    /**
     * Check product is composite
     *
     * @param product
     * @return {boolean}
     */
    isComposite(product) {
        return [
            ProductTypeConstant.CONFIGURABLE,
            ProductTypeConstant.BUNDLE,
            ProductTypeConstant.GROUPED
        ].includes(product.type_id);
    }

    /**
     * @param product
     * @return {boolean}
     */
    isSalable(product) {
        if (CheckoutHelper.isAllowToAddOutOfStockProduct()) {
            return product.status;
        }
        if (!this.isComposite(product)) {
            let productStockService = StockService.getProductStockService(product);
            if (!productStockService.isManageStock(product)) {
                return true;
            }
            return productStockService.verifyStock(product);
        }
        return product.is_salable === 1;
    }


}

/** @type ProductService */
let productService = ServiceFactory.get(ProductService);

export default productService;
