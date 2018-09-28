import SyncConstant from '../constant/SyncConstant';

export default {
    /**
     * set default data in table sync
     * @returns {{type: string}}
     */
    setDefaultSyncDB: () => {
        return {
            type: SyncConstant.SET_DEFAULT_SYNC_DB
        }
    },

    /**
     * set default data in table success
     * @returns {{type: string}}
     */
    setDefaultSyncDBSuccess: () => {
      return {
          type: SyncConstant.SET_DEFAULT_SYNC_DB_SUCCESS
      }
    },

    /**
     * action sync data
     * @return type
     */
    syncData: () => {
        return {
            type: SyncConstant.SYNC_DATA
        }
    },

    /**
     * action sync data product
     * @return type, object
     */
    syncDataWithType: (data = {}) => {
        return {
            type: SyncConstant.SYNC_DATA_WITH_TYPE,
            data: data
        }
    },

    /**
     * action check sync data finish
     * @param isSyncDB
     * @returns {{type: string, isSyncDB: boolean}}
     */
    checkSyncDataFinish: (isSyncDB = false) => {
        return {
            type: SyncConstant.CHECK_SYNC_DATA_FINISH,
            isSyncDb: isSyncDB
        }
    },

    /**
     * sync data finish result
     *
     * @param isSync
     * @returns {{type: string, isSync: string}}
     */
    syncDataFinishResult: (isSync = SyncConstant.ONLINE_MODE) => {
        return {
            type: SyncConstant.CHECK_SYNC_DATA_FINISH_RESULT,
            isSync: isSync
        }
    },

    /**
     * sync action log
     * @returns {{type: string}}
     */
    syncActionLog: () => {
        return {
            type: SyncConstant.SYNC_ACTION_LOG
        }
    },

    /**
     * sync action log success
     * @returns {{type: string}}
     */
    syncActionLogSuccess: () => {
        return {
            type: SyncConstant.SYNC_ACTION_LOG_SUCCESS
        }
    },

    /**
     * action update data
     * @return type
     */
    updateData: () => {
        return {
            type: SyncConstant.UPDATE_DATA
        }
    },

    /**
     * action update data with type
     * @param object data sync data object
     * @return object
     */
    updateDataWithType: (data = {}) => {
        return {
            type: SyncConstant.UPDATE_DATA_WITH_TYPE,
            data: data
        }
    },

    /**
     * action update data finish
     * @param {object} data
     * @param {object} items
     * @return type
     */
    updateDataFinish: (data = {}, items = {}) => {
        return {
            type: SyncConstant.UPDATE_DATA_FINISH,
            data: data,
            items: items,
        }
    },

    /**
     * action delete data finish
     * @param {object} data
     * @param {object} ids
     * @return type
     */
    deleteDataFinish: (data = {}, ids = {}) => {
        return {
            type: SyncConstant.DELETE_DATA_FINISH,
            data: data,
            ids: ids,
        }
    },

    /**
     * action update data finish result
     * @param {object} data
     * @return type
     */
    updateDataFinishResult: (data = {}) => {
        return {
            type: SyncConstant.UPDATE_DATA_FINISH_RESULT,
            data: data,
        }
    },

    /**
     * action change mode
     * @param mode
     * @return {{type: string, mode: *}}
     */
    changeMode: (mode) => {
        return {
            type: SyncConstant.CHANGE_MODE,
            mode: mode,
        }
    }
}
