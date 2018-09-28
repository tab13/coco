import AbstractResourceModel from "../AbstractResourceModel";
import QueryService from "../../service/QueryService";
import SyncConstant from "../../view/constant/SyncConstant";

export default class ErrorLogResourceModel extends AbstractResourceModel {
    static className = 'ErrorLogResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'ErrorLog'};
    }

    /**
     * Get all data in table error log
     * @returns {Promise<any>}
     */
    getAllDataErrorLog() {
        // filter error log request place order
        let queryService = QueryService.reset();
        queryService.addFieldToFilter('action_type', SyncConstant.REQUEST_PLACE_ORDER, 'eq');
        return this.getResourceOffline().getList(queryService);
    }
}