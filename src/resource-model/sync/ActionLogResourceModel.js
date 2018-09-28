import AbstractResourceModel from "../AbstractResourceModel";

export default class ActionLogResourceModel extends AbstractResourceModel {
    static className = 'ActionLogResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'ActionLog'};
    }

    /**
     * get item
     * @param id
     */
    get(id) {
        return this.getResourceOffline().get(id);
    }

    /**
     * get all data in table action log
     * @returns {Promise<any>}
     */
    getAllDataActionLog() {
        return this.getResourceOffline().getAll();
    }

    /**
     * check dependent request in tabke action log
     * @param data
     * @returns {Promise<any>}
     */
    checkDependent(data) {
        return this.getResourceOffline().checkDependent(data.uuid, data.order)
    }

    /**
     * request action log
     * @param data
     * @returns {Promise<any>}
     */
    requestActionLog(data) {
        return this.getResourceOnline().requestActionLog(data.api_url, data.method, data.params);
    }

    /**
     * get primary key
     */
    getPrimaryKey() {
        return this.getResourceOffline().primary_key;
    }

    /**
     * get list offline
     * @param queryService
     * @returns {*|Promise<any>|Object}
     */
    getListOffline(queryService) {
        return this.getResourceOffline().getList(queryService);
    }

    /**
     * get last order of uuid
     * @param uuid
     * @returns {*|Promise<any>}
     */
    getLastOrder(uuid) {
        return this.getResourceOffline().getLastOrder(uuid);
    }
}