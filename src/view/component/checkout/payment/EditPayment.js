import React from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import PaymentConstant from "../../../constant/PaymentConstant";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import QuoteAction from "../../../action/checkout/QuoteAction";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
import NumPad from '../../lib/react-numpad';
import * as RCK from '../../lib/react-credit-card-kit';
import SmoothScrollbar from "smooth-scrollbar/index";
import jQuery from 'jquery';
import DateTimeHelper from "../../../../helper/DateTimeHelper";
import '../../../style/css/EditPayment.css';
import '../../../style/css/StoreCredit.css';
import Config from "../../../../config/Config";
import StoreCreditService from "../../../../service/store-credit/StoreCreditService";
import PaymentHelper from "../../../../helper/PaymentHelper";
import SessionHelper from "../../../../helper/SessionHelper";

class EditPayment extends CoreComponent {
    static className = 'EditPayment';
    setEditPaymentElement = element => {
        this.edit_payment = element;
        if (!this.scrollbar && this.edit_payment) {
            this.scrollbar = SmoothScrollbar.init(this.edit_payment);
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            amountPaid: 0,
            amountPaidMax: 0,
            grandTotal: 0,
            referenceNo: '',
            precision: 2,
            heightWrapperPayment: 0,
            creditCardIsValid: null,
            isStoreCredit: props.paymentMethod.code === PaymentConstant.STORE_CREDIT,
            useMaxCredit: true
        };
    }

    /**
     * componentWillMount
     */
    componentWillMount() {
        let {quote} = this.props;
        this.preparePaymentData(quote);
    }


    /**
     * Component will receive props - set remain state
     *
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.quote.base_grand_total !== this.state.grandTotal) {
            this.preparePaymentData(nextProps.quote);
        }
    }

    /**
     * Prepare payment data
     *
     * @param quote
     */
    preparePaymentData(quote) {
        let {payment, paymentMethod} = this.props;
        let {isStoreCredit} = this.state;
        let heightWrapperPayment = this.heightPopup();
        let precision = CurrencyHelper.getCurrencyFormat().precision;
        let amountPaid, amountPaidMax;
        let remain = payment.remain;
        let grand_total = quote.grand_total;
        if (isStoreCredit) {
            let store_credit = quote.payments.find((payment) => payment.method === PaymentConstant.STORE_CREDIT);
            amountPaidMax = StoreCreditService.maxStoreCredit(quote, grand_total, remain, store_credit, quote.customer);
            amountPaid = this.calculateAmountPaid(quote, paymentMethod);
            amountPaid = StoreCreditService.calculateAmountPaid(amountPaid, amountPaidMax);
            this.setState({useMaxCredit: StoreCreditService.checkUseMaxCredit(amountPaid, amountPaidMax)});
        } else {
            amountPaid = this.calculateAmountPaid(quote, paymentMethod);
            amountPaidMax = grand_total;
            if (remain !== undefined) {
                amountPaidMax = remain;
                if (paymentMethod.index !== undefined) {
                    amountPaidMax += amountPaid;
                }
            }
        }
        this.setState(
            {
                amountPaid: parseFloat(amountPaid),
                amountPaidMax: amountPaidMax,
                grandTotal: quote.base_grand_total,
                referenceNo: this.getReferenceNoInQuote(quote, paymentMethod),
                precision,
                heightWrapperPayment
            }
        );
    }

    /**
     * calculate height of element
     * @returns {number}
     */
    heightPopup() {
        return jQuery(window)['height']();
    }

    /**
     * calculate amount paid
     * @param quote
     * @param paymentMethod
     * @return {number}
     */
    calculateAmountPaid(quote, paymentMethod) {
        let result = this.getAmountPaidInQuote(quote, paymentMethod);
        if (result === 0) {
            result = this.calculateSubAmountPaidFromQuote(quote);
        }
        return result;
    }

    /**
     * select new payment, then calculate sub amount paid from grand_total and all payments
     * @param quote
     * @return {number}
     */
    calculateSubAmountPaidFromQuote(quote) {
        let result = quote.grand_total;
        if (quote.payments && quote.payments.length > 0) {
            let totalAmountPaidPayment = 0;
            for (let i = 0; i < quote.payments.length; i++) {
                if (!this.state.isStoreCredit)
                    totalAmountPaidPayment += quote.payments[i].amount_paid;
            }
            result -= totalAmountPaidPayment;
        }
        return result;
    }

    /**
     * edit payment, then get amount paid in payment
     * @param quote
     * @param paymentMethod
     * @returns {*}
     */
    getAmountPaidInQuote(quote, paymentMethod) {
        if (paymentMethod.index !== undefined) {
            let payment = quote.payments.find((item, index) => index === paymentMethod.index);
            if (payment) {
                return payment.amount_paid;
            }
        }
        return 0;
    }

