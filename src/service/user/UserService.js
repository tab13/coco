import UserResourceModel from '../../resource-model/user/UserResourceModel'
import ActionLogResourceModel from '../../resource-model/sync/ActionLogResourceModel'
import LocalStorageHelper from "../../helper/LocalStorageHelper";
import Config from '../../config/Config';
import PosService from "../PosService";
import CoreService from "../CoreService";
import SyncConstant from "../../view/constant/SyncConstant";
import ServiceFactory from "../../framework/factory/ServiceFactory";

/**
 * export UserService
 * @type {{prepareLogin: prepareLogin, login: login, handleAssignPos: assignPos}}
 */
export class UserService extends CoreService{
    static className = 'UserService';
    resourceModel = UserResourceModel;

    /**
     * login by username and password
     * @param username
     * @param password
     * @returns {promise}
     */
    login(username, password) {
        return this.getResourceModel().login(username, password);
    }

    /**
     *
     * @returns {promise}
     */
    continueLogin(){
        return this.getResourceModel().continueLogin();
    }

    /**
     * get logo
     */
    getLogo() {
        return this.getResourceModel().getLogo();
    }

    /**
     * get logo
     */
    getCountries() {
        return this.getResourceModel().getCountries();
    }

    /**
     * user change information
     * @param user_name
     * @param old_password
     * @param new_password
     */
    changeInformation(user_name, old_password, new_password) {
        let userResource = new UserResourceModel();
        let actionLogResource = new ActionLogResourceModel();
        let params = {
            staff: {
                user_name: user_name,
                old_password: old_password,
                new_password: new_password,
            },
            product_id: 123414
        };
        let url_api = userResource.getResourceOnline().getPathChangeInfomation();
        // actionLogResource.createDataActionLog(SyncConstant.TYPE_USER, url_api, SyncConstant.METHOD_POST, params);
        return userResource.changeInformation().then((key) => {
            params.id = key;
            actionLogResource.createDataActionLog(SyncConstant.TYPE_USER, url_api, SyncConstant.METHOD_POST, params);
        });
    }

    /**
     * check has pending sync request yet
     * call api log out and remove session from storage
     *
     * @return {Promise<{ok: boolean}>}
     */
     async logout() {
        try {
            await this.getResourceModel().logout();
        } catch (error) {
            // handle error
        } finally {
            this.removeStaff();
            this.removeSession();
            PosService.removeCurrentPos();
            this.removeWebsiteId();
        }

        return { ok: true };
    }

    /**
     * save session to local storage
     *
     * @param session
     */
    saveSession(session, timeout) {
        LocalStorageHelper.setSession(session);
        LocalStorageHelper.set(LocalStorageHelper.TIMEOUT, timeout);
        Config.session = session;
        Config.timeout = timeout;
    }

    /**
     * save staff id and staff name local storage
     *
     * @param staffId
     * @param staffName
     */
    saveStaff(staffId, staffName) {
        LocalStorageHelper.set(LocalStorageHelper.STAFF_ID, staffId);
        LocalStorageHelper.set(LocalStorageHelper.OLD_STAFF_ID, staffId);
        LocalStorageHelper.set(LocalStorageHelper.STAFF_NAME, staffName);
        Config.staff_id = staffId;
        Config.staff_name = staffName;
    }

    /**
     * save location and pos to local storage
     *
     * @param locations
     */
    saveLocations(locations) {
        LocalStorageHelper.set(LocalStorageHelper.LOCATIONS, locations);
    }

    /**
     * get session from local storage
     *
     * @param string
     */
    getSession() {
        return LocalStorageHelper.getSession();
    }

    /**
     * remove session from localStorage
     */
    removeSession(){
        LocalStorageHelper.removeSession();
    }

    /**
     * get old staff id from local storage
     * @return {*|string}
     */
    getOldStaffId() {
        return LocalStorageHelper.get(LocalStorageHelper.OLD_STAFF_ID);
    }

    /**
     * get staff id from local storage
     *
     * @param string
     */
    getStaffId() {
        return LocalStorageHelper.get(LocalStorageHelper.STAFF_ID);
    }

    /**
     * get staff name local storage
     *
     * @return {string}
     */
    getStaffName() {
        return LocalStorageHelper.get(LocalStorageHelper.STAFF_NAME);
    }

    /**
     * remove staff id and staff name local storage
     *
     * @return void
     */
    removeStaff() {
        LocalStorageHelper.remove(LocalStorageHelper.STAFF_ID);
        LocalStorageHelper.remove(LocalStorageHelper.STAFF_NAME);
    }

    /**
     * clear location pos from localStorage
     */
    clearLocationPosInLocalStorage() {
        LocalStorageHelper.remove(LocalStorageHelper.LOCATION_ID);
        LocalStorageHelper.remove(LocalStorageHelper.LOCATION_NAME);
        LocalStorageHelper.remove(LocalStorageHelper.POS_ID);
        LocalStorageHelper.remove(LocalStorageHelper.POS_NAME);
    }

    /**
     * get logo from local storage
     */
    getLocalLogo () {
        return LocalStorageHelper.get(LocalStorageHelper.LOGO_URL);
    }

    /**
     * save logo to local storage
     * @param logoUrl
     */
    saveLocalLogo (logoUrl) {
        LocalStorageHelper.set(LocalStorageHelper.LOGO_URL, logoUrl);
    }

    /**
     * get countries from local storage
     */
    getLocalCountries () {
        let localConfig =  LocalStorageHelper.get(LocalStorageHelper.COUNTRIES);
        return localConfig;
    }

    /**
     * save countries to local storage
     * @param countries
     */
    saveLocalCountries (countries) {
        let localConfig = LocalStorageHelper.get(LocalStorageHelper.COUNTRIES);
        localConfig = JSON.stringify(countries);
        LocalStorageHelper.set(LocalStorageHelper.COUNTRIES, localConfig);
        Config.countries = countries;
    }
    /**
     * get website id local storage
     *
     * @return {string}
     */
    getWebsiteId() {
        return LocalStorageHelper.get(LocalStorageHelper.WEBSITE_ID);
    }

    /**
     * save website id to local storage
     * @param websiteId
     * @return {UserService}
     */
    saveWebsiteId (websiteId) {
        LocalStorageHelper.set(LocalStorageHelper.WEBSITE_ID, websiteId);
        return this;
    }
    /**
     * remove website id to local storage
     * @return {UserService}
     */
    removeWebsiteId () {
        LocalStorageHelper.remove(LocalStorageHelper.WEBSITE_ID);
        return this;
    }

    /**
     *
     * @param sharingAccount
     */
    setSharingAccount(sharingAccount){
        LocalStorageHelper.set(LocalStorageHelper.SHARING_ACCOUNT, sharingAccount);
        return this;
    }

    /**
     * get sharing account local storage
     *
     * @return {string}
     */
    getSharingAccount() {
        return LocalStorageHelper.get(LocalStorageHelper.SHARING_ACCOUNT);
    }

}


/**
 * @type {UserService}
 */
const userService = ServiceFactory.get(UserService);

export default userService;
