import OmcAbstract from "./OmcAbstract";

export default class OmcColorSwatch extends OmcAbstract {
    static className = 'OmcColorSwatch';
    get_list_api = this.get_color_swatch_api;

}