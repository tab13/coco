import CoreService from "../../CoreService";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import CatalogRuleProductPriceResourceModel from "../../../resource-model/catalog/CatalogRuleProductPriceResourceModel";
import QueryService from "../../QueryService";

export class CatalogRuleProductPriceService extends CoreService {
    static className = 'CatalogRuleProductPriceService';
    resourceModel = CatalogRuleProductPriceResourceModel;

    /**
     * get not existed ids
     * @param ruleProductPriceIds
     * @return {*|Promise<Array>|Promise}
     */
    getNotExistedIds(ruleProductPriceIds) {
        return this.getResourceModel().getNotExistedIds(ruleProductPriceIds);
    }

    /**
     * get catalog rule product price ids
     * @param queryService
     * @return {*|Promise<any>}
     */
    getIds(queryService = {}) {
        return this.getResourceModel().getIds(queryService);
    }

    /**
     * get all catalog rule product price ids
     * @return {Promise<*>}
     */
    async getAllIds() {
        let pageSize = 500000;
        let queryService = QueryService.reset();
        queryService.setPageSize(pageSize).setCurrentPage(1);
        let response = await this.getIds(queryService);
        let ids = response.items;
        if (ids.length === response.total_count) {
            return ids;
        }

        let totalPage = Number(Math.ceil(response.total_count / pageSize));
        for (let i = 2; i <= totalPage; i++) {
            queryService = QueryService.reset();
            queryService.setPageSize(pageSize).setCurrentPage(i);
            response = await this.getIds(queryService);
            ids = ids.concat(response.items);
        }
        return ids;
    }
}

/** @type CatalogRuleProductPriceService */
let catalogRuleProductPriceService = ServiceFactory.get(CatalogRuleProductPriceService);

export default catalogRuleProductPriceService;