import OmcAbstract from "./OmcAbstract";

export default class OmcStock extends OmcAbstract {
    static className = 'OmcStock';
    get_list_api = this.get_list_stock_api;

    /**
     * get available qty from server
     * @param productId
     * @returns {Promise<any>}
     */
    getQty(productId) {
        // let params = {
        //     product_id: productId
        // };
        let url = this.getBaseUrl() + this.get_available_qty_api;
        if (productId) {
            url += '?product_id=' + productId;
        }
        return this.get(url);
    }

    /**
     * get external stock from server
     * @param product_id
     * @returns {Promise.<any>}
     */
    getExternalStock(product_id) {
        let url = this.getBaseUrl() + this.get_external_stock_api;
        if (product_id) {
            url += '/' + product_id;
        }
        return this.get(url);
    }
}