    /**
     * edit payment, then get reference no in payment
     * @param quote
     * @param paymentMethod
     * @returns {*}
     */
    getReferenceNoInQuote(quote, paymentMethod) {
        let payment = quote.payments.find((item, index) => index === paymentMethod.index);
        if (payment) {
            return payment.reference_number;
        }
        return '';
    }

    /**
     * change amountPaid in state
     * @param value
     */
    handleChangePaymentAmount(value) {
        let amountPaid;
        if (this.state.isStoreCredit) {
            let {amountPaidMax} = this.state;
            amountPaid = StoreCreditService.calculateAmountPaid(parseFloat(value), amountPaidMax);
            this.setState({useMaxCredit: StoreCreditService.checkUseMaxCredit(amountPaid, amountPaidMax)});
        } else {
            amountPaid = this.handleCannotDue(value);
        }
        amountPaid = CurrencyHelper.validateAndConvertCurrency(amountPaid);
        this.setState({
            amountPaid
        });
    }

    /**
     * handle event focus input text
     * @param event
     */
    handleFocus(event) {
        event.target.select();
    }

    /**
     * handle change reference no
     * @param event
     */
    handleChangeReferenceNo(event) {
        let referenceNo = event.target.value;
        this.setState({
            referenceNo
        })
    }

    /**
     * render view of a suggest money
     * @param money
     * @param index
     * @returns {*}
     */
    renderSuggestMoney(money, index) {
        return (
            <li key={index} onClick={() => this.handleChooseSuggestMoney(money)}>
                <span>{CurrencyHelper.format(money)}</span>
            </li>
        )
    }

    /**
     * handle event click a suggest money
     * @param amountPaid
     */
    handleChooseSuggestMoney(amountPaid) {
        this.setState({
            amountPaid: parseFloat(amountPaid)
        })
    }

    /**
     * handle payment amount
     */
    async handlePaymentAmount() {
        let {amountPaid, referenceNo} = this.state;
        let quote = Object.assign({}, this.props.quote);
        let {paymentMethod} = this.props;
        let paymentNewExistInArray = quote.payments.find((item, index) => index === paymentMethod.index);
        let paymentNewArray = quote.payments.filter((item, index) => index !== paymentMethod.index);

        let amountPaidAfterConvert = CurrencyHelper.roundToFloat(amountPaid);
        let amountPaidBaseAfterConvert = CurrencyHelper.convertAndRoundFloatToBase(amountPaid);
        let paymentNewCashIn = {};
        if (paymentNewExistInArray) {
            paymentNewCashIn = {
                ...paymentNewExistInArray,
                amount_paid: amountPaidAfterConvert,
                base_amount_paid: amountPaidBaseAfterConvert,
                reference_number: referenceNo,
            };
        } else {
            paymentNewCashIn = {
                method: paymentMethod.code,
                title: paymentMethod.title,
                amount_paid: amountPaidAfterConvert,
                base_amount_paid: amountPaidBaseAfterConvert,
                reference_number: referenceNo
            };
        }

        if (PaymentHelper.hasUsingCreditCardForm(paymentMethod.code)) {
            paymentNewCashIn.isCardMode = this.creditCard.state.isCardMode;
            if (this.creditCard.state.isCardMode) {
                let {cardExpiryField} = this.creditCard;
                let month             = cardExpiryField.value.split('/')[0];
                let year              = cardExpiryField.value.split('/')[1];
                let cardType          =  this.creditCard.getType();

                paymentNewCashIn = {
                    ...paymentNewCashIn,
                    "cc_owner":
                    this.creditCard.cardNameField.value && this.creditCard.cardNameField.value.toUpperCase(),
                    "cc_number": this.creditCard.cardNumberField.value.replace(/ /g, ''),
                    "cc_type": cardType,
                    "card_type": cardType,
                    "cc_exp_month": month.trim(),
                    "cc_exp_year": `20${year.trim()}`,
                    "cc_cid": this.creditCard.cvcField.value,
                    "last4Digit": `${
                        this.creditCard.cardNumberdMaskedField.value
                    } ${
                        this.creditCard.cardNumberdUnmaskedField.value
                    }`
                };
            } else {
                paymentNewCashIn.email = this.creditCard.emailField.value;
                paymentNewCashIn.is_pay_later = 1;
            }


        }

        paymentNewCashIn.errorMessage = '';
        paymentNewCashIn.status = PaymentConstant.PROCESS_PAYMENT_NEW;
        paymentNewCashIn.payment_date = DateTimeHelper.getDatabaseDateTime(new Date().getTime());
        paymentNewCashIn.shift_increment_id = Config.current_session && SessionHelper.isEnableSession() ?
                                                    Config.current_session.shift_increment_id : "";

        let payments = [
            ...paymentNewArray,
            paymentNewCashIn
        ];
        await this.props.quoteSetPayments(payments);
        await this.props.cashIn(amountPaid);
    }

