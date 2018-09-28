import AbstractResourceModel from "./AbstractResourceModel";

export default class MultiCartResourceModel extends AbstractResourceModel {
    static className = 'MultiCartResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Cart'};
    }

    /**
     * Search by staff Id
     * @param posId
     * @returns {*|{type: string, code: *}}
     */
    searchByPosId(posId) {
        return this.getResourceOffline().searchByPosId(posId);
    }

    /**
     * add new cart
     * @param cart
     * @returns {*|{type: string, code: *}}
     */
    add(cart) {
        return this.getResourceOffline().add(cart);
    }

    /**
     * update cart
     * @param cart
     * @returns {*|{type: string, code: *}}
     */
    update(cart) {
        return this.getResourceOffline().save(cart);
    }

    /**
     * delete cart
     * @param cart
     * @returns {*|{type: string, code: *}}
     */
    delete(cart) {
        return this.getResourceOffline().delete(cart.id);
    }
}