import AbstractResourceModel from "../AbstractResourceModel";

export default class UserResourceModel extends AbstractResourceModel {
    static className = 'UserResourceModel';
    /**
     * constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'User'};
    }

    /**
     * login by username and password
     *
     * @return: promise
     */
    login(username, password) {
        return this.getResourceOnline().login(username, password);
    }

    /**
     *
     * @returns {*|promise|{type}}
     */
    continueLogin(){
        return this.getResourceOnline().continueLogin();
    }
    /**
     * user change information
     * @returns {Promise}
     */
    changeInformation() {
        return new Promise((resolve, reject) => {
            resolve('12131');
        });
    }

    /**
     * logout by session
     *
     * @return: Promise
     */
    logout() {
        return this.getResourceOnline().logout();
    }

    /**
     * get logo
     */
    getLogo() {
        return this.getResourceOnline().getLogo();
    }

    /**
     * get countries
     */
    getCountries() {
        return this.getResourceOnline().getCountries();
    }
}

