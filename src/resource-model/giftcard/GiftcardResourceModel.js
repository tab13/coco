import AbstractResourceModel from "../AbstractResourceModel";

export default class GiftcardResourceModel extends AbstractResourceModel {
    static className = 'GiftcardResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName: 'Giftcard'};
    }

    /**
     * Apply gift code
     * @param params
     * @return {*|promise}
     */
    applyGiftcode(params) {
        let response = this.getResourceOnline().applyGiftcode(params);
        return response;
    }

    /**
     * Reload list gift codes
     * @param customer_id
     * @returns {*|promise}
     */
    reloadGiftCodes(customer_id){
        let response = this.getResourceOnline().reloadGiftCodes(customer_id);
        return response;
    }
}