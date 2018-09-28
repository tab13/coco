import {Component} from 'react';
import Singleton from "./Singleton"
import Config from '../config/Config';

export default class AbstractResourceModel extends Component{
    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            resourceName : ''
        }
    }

    /**
     * get resource depend on mode
     *
     * @return: object
     */
    getResource() {
        if(Config.mode === "offline") {
            return Singleton.getOffline(this.state.resourceName);
        }
        return Singleton.getOnline(this.state.resourceName);
    }

    /**
     * get online resource
     *
     * @return: object
     */
    getResourceOnline() {
        return Singleton.getOnline(this.state.resourceName);
    }

    /**
     * get offline resource
     *
     * @return: object
     */
    getResourceOffline() {
        return Singleton.getOffline(this.state.resourceName);
    }

    /**
     * Call API request get list product
     * @param searchKey
     * @returns {Object}
     */
    getList(searchKey) {
        return this.getResource().getList(searchKey);
    }

    /**
     * get data by id
     * @param id
     * @return {*|Promise<any>}
     */
    getById(id) {
        return this.getResource().getById(id);
    }

    /**
     * Save To IndexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveToDb(data) {
        return this.getResourceOffline().bulkPut(data);
    }

    /**
     * Request index data
     *
     * @returns {Promise|*|void}
     */
    reindexTable() {
        return this.getResourceOffline().reindexTable();
    }

    /**
     * Delete items
     * @param ids
     * @returns {Promise|*|void}
     */
    deleteItems(ids) {
        return this.getResourceOffline().bulkDelete(ids);
    }

    /**
     * get not existed ids
     * @param ids
     * @returns {Promise|*|void}
     */
    getNotExistedIds(ids) {
        return this.getResourceOffline().getNotExistedIds(ids);
    }

    /**
     * Get Data Online
     * @param queryService
     * @returns {Object|Promise<any>|*}
     */
    getDataOnline(queryService) {
        return this.getResourceOnline().getList(queryService);
    }

    /**
     * Get deleted items
     * @param queryService
     * @returns {Object|Promise<any>|*}
     */
    getDeleted(queryService) {
        return this.getResourceOnline().getDeleted(queryService);
    }

    /**
     * Clear table
     * @returns {*}
     */
    clear() {
        return this.getResourceOffline().clear();
    }

    /**
     * Get update data
     * @param queryService
     * @returns {Object|Promise<any>|*}
     */
    getUpdateData(queryService) {
        return this.getResourceOnline().getUpdateData(queryService);
    }
}

