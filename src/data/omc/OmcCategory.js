import OmcAbstract from "./OmcAbstract";

export default class OmcCategory extends OmcAbstract {
    static className = 'OmcCategory';
    get_list_api = this.get_list_category_api;

}