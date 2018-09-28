import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import PaymentConstant from "../../view/constant/PaymentConstant";
import ConfigHelper from "../../helper/ConfigHelper";
import CurrencyHelper from "../../helper/CurrencyHelper";

class StoreCreditService extends CoreService {
    static className = 'StoreCreditService';

    /**
     * create store credit default
     * @param credit_balance
     * @returns {{
     * code: string,
     * is_default: number,
     * is_pay_later: number,
     * is_reference_number: number,
     * is_suggest_money: number,
     * title: string,
     * sub_title: (*|string), type: string}}
     */
    storeCreditDefault(credit_balance = 0) {
        let credit = {
            'code' : PaymentConstant.STORE_CREDIT,
            'is_default': 0,
            'is_pay_later': 0,
            'is_reference_number': 0,
            'is_suggest_money': 0,
            'title': 'Store Credit',
            'sub_title': '(' + CurrencyHelper.convertAndFormat(credit_balance) + ')',
            'type': PaymentConstant.PAYMENT_TYPE_OFFLINE
        };
        return credit;
    }

    /**
     * check and add store credit to list payment
     * @param customer
     * @param payments
     * @returns {*}
     */
    checkAndAddStoreCreditToListPayment(customer, payments) {
        if (!ConfigHelper.isEnableStoreCredit() ||
            !customer ||
            !customer.credit_balance ||
            customer.credit_balance <= 0
        ) {
            return payments;
        }
        let store_credit = this.storeCreditDefault(customer.credit_balance);
        payments.unshift(store_credit);
        return payments;
    }

    /**
     * check and remove store credit in quote;
     * @param quote
     * @returns {*}
     */
    checkAndRemoveStoreCreditInQuote(quote) {
        let store_credit = quote.payments.find((payment) => payment.method === PaymentConstant.STORE_CREDIT);
        if (store_credit) {
            let index_payment = quote.payments.indexOf(store_credit);
            quote.payments.splice(index_payment, 1);
        }
        return quote;
    }

    /**
     * check spent credit in select payment
     * @param quote
     * @param base_grand_total
     * @param remain
     * @param order
     * @returns {boolean}
     */
    checkSpentCreditSelectPayment(quote = null, base_grand_total, remain, order = null) {
        if (!ConfigHelper.isSpentCreditOnShippingFee()) {
            let base_remain_amount = remain ? CurrencyHelper.convertToBase(remain) : base_grand_total;
            let base_shipping_amount = quote ? quote.base_shipping_amount : order.base_shipping_amount;
            if ((base_remain_amount - base_shipping_amount) < 0)
                return false;
        }
        return true;
    }

    /**
     * get max store credit
     * @param quote
     * @param grand_total
     * @param remain
     * @param current_credit
     * @param customer
     * @param order
     * @returns {number}
     */
    maxStoreCredit(quote = null, grand_total, remain, current_credit, customer, order = null) {
        let max_credit = 0;
        let credit_balance = customer.credit_balance;
        if (remain) {
            remain = current_credit ? (remain + current_credit.amount_paid) : remain;
        }
        if (!ConfigHelper.isSpentCreditOnShippingFee()) {
            let remain_amount = remain ? remain : grand_total;
            let shipping_amount = quote ? quote.shipping_amount : order.shipping_amount;
            max_credit = remain_amount - shipping_amount;
        } else {
            max_credit = remain ? remain : grand_total;
        }
        max_credit = credit_balance < max_credit ? credit_balance : max_credit;
        return max_credit;
    }

    /**
     * calculate amount paid;
     * @param amount_paid
     * @param max_credit
     * @returns {*}
     */
    calculateAmountPaid(amount_paid, max_credit) {
        amount_paid = amount_paid > max_credit ? max_credit : amount_paid;
        amount_paid = amount_paid < 0 ? 0 : amount_paid;
        return amount_paid;
    }

    /**
     * check use max credit
     * @param amount_paid
     * @param max_credit
     * @returns {boolean}
     */
    checkUseMaxCredit(amount_paid, max_credit) {
        return amount_paid >= max_credit;
    }
}

/**
 * @type {StoreCreditService}
 */
let storeCreditService = ServiceFactory.get(StoreCreditService);

export default storeCreditService;