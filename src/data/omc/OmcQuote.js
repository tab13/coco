import OmcAbstract from "./OmcAbstract";

export default class OmcQuote extends OmcAbstract {
    static className = 'OmcQuote';
    /**
     * submit coupon code
     *
     * @param object
     *
     * @return promise
     */
    submitCouponCode(params) {
        let url = this.getBaseUrl() + this.submit_coupon_code;
        return this.post(url, params);
    }


}

