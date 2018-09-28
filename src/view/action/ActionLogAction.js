import SyncConstant from '../constant/SyncConstant';

export default {
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
    }
}