import PaymentConstant from "../view/constant/PaymentConstant";

export default {
    PROCESSED_STATUS: [
        PaymentConstant.PROCESSED_PAYMENT,
        PaymentConstant.PROCESS_PAYMENT_SUCCESS,
        PaymentConstant.PROCESS_PAYMENT_ERROR
    ],
    /**
     *
     * @param method
     * @return {boolean}
     */
    isFlatPayment(method) {
        return [
            PaymentConstant.CASH,
            PaymentConstant.CREDIT_CARD,
            PaymentConstant.STORE_CREDIT
        ].indexOf(method) !== -1
    },
    /**
     *
     * @param method
     * @return {boolean}
     */
    isPaypalDirect(method) {
        return method === PaymentConstant.PAYPAL_DIRECTPAYMENT_INTERGRATION
    },
    /**
     *
     * @return {string}
     */
    paypalPayViaEmailTitle() {
        return 'PayPal pay via email';
    },
    /**
     *
     * @param object
     * @return {boolean}
     */
    hasUsingGatewayPayment(object) {
        return object.payments.find(payment => {
            return this.hasUsingCreditCardForm(payment.method) && !payment.type
        });
    },
    /**
     *
     * @param method
     * @return {boolean}
     */
    hasUsingCreditCardForm(method) {
        return [
            PaymentConstant.AUTHORIZENET_INTEGRATION,
            PaymentConstant.STRIPE_INTEGRATION,
            PaymentConstant.PAYPAL_INTEGRATION,
            PaymentConstant.PAYPAL_DIRECTPAYMENT_INTERGRATION
        ].indexOf(method) !== -1;
    },

    /**
     *
     * @param method
     * @return {boolean}
     */
    hasUsingTerminal(method) {
        return [
            PaymentConstant.BAMBORA_INTEGRATION,
            PaymentConstant.TYRO_INTEGRATION,
        ].indexOf(method) !== -1;
    },

    /**
     * remove dump data
     * @param order
     * @return {{payments}}
     */
    filterOrderData(order) {
        if (!order.payments.length) {
            let newOrder = {...order};
            delete newOrder['payments'];
            return newOrder;
        }
        return {...order, payments: this.filterPaymentData(order.payments)};
    },
    /**
     * remove dump data
     * @param payments
     * @return {{payments}}
     */
    filterPaymentData(payments) {
        return payments.map(payment => {
            /**  remove cc information */
            delete payment['cc_owner'];
            delete payment['cc_number'];
            delete payment['cc_type'];
            delete payment['cc_exp_month'];
            delete payment['cc_exp_year'];
            delete payment['cc_cid'];
            delete payment['email'];
            delete payment['isCardMode'];
            delete payment['status'];
            delete payment['errorMessage'];
            delete payment['last4Digit'];
            // delete payment.is_pay_later;
            return payment;
        });
    },
    /**
     * remove dump data
     * @param payment
     * @return {{payments}}
     */
    filterPaypalPaymentData(payment) {
        delete payment['card_type'];
        delete payment['isCardMode'];
        delete payment['email'];
        delete payment['is_pay_later'];
        delete payment['status'];
        delete payment['errorMessage'];
        delete payment['last4Digit'];
        delete payment['shift_increment_id'];
        return payment;
    },
    /**
     *
     * @param processPayments
     * @param removedIndex
     * @return {*}
     */
    resortPayment(processPayments, removedIndex) {
        let newProcessPayments = {};
        Object.keys(processPayments).forEach(key => {
            let method   = key.substr(0, key.length - 1);
            let keyIndex = key.substr(key.length - 1) * 1;

            if (keyIndex < removedIndex) {
                newProcessPayments[key] = processPayments[key];
            }

            if (keyIndex > removedIndex) {
                newProcessPayments[method + (keyIndex - 1)] = processPayments[key];
            }
        });

        return newProcessPayments;
    },
    /**
     *
     * @param processPayments
     * @return {boolean}
     */
    hasPaidViaGatewaySuccess(processPayments) {
        let isCustomerPaidViaGateway = false;
        Object.values(processPayments).forEach(payment => {
            isCustomerPaidViaGateway |= payment.status === PaymentConstant.PROCESS_PAYMENT_SUCCESS;
        });

        return isCustomerPaidViaGateway;
    },
    /**
     *
     * @param processPayments
     * @return {boolean}
     */
    isWaitingProcessPaymentComplete(processPayments) {
        let isWaitingProcessPaymentComplete = false;
        Object.values(processPayments).forEach(payment => {
            isWaitingProcessPaymentComplete |= [
                PaymentConstant.PROCESS_PAYMENT_PENDING,
                PaymentConstant.PROCESS_PAYMENT_PROCESSING
            ].indexOf(payment.status) !== -1;
        });
        return isWaitingProcessPaymentComplete;
    },
    /**
     *
     * @param processPayments
     * @return {*|boolean}
     */
    hasPaidOrWaitingGatewayPayment(processPayments) {
        return this.hasPaidViaGatewaySuccess(processPayments) || this.isWaitingProcessPaymentComplete(processPayments);
    },
    /**
     *
     * @param processPayments
     * @return {boolean}
     */
    isSuccessAll(processPayments) {
        let isProcessedAllPayment = true;
        Object.values(processPayments).forEach(payment => {
            isProcessedAllPayment &= [
                PaymentConstant.PROCESSED_PAYMENT,
                PaymentConstant.PROCESS_PAYMENT_SUCCESS
            ].indexOf(payment.status) !== -1;
        });

        return isProcessedAllPayment
    },
    /**
     *
     * @param processPayments
     * @return {boolean}
     */
    hasErrorProcessPayment(processPayments) {
        let hasErrorProcessPayment = false;
        Object.values(processPayments).forEach(payment => {
            hasErrorProcessPayment |= [
                PaymentConstant.PROCESS_PAYMENT_ERROR
            ].indexOf(payment.status) !== -1;
        });
        return hasErrorProcessPayment;
    },
}
