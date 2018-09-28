import OmcAbstract from "./OmcAbstract";

export default class OmcShipping extends OmcAbstract {
    static className = 'OmcShipping';
    get_list_api = this.get_list_shipping_api;

}