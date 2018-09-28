import OmcAbstract from "./OmcAbstract";

export default class OmcTaxRule extends OmcAbstract {
    static className = 'OmcTaxRule';
    get_list_api = this.get_list_tax_rule_api;

}