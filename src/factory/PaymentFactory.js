import AbstractFactory from "../framework/factory/AbstractFactory";
import PaymentConstant from "../view/constant/PaymentConstant";
import {Cash} from "../service/payment/type/CashService";
import {PaymentAbstract} from "../service/payment/type/PaymentAbstract";
import {StripePayment} from "../service/payment/type/StripePaymentService";
import {AuthorizeNet} from "../service/payment/type/AuthorizeNetService";
import {PaypalDirect} from "../service/payment/type/PaypalDirectService";
import {PaypalIntegration} from "../service/payment/type/PaypalIntegrationService";
import {BamboraPaymentService} from "../service/payment/type/BamboraPaymentService";
import {PaymentStoreCreditService} from "../service/payment/type/PaymentStoreCreditService";
import {TyroPaymentService} from "../service/payment/type/TyroPaymentService";

class PaymentFactory extends AbstractFactory {
    map = {
        [PaymentConstant.CASH]                             : Cash,
        [PaymentConstant.AUTHORIZENET_INTEGRATION]         : AuthorizeNet,
        [PaymentConstant.STRIPE_INTEGRATION]               : StripePayment,
        [PaymentConstant.PAYPAL_DIRECTPAYMENT_INTERGRATION]: PaypalDirect,
        [PaymentConstant.PAYPAL_INTEGRATION]               : PaypalIntegration,
        [PaymentConstant.BAMBORA_INTEGRATION]              : BamboraPaymentService,
        [PaymentConstant.STORE_CREDIT]                     : PaymentStoreCreditService,
        [PaymentConstant.TYRO_INTEGRATION]                 : TyroPaymentService
    };

    /**
     *
     * @param code
     * @return {PaymentAbstract}
     */
    getByCode(code) {
        return this.map[code] || PaymentAbstract;
    }

    /**
     *
     * @param code
     * @return {PaymentAbstract}
     */
    createByCode(code) {
        return this.create(this.getByCode(code)).setCode(code);
    }
}

/**
 *
 * @type {PaymentFactory}
 */
const paymentFactory = (new PaymentFactory());

export default paymentFactory;