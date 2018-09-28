export class PaymentAbstract {
    code = '';
    quote;
    order;
    creditmemo;
    payment;

    /**
     *
     * @param code
     * @return {PaymentAbstract}
     */
    setCode(code) {
        this.code = code;
        return this;
    }

    /**
     *
     * @param quote
     * @return {PaymentAbstract}
     */
    setQuote(quote) {
        this.quote      = quote;
        this.order      = null;
        this.creditmemo = null;
        return this;
    }

    /**
     *
     * @param order
     * @return {PaymentAbstract}
     */
    setOrder(order) {
        this.order      = order;
        this.quote      = null;
        this.creditmemo = null;
        return this;
    }

    /**
     *
     * @param creditmemo
     * @return {PaymentAbstract}
     */
    setCreditmemo(creditmemo) {
        this.creditmemo = creditmemo;
        this.order      = null;
        this.quote      = null;
        return this;
    }

    /**
     * set payment
     * @param payment
     * @returns {PaymentAbstract}
     */
    setPayment(payment) {
        this.payment = {...payment};
        return this;
    }

    /**
     *
     * @return {string}
     */
    getCode() {
        return this.code;
    }

    /**
     *
     * @return {*}
     */
    getQuote() {
        return this.quote;
    }

    /**
     *
     * @return {*}
     */
    getOrder() {
        return this.order;
    }

    /**
     *
     * @return {*}
     */
    getCreditmemo() {
        return this.creditmemo;
    }

    /**
     *
     * @return {*}
     */
    getPayment() {
        return this.payment;
    }


    /**
     *  prepare payload
     *
     * @return {PaymentAbstract}
     */
    prepare() {
        return this
    }

    /**
     *
     * @return {Promise<{}>}
     */
    async execute() {
        return {}
    }
}