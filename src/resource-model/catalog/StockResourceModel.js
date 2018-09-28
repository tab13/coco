import AbstractResourceModel from "../AbstractResourceModel";

export default class StockResourceModel extends AbstractResourceModel {
    static className = 'StockResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Stock'};
    }

    /**
     * get available qty
     * @param productId
     */
    getAvailableQty(productId) {
        return this.getResourceOnline().getQty(productId);
    }

    /**
     * get external stock
     * @param productId
     * @returns {*}
     */
    getExternalStock(productId) {
        return this.getResourceOnline().getExternalStock(productId);
    }
}
