import OmcAbstract from "./OmcAbstract";
import PosService from "../../service/PosService";

export default class OmcOrder extends OmcAbstract {
    static className = 'OmcOrder';

    get_list_api = this.get_list_session_api;

    /**
     * get path shift save
     * @returns string
     */
    getPathShiftSave() {
        return this.shift_save_api;
    }

    /**
     * get path cash transaction save
     * @returns string
     */
    getPathCashTransactionSave() {
        return this.cash_transaction_save_api;
    }

    /**
     * Get list via api
     * @param queryService
     * @return {Promise<any>}
     */
    getList(queryService) {
        queryService.addFieldToFilter('pos_id', PosService.getCurrentPosId(), 'eq');
        return super.getList(queryService);
    }
}
