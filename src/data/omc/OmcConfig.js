import OmcAbstract from "./OmcAbstract";

export default class OmcConfig extends OmcAbstract {
    static className = 'OmcConfig';
    get_list_api = this.config_api;

}