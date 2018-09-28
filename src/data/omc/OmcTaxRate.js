import OmcAbstract from "./OmcAbstract";

export default class OmcTaxRate extends OmcAbstract {
    static className = 'OmcTaxRate';
    get_list_api = this.get_list_tax_rate_api;

}