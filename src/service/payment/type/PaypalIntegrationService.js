import {PaymentAbstract} from "./PaymentAbstract";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import OmcPayment from "../../../data/omc/OmcPayment";
import CheckoutService from "../../checkout/CheckoutService";
import PaymentConstant from "../../../view/constant/PaymentConstant";

export class PaypalIntegration extends PaymentAbstract{
    code = PaymentConstant.PAYPAL_INTEGRATION;
    payload = {};


    prepare() {
        let order  = this.order ? {...this.order} : CheckoutService.convertQuoteToOrder(this.quote);
        /**
         *
         * @type {OrderResourceModel} orderResource
         */

        let addresses = order.addresses.map(address => {
            return {
                firstname: address.firstname,
                lastname: address.lastname,
                street: address.street,
                city: address.city,
                country_id: address.country_id,
                postcode: address.postcode,
                region: address.region,
                telephone: address.telephone,
            }
        });

        let items = order.items.map(item => {
            return {
                name: item.name,
                qty_ordered: item.qty_ordered,
                is_virtual: item.is_virtual,
                price_incl_tax: item.price_incl_tax,
            }
        });

        let payment = this.payment;
        delete payment['card_type'];

        this.payload = {
            addresses,
            items,
            payments: [payment],
            store_currency_code: CurrencyHelper.getCurrentCurrencyCode(),
            customer_email: order.customer_email,
            order_increment_id: order.increment_id,
        };


        return this;
    }

    /**
     *
     * @return {Promise<*>}
     */
    async execute() {
        try {
            this.prepare();
            let directPaymentResponse = await (new OmcPayment()).directPayment(this.payload);

            if (directPaymentResponse.error) {
                return {
                    errorMessage: directPaymentResponse.message
                }
            }

            return {
                reference_number: directPaymentResponse['TransactionID'],
                tempOrderIncrementId: this.payload.order_increment_id,
            }
        } catch (error) {
            return {
                errorMessage: error.message.toString()
            }
        }
    }
}