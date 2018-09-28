import LocalStorageHelper from "../helper/LocalStorageHelper";
import CoreService from "./CoreService";
import ServiceFactory from "../framework/factory/ServiceFactory"
import GLOBAL_VARIABLES from "../config/Config";

export class PosService extends CoreService{
    static className = 'PosService';
    /**
     * get pos name local storage
     *
     * @return {string}
     */
    getCurrentPosName() {
        return LocalStorageHelper.get(LocalStorageHelper.POS_NAME);
    }

    /**
     * get pos id from localStorage
     * @returns {*|string}
     */
    getCurrentPosId(){
        return LocalStorageHelper.get(LocalStorageHelper.POS_ID);
    }

    /**
     * get old pos id from localStorage
     * @returns {*|string}
     */
    getOldPosId(){
        return LocalStorageHelper.get(LocalStorageHelper.OLD_POS_ID);
    }

    /**
     * save pos id and pos name local storage
     *
     * @param posId
     * @param posName
     */
    saveCurrentPos(posId, posName) {
        LocalStorageHelper.set(LocalStorageHelper.POS_ID, posId);
        LocalStorageHelper.set(LocalStorageHelper.OLD_POS_ID, posId);
        LocalStorageHelper.set(LocalStorageHelper.POS_NAME, posName);
    }

    /**
     * remove pos id and pos name local storage
     *
     * @return void
     */
    removeCurrentPos() {
        LocalStorageHelper.remove(LocalStorageHelper.POS_ID);
        LocalStorageHelper.remove(LocalStorageHelper.POS_NAME);
        GLOBAL_VARIABLES.pos_id = '';
        GLOBAL_VARIABLES.pos_name = '';
    }
}

/**
 * @type {PosService}
 */
let posService = ServiceFactory.get(PosService);

export default posService;