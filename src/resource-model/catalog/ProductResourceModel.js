import AbstractResourceModel from "../AbstractResourceModel";

export default class ProductResourceModel extends AbstractResourceModel {
    static className = 'ProductResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName: 'Product'};
    }


    /**
     * Get options product
     *
     * @param productId
     * @return {*}
     */
    getOptions(productId) {
        return this.getResource().getOptions(productId);
    }

    /**
     * Get options product and stock of children
     *
     * @param productId
     * @return {*}
     */
    getOptionsAndStockChildrens(productId) {
        return this.getResourceOnline().getOptionsAndStockChildrens(productId);
    }

    /**
     * Get list product ids from response get list product
     * @param response
     * @return {*|Array}
     */
    getProductIdsFromResponse(response) {
        return this.getResourceOffline().getProductIdsFromResponse(response);
    }

    /**
     * Add stock for product
     *
     * @param response
     * @param stocks
     */
    addStockProducts(response, stocks) {
        return this.getResourceOffline().addStockProducts(response, stocks);
    }

    /**
     * Get stock from product ids
     *
     * @param productIds
     * @return {*|Promise<any>}
     */
    getStockProducts(productIds) {
        return this.getResource().getStockProducts(productIds);
    }

    /**
     * Search by barcode
     * @param code
     * @returns {*|{type: string, code: *}}
     */
    searchByBarcode(code) {
        return this.getResource().searchByBarcode(code);
    }
}
