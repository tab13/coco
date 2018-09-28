import OmcAbstract from "./OmcAbstract";
import QueryService from "../../service/QueryService";
import OmcStock from "./OmcStock";

if (!window.Promise) {
    window.Promise = Promise;
}

export default class OmcProduct extends OmcAbstract {
    static className = 'OmcProduct';
    get_list_api = this.get_list_product_api;
    search_api = this.search_product_api;
    get_deleted_api = this.get_deleted_product_api;

    /**
     * Request api get option product
     *
     * @param productId
     * @return {Promise<any>}
     */
    getOptions(productId) {
        return this.get(this.getBaseUrl() + this.get_product_option + '?product_id=' + productId);
    }

    /**
     * Request api get option product
     *
     * @param productId
     * @return {Promise<any>}
     */
    getOptionsAndStockChildrens(productId) {
        return new Promise((resolve, reject) => {
            this.get(this.getBaseUrl() + this.get_product_option + '?product_id=' + productId).then(response => {
                let productIds = this.getProductIdsFromGetOptionsResponse(response);
                if (productIds.length > 0) {
                    this.getStockProducts(productIds).then(stocks => {
                        response.stocks = stocks;
                        resolve(response);
                    })
                } else {
                    resolve(response);
                }
            });
        })
    }

    /**
     * get product ids from option list
     *
     * @param response
     * @returns {Array}
     */
    getProductIdsFromGetOptionsResponse(response) {
        let productIds = [];
        if (response.config_option && response.config_option.length > 0) {
            response.config_option.map(option => {
                if (option.options && option.options.length > 0) {
                    option.options.map(item => {
                        if (item.products && item.products.length > 0) {
                            item.products.map(product => productIds.push(product.id));
                        }
                        return item;
                    });
                }
                return option;
            })
        }
        return productIds;
    };


    /**
     * Get stock products from product ids
     *
     * @param productIds
     */
    getStockProducts(productIds) {
        let queryService = Object.assign({}, QueryService);
        queryService.reset();
        queryService.addFieldToFilter('stock_item_index.product_id', productIds, 'in');
        return new Promise((resolve, reject) => {
            new OmcStock().getList(queryService).then(response => {
                let stocks = {};
                if (response.items && response.items.length > 0) {
                    response.items.map(stock => {
                        if (!stocks[stock.product_id]) {
                            stocks[stock.product_id] = [];
                        }
                        stocks[stock.product_id].push(stock);
                        return stock;
                    });
                }
                resolve(stocks);
            }).catch(error => {
                resolve({});
            })
        })
    }

    /**
     * Search product by barcode
     * @param code
     * @returns {Promise<any>}
     */
    searchByBarcode(code) {
        let queryService = Object.assign({}, QueryService);
        queryService.reset();
        queryService.addQueryString(code);
        queryService.setPageSize(16);
        queryService.setCurrentPage(1);
        let queryParams = this.getQueryParams(queryService);
        return this.get(this.getBaseUrl() + this.search_barcode_product_api + '?' + encodeURI(queryParams.join('&')));
    }
}

