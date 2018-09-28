import AbstractResourceModel from "../AbstractResourceModel";

export default class PaymentResourceModel extends AbstractResourceModel {
    static className = 'PaymentResourceModel';

    /**
     * Constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {resourceName : 'Payment'};
    }

    /**
     * Call get all payment items
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        return this.getResourceOffline().getAll();
    }

    /**
     * get payment from code
     * @param code
     * @returns {Promise.<void>}
     */
    async getPaymentFromCode(code) {
        let payments = await this.getAll();
        return payments.find(item => item.code === code);
    }

    /**
     * get token stripe payment
     * @param payment
     * @returns {*|Promise}
     */
    getTokenStripePayment(payment, public_key) {
        return this.getResourceOnline().getTokenStripePayment(payment, public_key);
    }

    /**
     * stripe finish payment
     * @param token
     * @param amount
     * @returns {*|Promise.<any>}
     */
    stripeFinishPayment(token, amount) {
        return this.getResourceOnline().stripeFinishPayment(token, amount);
    }

    /**
     * get token authorize.net
     * @param payment
     * @param api_login
     * @param client_id
     * @param is_sandbox
     * @returns {*|Promise.<any>}
     */
    getTokenAuthorizeNetPayment(payment, api_login, client_id, is_sandbox) {
        return this.getResourceOnline().getTokenAuthorizeNetPayment(payment, api_login, client_id, is_sandbox);
    }

    /**
     * authorize.net finish payment
     * @param token
     * @param amount
     * @returns {*|Promise.<any>}
     */
    authorizeNetFinishPayment(token, amount) {
        return this.getResourceOnline().authorizeNetFinishPayment(token, amount);
    }
}