import {PaymentAbstract} from "./PaymentAbstract";
import PaymentResourceModel from "../../../resource-model/payment/PaymentResourceModel";
import PaymentConstant from "../../../view/constant/PaymentConstant";

export class StripePayment extends PaymentAbstract {
    code = PaymentConstant.STRIPE_INTEGRATION;

    /**
     * run process stripe payment
     * @returns {Promise.<*>}
     */
    async execute() {
        let errorTransaction = "Transaction Error!";
        try {
            let paymentResourceModel = new PaymentResourceModel();
            // get publishable_key from payment
            let paymentFull = await paymentResourceModel.getPaymentFromCode(this.code);
            if (!paymentFull || !paymentFull.publishable_key) {
                errorTransaction = 'Connection failed. Please contact admin to check the configuration of API.';
                return {errorMessage: errorTransaction};
            }
            let public_key = paymentFull.publishable_key;
            // process get token key
            let tokenResponse = await paymentResourceModel.getTokenStripePayment(this.payment, public_key);
            // finish payment and response transaction_id
            if (tokenResponse && tokenResponse.id) {
                let transactionResponse = await paymentResourceModel.stripeFinishPayment(
                    tokenResponse.id,
                    this.payment.base_amount_paid
                );
                return {reference_number: transactionResponse};
            } else {
                return {errorMessage: errorTransaction};
            }
        } catch (error) {
            // error response from get token key
            if (error.error) {
                errorTransaction = error.error.message;
                return {errorMessage: errorTransaction};
            }
            // error response from finish payment
            if (error.message) {
                errorTransaction = error.message;
                return {errorMessage: errorTransaction};
            }
            return {errorMessage: errorTransaction};
        }
    }
}