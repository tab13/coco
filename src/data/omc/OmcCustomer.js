import OmcAbstract from "./OmcAbstract";

export default class OmcCustomer extends OmcAbstract {
    static className = 'OmcCustomer';
    get_list_api = this.get_list_customer_api;
    search_api = this.search_customer_api;
    get_deleted_api = this.get_deleted_customer_api;
    get_by_id_api = this.get_customer_by_id_api;
    get_update_data_api = this.get_update_data_customer_api;

    /**
     * check email
     * @param email
     * @returns {Promise.<any>}
     */
    checkEmail(email) {
        let url = this.base_url + this.check_email_api;
        let param = {
            customerEmail: email
        };
        return this.post(url, param);
    }

    /**
     * get path save customer
     * return string
     */
    getPathSaveCustomer() {
        return this.save_customer_api;
    }

    /**
     * get path edit customer
     * return string
     */
    getPathEditCustomer() {
        return this.edit_customer_api;
    }
}
