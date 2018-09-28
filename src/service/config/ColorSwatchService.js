import ColorSwatchResourceModel from "../../resource-model/catalog/ColorSwatchResourceModel";
import LocalStorageHelper from "../../helper/LocalStorageHelper";
import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory"
import Config from "../../config/Config";

export class ColorSwatchService extends CoreService {
    static className = 'ColorSwatchService';
    resourceModel = ColorSwatchResourceModel;

    /**
     * Save all ColorSwatch to Local storage
     * @param data
     */
    saveToLocalStorage(data) {
        LocalStorageHelper.set(LocalStorageHelper.COLOR_SWATCH, JSON.stringify(data));
        Config.swatch_config = data;
    }

    /**
     * get ColorSwatch from local storage
     * @returns {*|string}
     */
    getColorSwatchFromLocalStorage() {
        return LocalStorageHelper.get(LocalStorageHelper.COLOR_SWATCH);
    }
}

let colorSwatchService = ServiceFactory.get(ColorSwatchService);

export default colorSwatchService;