import {PaymentAbstract} from "./PaymentAbstract";
import PaymentResourceModel from "../../../resource-model/payment/PaymentResourceModel";
import PaymentConstant from "../../../view/constant/PaymentConstant";

export class AuthorizeNet extends PaymentAbstract {
    code = PaymentConstant.AUTHORIZENET_INTEGRATION;

    /**
     * run process authorize.net payment
     * @returns {Promise.<*>}
     */
    async execute() {
        let errorKey = 'Connection failed. Please contact admin to check the configuration of API.';
        let errorTransaction = "Transaction Error!";
        try {
            let paymentResourceModel = new PaymentResourceModel();
            // get api_login and client_id from payment
            let paymentFull = await paymentResourceModel.getPaymentFromCode(this.code);
            if (!paymentFull || !paymentFull.api_login || !paymentFull.client_id) {
                return {errorMessage: errorKey};
            }
            let api_login = paymentFull.api_login;
            let client_id = paymentFull.client_id;
            let is_sandbox = paymentFull.is_sandbox;
            // process get token key
            let tokenResponse = await paymentResourceModel.getTokenAuthorizeNetPayment(
                this.payment,
                api_login,
                client_id,
                is_sandbox
            );
            // check error response from get token key
            if (
                tokenResponse && tokenResponse.messages &&
                tokenResponse.messages.resultCode.toUpperCase() === 'ERROR'
            ) {
                // check code response from (https://developer.authorize.net/api/reference/dist/json/responseCodes.json)
                if (tokenResponse.messages.message[0].code === 'E00007') {
                    return {errorMessage: errorKey}
                }
                return {errorMessage: tokenResponse.messages.message[0].text};
            }
            // finish payment and response transaction_id
            if (tokenResponse && tokenResponse.opaqueData) {
                let transactionResponse = await paymentResourceModel.authorizeNetFinishPayment(
                    tokenResponse.opaqueData.dataValue,
                    this.payment.base_amount_paid
                );
                return {reference_number : transactionResponse};
            } else {
                return {errorMessage: errorTransaction};
            }
        } catch (error) {
            // error response from finish payment
            if (error.message) {
                errorTransaction = error.message;
                return {errorMessage: errorTransaction};
            }
            return {errorMessage: errorTransaction};
        }
    }
}