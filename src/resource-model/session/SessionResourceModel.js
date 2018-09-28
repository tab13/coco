import AbstractResourceModel from "../AbstractResourceModel";
import QueryService from "../../service/QueryService";
import ConfigHelper from "../../helper/ConfigHelper";
import DateTimeHelper from "../../helper/DateTimeHelper";
import SessionConstant from "../../view/constant/SessionConstant";

export default class SessionResourceModel extends AbstractResourceModel {
    static className = 'SessionResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName: 'Session'};
    }

    /**
     * get offline by id
     * @param id
     * @returns {*|Promise.<any>}
     */
    getOfflineById(id) {
        return this.getResourceOffline().getById(id);
    }

    /**
     * get path shift save
     * @returns string
     */
    getPathShiftSave() {
        return this.getResourceOnline().getPathShiftSave();
    }

    /**
     * get path cash transaction save
     * @returns string
     */
    getPathCashTransactionSave() {
        return this.getResourceOnline().getPathCashTransactionSave();
    }

    /**
     * get out date sessions
     * @return {Promise<{ids: Array}>}
     */
    async getOutDateSessions() {
        let queryService = QueryService.reset();
        let date = new Date();
        let configSessionSince = ConfigHelper.getConfig(SessionConstant.XML_PATH_CONFIG_SYNC_SESSION_SINCE);

        switch (configSessionSince) {
            case SessionConstant.SESSION_SINCE_24H:
                date.setDate(date.getDate() - 1);
                break;
            case SessionConstant.SESSION_SINCE_7_DAYS:
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
                break;
            case SessionConstant.SESSION_SINCE_MONTH:
                date = new Date(date.getFullYear(), date.getMonth(), 1);
                break;
            case SessionConstant.SESSION_SINCE_YTD:
                date = new Date(date.getFullYear(), 0, 1);
                break;
            case SessionConstant.SESSION_SINCE_2_YTD:
                date = new Date(date.getFullYear() - 1, 0, 1);
                break;
            default:
                date.setDate(date.getDate() - 1);
        }

        date = DateTimeHelper.getDatabaseDateTime(date.getTime());
        queryService.addFieldToFilter('opened_at', date, 'lt');
        queryService.addFieldToFilter('status', SessionConstant.SESSION_OPEN, 'neq');
        let result;
        let response = {ids: []};
        result = await this.getResourceOffline().getList(queryService);
        result.items.map(session => response.ids.push(session.shift_increment_id));
        return response;
    }
}