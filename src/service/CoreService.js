
export default class CoreService {

    /**
     * get target Resource Model
     *
     * @return {class}
     */
    getResourceModel(resourceModel) {
        if(!resourceModel) {
            return new this.resourceModel();
        }
        return new resourceModel();
    }

    /**
     * Call ResourceModel request get list object
     * @param {object} queryService
     * @returns {Promise<any>}
     */
    getList(queryService) {
        return this.getResourceModel().getList(queryService);
    }

    /**
     * get data by id
     * @param id
     * @return {*|Promise<any>}
     */
    getById(id) {
        return this.getResourceModel().getById(id);
    }

    /**
     * Clear all data of table in indexedDb
     * @returns {*}
     */
    clear() {
        return this.getResourceModel().clear();
    }

    /**
     * Get Data online
     * @param queryService
     * @returns {*|Promise<any>}
     */
    getDataOnline(queryService) {
        return this.getResourceModel().getDataOnline(queryService);
    }

    /**
     * Get deleted items
     * @param queryService
     * @returns {*|Promise<any>}
     */
    getDeleted(queryService) {
        return this.getResourceModel().getDeleted(queryService);
    }

    /**
     * Call ProductResourceModel request save product to indexedDb
     * @param data
     * @returns {Promise|*|void}
     */
    saveToDb(data) {
        return this.getResourceModel().saveToDb(data);
    }

    /**
     * Delete items
     * @param ids
     * @returns {Promise|*|void}
     */
    deleteItems(ids) {
        return this.getResourceModel().deleteItems(ids);
    }

    /**
     * get not existed ids
     * @param ids
     * @returns {Promise|*|void}
     */
    getNotExistedIds(ids) {
        return this.getResourceModel().getNotExistedIds(ids);
    }

    /**
     * Call ProductResourceModel request index data
     * @returns {Promise|*|void}
     */
    reindexTable() {
        return this.getResourceModel().reindexTable();
    }

    /**
     * Get update data
     * @param queryService
     * @returns {Object|Promise<any>|*}
     */
    getUpdateData(queryService) {
        return this.getResourceModel().getUpdateData(queryService);
    }

    /**
     * check need update data
     * @return {boolean}
     */
    needUpdateData() {
        return true;
    }
}