    handleBack() {
        let {paymentMethod} = this.props;
        if (paymentMethod.index !== undefined) {
            this.props.switchPage(PaymentConstant.PAYMENT_PAGE_COMPLETE_ORDER);
        } else {
            this.props.switchPage(PaymentConstant.PAYMENT_PAGE_SELECT_PAYMENT);
        }
    }

    /**
     * get display value
     * @param amountPaid
     * @return {*}
     */
    getDisplayValue(amountPaid) {
        return CurrencyHelper.format(amountPaid);
    }

    /**
     * in case cannot change due, amount paid not greater than amount paid max
     * @param amountPaid
     * @returns {*}
     */
    handleCannotDue(amountPaid) {
        let {paymentMethod} = this.props;
        if (paymentMethod && paymentMethod['can_due'] !== PaymentConstant.PAYMENT_CAN_DUE) {
            if (parseFloat(amountPaid) > this.state.amountPaidMax) {
                return this.state.amountPaidMax;
            }
        }
        return amountPaid;
    }

    /**
     * action change use max credit
     */
    handleUseMaxCredit() {
        let checked = this.refs.use_max_credit.checked;
        if (checked) {
            this.setState({
                amountPaid : this.state.amountPaidMax,
                useMaxCredit: true
            });
        }
    }

    /**
     * generate suggest money
     * @param money
     * @returns {number[]}
     */
    generateSuggestMoney(money) {
        let suggest_money = [];
        suggest_money.push(money);
        let money_2 = ((Math.floor(money / 10) + 1) * 10);
        suggest_money.push(money_2);
        let money_3 = ((Math.floor(money / 50) + 1) * 50);
        if (money_3 <= money_2) {
            money_3 = money_3 + ((Math.floor(money / 50) + 2) * 50);
        }
        suggest_money.push(money_3);
        let money_4 = ((Math.floor(money / 100) + 1) * 100);
        if (money_4 <= money_3) {
            money_4 = ((Math.floor(money / 100) + 2) * 100);
        }
        suggest_money.push(money_4);
        return suggest_money;
    }

    creditCard;

    setCreditCard = (creditCard) => {
        this.creditCard = creditCard;
        const { paymentMethod,  quote } =  this.props;
        if (this.creditCard && paymentMethod) {
            const selectedPayment = quote.payments[paymentMethod.index];

            // set default email
            if (
                !selectedPayment
                && paymentMethod['is_allow_pay_via_email']
                && quote.customer_id
            ) {
                this.creditCard.setEmail(quote.customer_email);
            }

            if (!selectedPayment) return;

            if (selectedPayment.isCardMode) {
                return this.creditCard.setCard({
                    name: selectedPayment.cc_owner,
                    number: selectedPayment.cc_number,
                    exp_month: selectedPayment.cc_exp_month,
                    exp_year: selectedPayment.cc_exp_year,
                    cvc: selectedPayment.cc_cid,
                })
            }

            this.creditCard.setEmail(selectedPayment.email);
        }
    };
    /**
     *
     * @param {object} payment
     * @return {*}
     */
    getCreditCardForm = payment => { // eslint-disable-line
        if (payment['is_allow_pay_via_email']) {
            return (
                <RCK.CreditCardFormNPayViaEmail
                    ref={this.setCreditCard}
                    afterValidateCard={this.afterValidateCard}
                    containerClassName="paypal-by"
                    controlClassName="checkpaypal-by"
                    enableZipInput={false}
                    autoFocus={false}
                    showError={false}
                    showPopoverError={true}
                    allowCardTypes={["VISA", "AMEX", "DISCOVER", "MASTERCARD"]}
                    translator={{
                        'This type card is not supported' :
                            (
                                <span>
                                    The merchant only accepts Discover, <br /> American Express, Visa,
                                    MasterCard
                                </span>
                            )
                    }}
                />
            )
        }

        return (
            <RCK.CreditCardForm
                ref={this.setCreditCard}
                afterValidateCard={this.afterValidateCard}
                containerClassName="paypal-by"
                enableZipInput={false}
                autoFocus={false}
                showError={false}
                showPopoverError={true}
            />
        );
    };
    /**
     *
     * @param {boolean} creditCardIsValid
     */
    afterValidateCard = (creditCardIsValid) => {
        this.setState({creditCardIsValid})
    };

