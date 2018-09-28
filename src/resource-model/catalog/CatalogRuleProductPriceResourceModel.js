import AbstractResourceModel from "../AbstractResourceModel";

export default class CatalogRuleProductPriceResourceModel extends AbstractResourceModel {
    static className = 'CatalogRuleProductPriceResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'CatalogRuleProductPrice'};
    }

    /**
     * get not existed ids
     * @param ruleProductPriceIds
     * @return {*|Promise|Promise<Array>}
     */
    getNotExistedIds(ruleProductPriceIds) {
        return this.getResourceOffline().getNotExistedIds(ruleProductPriceIds);
    }

    /**
     * get catalog rule product price ids
     * @param queryService
     * @return {*|Promise<any>}
     */
    getIds(queryService = {}) {
        return this.getResourceOnline().getIds(queryService);
    }
}