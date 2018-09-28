import OmcAbstract from "./OmcAbstract";
import Config from "../../config/Config"

export default class OmcPayment extends OmcAbstract {
    static className = 'OmcPayment';
    get_list_api = this.get_list_payment_api;
    paypal_direct_payment_api = this.store_url + "/V1/webpos/paypal/directPayment";
    paypal_send_invoice_api   = this.store_url + "/V1/webpos/paypal/sendInvoice";

    /**
     * get token stripe payment
     * @param payment
     * @param public_key
     * @returns {Promise}
     */
    getTokenStripePayment(payment, public_key) {
        let params = {
            'card[name]': payment.cc_owner ? payment.cc_owner : '',
            'card[number]' : payment.cc_number,
            'card[exp_month]' : payment.cc_exp_month,
            'card[exp_year]' : payment.cc_exp_year,
            'card[cvc]' : payment.cc_cid
        };
        let query = "";
        for (let key in params) {
            query += encodeURIComponent(key)+"="+encodeURIComponent(params[key])+"&";
        }

        return new Promise((resolve, reject) => {
            fetch(this.get_token_stripe_payment,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Bearer ' + public_key
                    },
                    mode: 'cors',
                    body: query
                })
                .then(response => response.json()
                    .then(function(data) {
                        if (response.ok) {
                            return resolve(data);
                        } else {
                            if (response.status === 401) {
                                let error = {
                                    "error": {
                                        "message": "Connection failed. " +
                                                   "Please contact admin to check the configuration of API.",
                                        "type": "invalid_request_error"
                                    }
                                };
                                return reject(error);
                            }
                            return reject(data);
                        }
                    })
                ).catch(error => reject(''))
        })
    }

    /**
     * stripe finish payment
     * @param token
     * @param amount
     * @returns {Promise.<any>}
     * @constructor
     */
    stripeFinishPayment(token, amount) {
        let params = {
            'token' : token,
            'amount' : amount
        };
        let url = this.getBaseUrl() + this.stripe_finish_payment;
        return this.post(url, params);
    }

    /**
     * get token authorize.net
     * @param payment
     * @param api_login
     * @param client_id
     * @param is_sandbox
     * @returns {Promise.<any>}
     */
    getTokenAuthorizeNetPayment(payment, api_login, client_id, is_sandbox) {
        let expirationDate = payment.cc_exp_month + payment.cc_exp_year.substring(2, payment.cc_exp_year.length);
        let currentTimestamp = new Date().getTime();
        let params = {
            "securePaymentContainerRequest" : {
                "merchantAuthentication" : {
                    "name": api_login,
                    "clientKey": client_id
                },
                "data": {
                    "type" : "TOKEN",
                    "id": Config.pos_id + currentTimestamp + "",
                    "token" : {
                        "cardNumber" : payment.cc_number,
                        "expirationDate": expirationDate,
                        "cardCode": payment.cc_cid,
                        "fullName": ''
                    }
                }
            }
        };
        payment.cc_owner ? params.securePaymentContainerRequest.data.token.fullName = payment.cc_owner :
            delete params.securePaymentContainerRequest.data.token.fullName;
        let url = is_sandbox ? this.get_token_authorizenet_sandbox : this.get_token_authorizenet_live;

        return new Promise((resolve, reject) => {
            fetch(url,
                {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    body: JSON.stringify(params)
                })
                .then(response => response.json()
                    .then(function(data) {
                        if (response.ok) {
                            return resolve(data);
                        } else {
                            return reject(data);
                        }
                    })
                ).catch(error => reject(''))
        });
    }

    /**
     * authorize finish payment
     * @param token
     * @param amount
     * @returns {Promise.<any>}
     * @constructor
     */
    authorizeNetFinishPayment(token, amount) {
        let params = {
            'token': token,
            'amount': amount
        };
        let url = this.getBaseUrl() + this.authorizenet_finish_payment;
        return this.post(url, params);
    }

    /**
     *
     * @param request
     * @return {Promise<any>}
     */
    paypalDirectPayment(request) {
        return this.post(this.getBaseUrl() + this.paypal_direct_payment_api, { request: request });
    }

    /**
     *
     * @param payload
     * @return {Promise<any>}
     */
    paypalSendInvoice(payload) {
        return this.post(this.getBaseUrl() + this.paypal_send_invoice_api, payload);
    }
}