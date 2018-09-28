import {PaymentAbstract} from "./PaymentAbstract";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import OmcPayment from "../../../data/omc/OmcPayment";
import CheckoutService from "../../checkout/CheckoutService";
import PaymentConstant from "../../../view/constant/PaymentConstant";
import {toast} from "react-toastify";
import i18n from "../../../config/i18n";
import PaymentHelper from "../../../helper/PaymentHelper";

export class PaypalDirect extends PaymentAbstract{
    code = PaymentConstant.PAYPAL_DIRECTPAYMENT_INTERGRATION;
    payload = {};


    prepareDirectPayment() {
        let order  = this.order ? {...this.order} : CheckoutService.convertQuoteToOrder(this.quote);
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

        let payment = PaymentHelper.filterPaypalPaymentData(this.payment);

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

    prepareSendInvoice() {
        let order  = this.order ? {...this.order} : CheckoutService.convertQuoteToOrder(this.quote);
        let billing = {};
        let shipping = {};

        order.addresses.forEach(address => {
            let newAddress = {
                firstname: address.firstname,
                lastname: address.lastname,
                street: address.street,
                city: address.city,
                country_id: address.country_id,
                postcode: address.postcode,
                region: address.region,
                telephone: address.telephone ? address.telephone : 'NaN',
                email: this.payment.email,
            };

            if (address.address_type === 'billing') {
                billing = newAddress;
            }
            if (address.address_type === 'shipping') {
                shipping = newAddress;
            }
        });

        let ppItem = {
            name: '',
            qty: 1,
            unit_price: this.payment.amount_paid,
            tax_percent: '',
        };
        order.items.forEach(item => {
            ppItem.name += item.name;
        });

        let payment = this.payment;
        delete payment['card_type'];
        delete payment['shift_increment_id'];

        // $billing, $shipping, $items, $totals, $totalPaid, $currencyCode, $note
        this.payload = {
            billing,
            shipping,
            items: [ppItem],
            totals: [{
                code: 'grandtotal',
                amount: this.payment.amount_paid
            }],
            total_paid: 0,
            currency_code: CurrencyHelper.getCurrentCurrencyCode(),
            note: '',
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
            if (this.payment.isCardMode) {
                this.prepareDirectPayment();
                let directPaymentResponse = await (new OmcPayment()).paypalDirectPayment(this.payload);

                if (directPaymentResponse.error) {
                    return {
                        errorMessage: directPaymentResponse.message
                    }
                }

                return {
                    reference_number: directPaymentResponse['transaction_id'],
                    additionalData: {
                        increment_id: this.payload.order_increment_id,
                    }
                }
            }

            this.prepareSendInvoice();
            let sendInvoiceResponse = await (new OmcPayment()).paypalSendInvoice(this.payload);

            if (sendInvoiceResponse.error) {
                return {
                    errorMessage: sendInvoiceResponse.message
                }
            }

            toast.success(
                i18n.translator.translate("The email sending request has been saved in queue and will be sent shortly"),
                {
                    position: toast.POSITION.BOTTOM_CENTER,
                    className: 'wrapper-messages messages-success'
                }
            );

            const { invoice } = sendInvoiceResponse;

            return {
                pos_paypal_invoice_number: invoice.number,
                pos_paypal_invoice_id: invoice.id,
                additionalData: {
                    increment_id: this.payload.order_increment_id,
                }
            }

        } catch (error) {
            return {
                errorMessage: error.message.toString()
            }
        }
    }
}
