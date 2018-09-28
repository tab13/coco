import ResourceModelFactory from "../../framework/factory/ResourceModelFactory";
import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import TaxRateResourceModel from "../../resource-model/tax/TaxRateResourceModel";
import TaxRuleResourceModel from "../../resource-model/tax/TaxRuleResourceModel";
import Config from '../../config/Config';

export class TaxService extends CoreService{
    static className = 'TaxService';
    resourceModel = TaxRateResourceModel;
    ruleResourceModel = TaxRuleResourceModel;

    /**
     * get target Resource Model
     *
     * @return {class}
     */
    getRuleResourceModel() {
        return new (ResourceModelFactory.get(this.ruleResourceModel))();
    }

    /**
     * Call TaxRateResourceModel save to indexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveTaxRateToDb(data) {
        return this.getResourceModel().saveToDb(data);
    }

    /**
     * Call TaxRateResourceModel save to indexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveTaxRuleToDb(data) {
        return this.getRuleResourceModel().saveToDb(data);
    }

    /**
     * Save tax rate to config
     * 
     * @param data
     */
    saveTaxRateToConfig(data) {
        if(data) {
            Config.tax_rate = data;
        }
    }

    /**
     * Save tax rule to config
     *
     * @param data
     */
    saveTaxRuleToConfig(data) {
        if(data) {
            Config.tax_rule = data;
        }
    }
}

/**
 * @type {TaxService}
 */
let taxService = ServiceFactory.get(TaxService);

export default taxService;