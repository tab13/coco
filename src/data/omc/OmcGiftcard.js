import OmcAbstract from "./OmcAbstract";

export default class OmcGiftcard extends OmcAbstract {
    static className = 'OmcGiftcard';
    /**
     * submit coupon code
     *
     * @param params
     *
     * @return promise
     */
    applyGiftcode(params) {
        let url = this.getBaseUrl() + this.apply_giftcode;
        return this.post(url, params);
    }

    /**
     * get list giftcodes by customer
     *
     * @param customer_id
     * @returns {Promise<any>}
     */
    reloadGiftCodes(customer_id){
        let url = this.getBaseUrl()+this.reload_giftcodes;
        if(customer_id) {
            url += '?customer_id=' + customer_id ;
        }
        return this.get(url);
    }
}