    /**
     * template to render
     * @returns {*}
     */
    template() {
        const {paymentMethod, quote} = this.props;
        let {customer} = quote;
        let credit_balance = customer && customer.credit_balance ? customer.credit_balance : 0;
        let {
            amountPaid, amountPaidMax, grandTotal,
            referenceNo, heightWrapperPayment, creditCardIsValid,
            isStoreCredit, useMaxCredit
        } = this.state;
        let suggestMoney = paymentMethod['is_suggest_money'] ? this.generateSuggestMoney(amountPaidMax) : false;
        let disabled = amountPaid <= 0 ||
            (PaymentHelper.hasUsingCreditCardForm(paymentMethod.code) && !creditCardIsValid);

        return (
            <div className="wrapper-payment active" id="wrapper-payment2" style={{height: heightWrapperPayment}}>
                <div className="block-title">
                    <strong className="title">{this.props.t(paymentMethod.title)}</strong>
                </div>
                <div className="block-content" data-scrollbar ref={this.setEditPaymentElement}>
                    <span className={"payment-logo image-" + paymentMethod.code}/>
                    <ul className="payment-total">
                        {this.props.remain !== undefined ?
                            this.props.remain >= 0 ?
                                <li>
                                    <span className="label">{this.props.t("Remaining")}</span>
                                    <span className="value">{this.getDisplayValue(this.props.remain)}</span>
                                </li>
                                :
                                <li>
                                    <span className="label">{this.props.t("Change")}</span>
                                    <span className="value">{this.getDisplayValue(-this.props.remain)}</span>
                                </li>
                            :
                            <li>
                                <span className="label">{this.props.t("Total")}</span>
                                <span className="value">{this.getDisplayValue(grandTotal)}</span>
                            </li>
                        }
                    </ul>
                    <div className={isStoreCredit ? "payment-credits-balance" : "hidden"} >
                        <span className="label">{this.props.t('Credit Balance')}</span>
                        <span className="value">{CurrencyHelper.convertAndFormat(credit_balance)}</span>
                    </div>
                    <NumPad.CustomNumber
                        onChange={(val) => {
                            this.handleChangePaymentAmount(val)
                        }}
                        position="centerLeft"
                        sync={true}
                        arrow="left"
                        value={amountPaid}>
                        <div className={isStoreCredit ? "payment-amount payment-amount-credits" : "payment-amount"}>
                            <span className="label">
                                {isStoreCredit ? this.props.t("Use Credits") : this.props.t("Amount")}
                            </span>
                            <span className="value">{this.getDisplayValue(amountPaid)}</span>
                        </div>
                    </NumPad.CustomNumber>
                    <div className={isStoreCredit ? "payment-point-max" : "hidden"}>
                        <span className="label">{this.props.t('Use Max Credits')}</span>
                        <span className="value">
                            <label className="label-checkbox">
                                <input ref="use_max_credit"
                                       type="checkbox"
                                       name=""
                                       checked={useMaxCredit}
                                       onChange={() => this.handleUseMaxCredit()}/>
                                <span></span>
                            </label>
                        </span>
                    </div>
                    {
                        paymentMethod['is_reference_number'] ?
                            <div className="payment-reference">
                                <span className="label">{this.props.t("Reference No")}</span>
                                <input type="text" value={referenceNo} className="value form-control"
                                       onChange={(event) => this.handleChangeReferenceNo(event)}/>
                            </div> :
                            <ul className={isStoreCredit ? "hidden" : "payment-amount-list"}>
                                {
                                    suggestMoney && suggestMoney.length > 0 &&
                                    suggestMoney.map((money, index) => {
                                        return this.renderSuggestMoney(money, index)
                                    })
                                }
                            </ul>
                    }
                    {
                        PaymentHelper.hasUsingCreditCardForm(paymentMethod.code)
                            && this.getCreditCardForm(paymentMethod)
                    }
                </div>
                <div className="block-bottom">
                    <div className="actions-accept">
                        <button className="btn btn-default btn-cannel" type="button"
                                onClick={() => this.handleBack()}>
                            {this.props.t("Back")}
                        </button>
                        <button className={"btn btn-default btn-accept " + (disabled ? 'disabled' : '')} type="button"
                                onClick={() => (disabled ? null : this.handlePaymentAmount())}>
                            {isStoreCredit ? this.props.t("Use") + " " : this.props.t("Accept") + " "}
                            {this.getDisplayValue(amountPaid)}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

class EditPaymentContainer extends CoreContainer {
    static className = "EditPaymentContainer";

    /**
     * map state to props
     * @param state
     * @returns {{}}
     */
    static mapState(state) {
        let {quote, payment} = state.core.checkout;
        return {
            quote,
            payment,
        };
    }

    /**
     * map dispatch to props
     * @param dispatch
     * @returns {{}}
     */
    static mapDispatch(dispatch) {
        return {
            quoteSetPayments: (payments) => dispatch(QuoteAction.setPayments(payments))
        };
    }
}

export default ContainerFactory.get(EditPaymentContainer).getConnect(
    ComponentFactory.get(EditPayment)
);