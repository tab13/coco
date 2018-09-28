import AbstractResourceModel from "../AbstractResourceModel";

export default class QuoteResourceModel extends AbstractResourceModel {
    static className = 'QuoteResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Quote'};
    }

    /**
     * Submig coupon code
     *
     * @param params
     * @returns {promise|*|rules}
     */
    submitCouponCode(params) {
        let rules = this.getResourceOnline().submitCouponCode(params);
        return rules;
    }

}