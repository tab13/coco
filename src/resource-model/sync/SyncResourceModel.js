import AbstractResourceModel from "../AbstractResourceModel";

export default class SyncResourceModel extends AbstractResourceModel {
    static className = 'SyncResourceModel';
    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Sync'};
    }

    /**
     * Call get all sync items
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        return this.getResourceOffline().getAll();
    }

    /**
     * Call Set default data of Sync Table
     */
    setDefaultData() {
        this.getResourceOffline().setDefaultData();
    }

    /**
     * Reset items's data of sync table in indexedDb
     * @param items
     * @returns {*}
     */
    resetData(items) {
        return this.getResourceOffline().resetData(items);
    }
}