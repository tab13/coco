import ConfigResourceModel from "../../resource-model/config/ConfigResourceModel";
import LocalStorageHelper from "../../helper/LocalStorageHelper";
import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory"

export class ConfigService extends CoreService {
    static className = 'ConfigService';
    resourceModel = ConfigResourceModel;

    /**
     * Save all config to Local storage
     * @param data
     */
    saveToLocalStorage(data) {
        LocalStorageHelper.set(LocalStorageHelper.CONFIG, JSON.stringify(data));
    }

    /**
     * get config from local storage
     * @returns {*|string}
     */
    getConfigFromLocalStorage() {
        return LocalStorageHelper.get(LocalStorageHelper.CONFIG);
    }
}

let configService = ServiceFactory.get(ConfigService);

export default configService;

