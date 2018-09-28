import CoreService from "../CoreService";
import PaymentResourceModel from "../../resource-model/payment/PaymentResourceModel";
import ServiceFactory from "../../framework/factory/ServiceFactory"
import PaymentHelper from "../../helper/PaymentHelper";
import PaymentFactory from "../../factory/PaymentFactory";
import PaymentConstant from "../../view/constant/PaymentConstant";
import StoreCreditService from "../store-credit/StoreCreditService";

export class PaymentService extends CoreService {
    static className     = 'PaymentService';
           resourceModel = PaymentResourceModel;

    /**
     * Call PaymentResourceModel save to indexedDb
     *
     * @param data
     * @returns {Promise|*|void}
     */
    saveToDb(data) {
        return this.getResourceModel().saveToDb(data);
    }

    /**
     * Call PaymentResourceModel get all
     *
     * @returns {Object|*|FormDataEntryValue[]|string[]}
     */
    getAll() {
        let paymentResourceModel = new PaymentResourceModel();
        return paymentResourceModel.getAll();
    }

    async getByCode(code) {
        const list = await this.getAll();

        return list.find(payment => (payment.code === code));
    }

    /**
     * clear all data in indexedDB
     * @return {*}
     */
    clear() {
        return this.getResourceModel().clear();
    }

    /**
     * process single Payment
     * @param payment
     * @param index
     * @param object
     * @return {Promise<{order_increment_id: string|*}>}
     */
    async processSinglePayment(payment, index, object) {
        if (
            !payment.reference_number
            && !payment.is_paid
            && (
                PaymentHelper.hasUsingCreditCardForm(payment.method) ||
                PaymentHelper.hasUsingTerminal(payment.method)
            )
        ) {
            let paymentService = PaymentFactory.createByCode(payment.method);

            // if order => set order
            const isCreditmemo = object.isCreditmemo;
            const isCheckout   = !object.hasOwnProperty('increment_id');

            if (isCreditmemo) {
                paymentService.setCreditmemo(object);
            } else if ( isCheckout) {
                paymentService.setQuote(object);
            }
            else {
                paymentService.setOrder(object);
            }

            let response = await paymentService.setPayment(payment).execute();
            if (response.errorMessage) {
                return {
                    error  : true,
                    message: response.errorMessage,
                    response
                };
            }

            return {
                error: false,
                response
            };
        }

        return {
            error: false
        };

    }

    /**
     * process Payment
     * @param object
     * @return {Promise<{order_increment_id: string|*}>}
     */
    async processPayment(object) {

        let promises = [];
        object.payments.forEach(payment => {
            let process = Promise.resolve({});

            if (
                !payment.reference_number
                && !payment.is_paid
                && PaymentHelper.hasUsingCreditCardForm(payment.method)
            ) {
                let paymentService = PaymentFactory.createByCode(payment.method);

                // if order => set order
                if (object.increment_id) {
                    paymentService.setOrder(object);
                } else {
                    paymentService.setQuote(object);
                }

                process = paymentService.setPayment(payment).execute();
            }
            promises.push(process)
        });

        let responses       = await Promise.all(promises);
        let errors          = [];
        let processPayments = {};

        responses.forEach((response, index) => {
            processPayments[object.payments[index].method + index] = response;
            response.errorMessage && errors.push(response.errorMessage);
        });

        if (errors.length) {
            return {
                error  : true,
                message: errors.join(', '),
                processPayments
            };
        }

        return {
            error: false,
            processPayments
        };

    }

    /**
     * add and check payments
     * @param quote
     * @param payments
     * @param payments_selected
     * @param isUpdate
     * @return {*}
     */
    addAndCheckPayments(quote, payments, payments_selected, isUpdate = false) {
        // check store credit
        let payment_select_store_credit = payments_selected.find(
            (payment) => payment.method === PaymentConstant.STORE_CREDIT
        );
        let payment_store_credit        = payments.find((payment) => payment.code === PaymentConstant.STORE_CREDIT);
        if (payment_store_credit || payment_select_store_credit) {
            if (!isUpdate) {
                return payments;
            } else {
                payments = payments.filter(payment => payment.code !== PaymentConstant.STORE_CREDIT);
            }
        }
        let customer = quote.customer;
        return StoreCreditService.checkAndAddStoreCreditToListPayment(customer, payments);
    }
}

/**
 *
 * @type {PaymentService}
 */
let paymentService = ServiceFactory.get(PaymentService);

export default paymentService;