export default {
    SESSION: 'session',
    TIMEOUT: 'timeout',
    STAFF_ID: 'staff_id',
    OLD_STAFF_ID: 'old_staff_id',
    STAFF_NAME: 'staff_name',
    MODE: 'mode',
    LOCATIONS: 'locations',
    LOCATION_ID: 'location_id',
    LOCATION_NAME: 'location_name',
    LOCATION_ADDRESS: 'location_address',
    LOCATION_TELEPHONE: 'location_telephone',
    POS_ID: 'pos_id',
    OLD_POS_ID: 'old_pos_id',
    POS_NAME: 'pos_name',
    CONFIG: 'config',
    COUNTRIES: 'countries',
    NEED_SYNC: 'need_sync',
    NEED_SYNC_SESSION: 'need_sync_session',
    NEED_UPDATE_SESSION: 'need_update_session',
    LOGO_URL: 'logo_url',
    COLOR_SWATCH: 'color_swatch',
    IS_SYNCING_ACTION_LOG: 'is_syncing_action_log',
    IS_FORCE_SIGNOUT: 'is_force_signout',
    DB_VERSION: 'db_version',
    NEED_SYNC_ORDER: 'need_sync_order',
    ORDER_STATUS: 'order_status',
    WEBSITE_ID: 'website_id',
    CURRENT_SESSION: 'current_session',
    CLOSE_SESSION: 'close_session',
    SHARING_ACCOUNT : 'sharing_account',

    /**
     * get value from local storage
     * @param key
     * @return string
     */
    get(key) {
        return localStorage.getItem(key);
    },

    /**
     * set data to local storage
     * @param key
     * @param value
     */
    set(key, value) {
        return localStorage.setItem(key, value);
    },

    /**
     * remove data to local storage
     * @param key
     * @return void
     */
    remove(key) {
        return localStorage.removeItem(key);
    },

    /**
     * set session to local storage
     * @param value
     */
    setSession(value){
        localStorage.setItem(this.SESSION, value);
    },

    /**
     * get session to local storage
     * @returns {string | null}
     */
    getSession(){
        return localStorage.getItem(this.SESSION);
    },

    /**
     * remove session
     */
    removeSession(){
        localStorage.removeItem(this.SESSION);
    }
}