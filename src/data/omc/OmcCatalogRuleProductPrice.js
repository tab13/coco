import OmcAbstract from "./OmcAbstract";

if (!window.Promise) {
    window.Promise = Promise;
}

export default class OmcCatalogRuleProductPrice extends OmcAbstract {
    static className = 'OmcCatalogRuleProductPrice';

    get_list_api = this.get_list_catalog_rule_product_price_api;

    /**
     * get catalog rule product price ids
     * @param queryService
     * @return {Promise<any>}
     */
    getIds(queryService = {}) {
        let queryParams = this.getQueryParams(Object.assign({}, queryService));
        return this.get(this.getBaseUrl()
            + this.get_catalog_rule_product_price_ids_api
            + '?' + encodeURI(queryParams.join('&')));
    }
}

