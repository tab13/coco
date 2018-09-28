import OmcAbstract from "./OmcAbstract";

export default class OmcUser extends OmcAbstract {
    static className = 'OmcUser';
    /**
     * login with username and password
     *
     * @param string
     * @param string
     *
     * @return promise
     */
    login(username, password) {
        let params = {
            staff: {"username": username, "password": password}
        };

        let url = this.getBaseUrl() + this.login_api;
        return this.post(url, params);
    }

    continueLogin(){
        let url = this.getBaseUrl() + this.continue_login_api;
        return this.get(url);
    }

    /**
     * get logo form server
     */
    getLogo() {
        let url = this.getBaseUrl() + this.logo_api;
        return this.get(url);
    }

    /**
     * get countries form server
     */
    getCountries() {
        let url = this.getBaseUrl() + this.countries_api;
        return this.get(url);
    }

    /**
     * logout with session
     * @return {Promise}
     */
    logout() {
        return this.get(this.getBaseUrl() + this.logout_api);
    }

    /**
     * get path api change information
     * @return {string}
     */
    getPathChangeInfomation() {
        return this.change_information_api;
    }
}

