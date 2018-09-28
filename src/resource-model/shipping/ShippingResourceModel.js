import AbstractResourceModel from "../AbstractResourceModel";

export default class ShippingResourceModel extends AbstractResourceModel {
    static className = 'ShippingResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Shipping'};
    }

    /**
     * Call get all shipping items
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        return this.getResourceOffline().getAll();
    }
}