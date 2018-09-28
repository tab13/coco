import CoreService from "../CoreService";
import Config from "../../config/Config";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import SessionResourceModel from "../../resource-model/session/SessionResourceModel";
import SessionConstant from "../../view/constant/SessionConstant";
import DateTimeHelper from "../../helper/DateTimeHelper";
import CurrencyHelper from "../../helper/CurrencyHelper";
import i18n from "../../config/i18n";
import SyncConstant from "../../view/constant/SyncConstant";
import ActionLogService from "../sync/ActionLogService";
import LocalStorageHelper from "../../helper/LocalStorageHelper";
import AppStore from '../../view/store/store';
import SessionAction from "../../view/action/SessionAction";
import cloneDeep from 'lodash/cloneDeep';
import SessionHelper from "../../helper/SessionHelper";
import PaymentConstant from "../../view/constant/PaymentConstant";
import NumberHelper from "../../helper/NumberHelper";

export class SessionService extends CoreService {
    static className = 'SessionService';
    resourceModel = SessionResourceModel;

    /**
     * Get Cash Sales
     * @param session
     * @returns {number}
     */
    getCashSales(session) {
        let total_cash = 0;
        session.cash_transaction.forEach(transaction => {
            if (transaction.order_increment_id) {
                if (transaction.type === SessionConstant.CASH_TRANSACTION_ADD) {
                    total_cash += transaction.value;
                } else if (transaction.type === SessionConstant.CASH_TRANSACTION_CHANGE) {
                    total_cash -= transaction.value;
                }
            }
        });
        return total_cash;
    }


    /**
     * Display Cash Sales
     * @param session
     * @returns {*|string}
     */
    getDisplayCashSales(session) {
        return CurrencyHelper.format(this.getCashSales(session), session.shift_currency_code);
    }

    /**
     * Get Cash Refund
     * @param session
     * @returns {number}
     */
    getCashRefund(session) {
        let cashRefundAmount = 0;
        session.cash_transaction.forEach(transaction => {
            if (transaction.type === SessionConstant.CASH_TRANSACTION_REMOVE && transaction.order_increment_id) {
                cashRefundAmount += transaction.value;
            }
        });
        return cashRefundAmount;
    }

    /**
     * Display Cash Refund
     * @param session
     * @returns {string}
     */
    getDisplayCashRefund(session) {
        let cashRefund = this.getCashRefund(session);
        if (cashRefund !== 0) {
            return "-" + CurrencyHelper.format(cashRefund, session.shift_currency_code);
        } else {
            return CurrencyHelper.format(cashRefund, session.shift_currency_code);
        }
    }

    /**
     * get total Pay Ins
     * @param session
     * @return {number}
     */
    getTotalPayIns(session) {
        let payIns = 0;
        session.cash_transaction.map(item => {
            if (item.type === SessionConstant.CASH_TRANSACTION_ADD && !item.order_increment_id) {
                payIns = NumberHelper.addNumber(payIns, item.value);
            }
            return null;
        });
        return payIns;
    }

    /**
     * get display pay ins
     * @param session
     * @return {*|string}
     */
    getDisplayPayIns(session) {
        return CurrencyHelper.format(this.getTotalPayIns(session), session.shift_currency_code);
    }

    /**
     * get total Pay Outs
     * @param session
     * @return {number}
     */
    getTotalPayOuts(session) {
        let payOuts = 0;
        session.cash_transaction.map(item => {
            if (item.type === SessionConstant.CASH_TRANSACTION_REMOVE && !item.order_increment_id) {
                payOuts = NumberHelper.addNumber(payOuts, item.value);
            }
            return null;
        });
        return payOuts;
    }

    /**
     * get display Pay Outs
     * @param session
     * @return {*|string}
     */
    getDisplayPayOuts(session) {
        let displayPayOuts = CurrencyHelper.format(this.getTotalPayOuts(session), session.shift_currency_code);
        if (this.getTotalPayOuts(session) !== 0) {
            displayPayOuts = "-" + displayPayOuts;
        }
        return displayPayOuts;
    }

    /**
     * get theoretical amount
     * @param session
     */
    getTheoreticalAmount(session) {
        let opening_amount = session.opening_amount;
        let total_cash = 0;
        session.cash_transaction.map(transaction => {
            if (transaction.type === SessionConstant.CASH_TRANSACTION_ADD) {
                total_cash += transaction.value;
            } else {
                total_cash -= transaction.value;
            }

            return transaction;
        });
        return opening_amount + total_cash;
    }


    /**
     * Display Theoretical
     * @param session
     * @returns {*|string}
     */
    getDisplayTheoretical(session) {
        return CurrencyHelper.format(this.getTheoreticalAmount(session), session.shift_currency_code);
    }


    /**
     * Display cash difference
     * @param session
     * @returns {string}
     */
    getDisplayCashDifference(session) {
        let closedAmount = session.closed_amount ? session.closed_amount : 0;
        let cashDifference = closedAmount - this.getTheoreticalAmount(session);
        return CurrencyHelper.format(cashDifference, session.shift_currency_code);
    }

    /**
     * total amount cash transaction
     * @param cash_transaction
     * @returns {number}
     */
    totalAmountCashTransaction(cash_transaction) {
        let total = 0;
        cash_transaction.forEach(transaction => {
            total += transaction.value;
        });
        return total;
    }

    // /**
    //  * Display cash in
    //  * @param session
    //  * @returns {*|string}
    //  */
    // getDisplayTotalAmountCashIn(session) {
    //     let cash_transaction = session.cash_transaction ? session.cash_transaction : [];
    //     let cash_in = cash_transaction.filter(item => item.type === SessionConstant.CASH_TRANSACTION_ADD);
    //     return CurrencyHelper.format(this.totalAmountCashTransaction(cash_in), session.shift_currency_code);
    // }
    //
    // /**
    //  * Display cash out
    //  * @param session
    //  * @returns {string}
    //  */
    // getDisplayTotalAmountCashOut(session) {
    //     let cash_transaction = session.cash_transaction ? session.cash_transaction : [];
    //     let cash_out = cash_transaction.filter(item => item.type !== SessionConstant.CASH_TRANSACTION_ADD);
    //     let displayCashOut = CurrencyHelper.format(this.totalAmountCashTransaction(cash_out), session.shift_currency_code);
    //     if (this.totalAmountCashTransaction(cash_out) !== 0) {
    //         displayCashOut = "-" + displayCashOut;
    //     }
    //     return displayCashOut;
    // }


    /**
     * open session
     * @param opening_amount
     * @returns {Promise.<{}>}
     */
    async openSession(opening_amount) {
        let currentTimestamp = new Date().getTime();
        let databaseCurrentTime = DateTimeHelper.getDatabaseDateTime(currentTimestamp);
        let shift_increment_id = Config.pos_name.replace(/\s/g, '') + '-' + currentTimestamp;
        let shift = {
            "shift_increment_id": shift_increment_id,
            "staff_id": Number(Config.staff_id),
            "location_id": Number(Config.location_id),
            "opened_at": databaseCurrentTime,
            "updated_at": databaseCurrentTime,
            "closed_at": "",
            "opening_amount": opening_amount,
            "base_opening_amount": CurrencyHelper.convertToBase(opening_amount),
            "closed_amount": 0,
            "base_closed_amount": 0,
            "status": SessionConstant.SESSION_OPEN,
            "closed_note": "",
            "base_currency_code": CurrencyHelper.getBaseCurrencyCode(),
            "shift_currency_code": CurrencyHelper.getCurrentCurrencyCode(),
            "pos_id": Number(Config.pos_id),
            "cash_transaction": [],
            "pos_name": Config.pos_name,
            "staff_name": Config.staff_name,
            "sale_summary": []
        };

        this.saveCurrentSession(shift);
        this.removeCloseSession();

        await this.getResourceModel().saveToDb([shift]);
        this.reindexTable();

        let new_shift = this.convertDataOpenSession(shift);
        let params = {
            shift: new_shift
        };
        let url_api = this.getResourceModel().getPathShiftSave();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_SHIFT_SAVE_SESSION, url_api, SyncConstant.METHOD_POST, params
        );

        return shift;
    }

    /**
     * convert data open session
     * @param session
     * @returns {*}
     */
    convertDataOpenSession(session) {
        let new_session = cloneDeep(session);
        if (new_session.pos_name) delete new_session.pos_name;
        if (new_session.staff_name) delete new_session.staff_name;
        if (new_session.sale_summary) delete new_session.sale_summary;
        return new_session;
    }

    /**
     * add and remove transaction
     * @param amount
     * @param note
     * @param isPutMoney
     * @returns {Promise.<{}>}
     */
    async addOrRemoveTransaction(amount, note, isPutMoney) {
        let currentTimestamp = new Date().getTime();
        let databaseCurrentTime = DateTimeHelper.getDatabaseDateTime(currentTimestamp);
        let transaction_increment_id = Config.pos_name.replace(/\s/g, '') + '-' + currentTimestamp;
        let transaction = {
            "transaction_increment_id": transaction_increment_id,
            "shift_increment_id": Config.current_session.shift_increment_id,
            "created_at": databaseCurrentTime,
            "updated_at": databaseCurrentTime,
            "value": amount,
            "base_value": CurrencyHelper.convertToBase(amount),
            "note": note,
            "location_id": Config.location_id,
            "order_increment_id": "",
            "type": isPutMoney ? SessionConstant.CASH_TRANSACTION_ADD : SessionConstant.CASH_TRANSACTION_REMOVE,
            "base_currency_code": CurrencyHelper.getBaseCurrencyCode(),
            "transaction_currency_code": CurrencyHelper.getCurrentCurrencyCode()
        };
        let session = await this.getResourceModel().getOfflineById(Config.current_session.shift_increment_id);
        session.cash_transaction.push(transaction);
        this.saveCurrentSession(session);
        await this.getResourceModel().saveToDb([session]);
        this.reindexTable();

        let params = {
            cash_transactions: [transaction]
        };

        let url_api = this.getResourceModel().getPathCashTransactionSave();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_CASH_TRANSACTION_SAVE_SESSION, url_api, SyncConstant.METHOD_POST, params
        );

        return session;
    }

    /**
     * save close session to local storage
     * @param closing_amount
     * @param denominations
     */
    async setCloseSession(closing_amount, denominations) {
        let shift_currency_code = Config.current_session.shift_currency_code;
        let closeSession = {
            closed_amount: closing_amount,
            base_closed_amount: CurrencyHelper.convertToBase(closing_amount, shift_currency_code),
            denominations: denominations,
            shift_increment_id: Config.current_session.shift_increment_id
        };
        this.saveLocalCloseSession(closeSession);
        let session = await this.getResourceModel().getOfflineById(closeSession.shift_increment_id);
        session.closed_amount = closeSession.closed_amount;
        session.base_closed_amount = closeSession.base_closed_amount;
        this.saveCurrentSession(session);
        await this.getResourceModel().saveToDb([session]);
        this.reindexTable();
        return session;
    }

    /**
     * close session
     * @param session
     * @param note
     * @returns {Promise.<*>}
     */
    async closeSession(session, note) {
        let currentTimestamp = new Date().getTime();
        let databaseCurrentTime = DateTimeHelper.getDatabaseDateTime(currentTimestamp);
        session.closed_at = databaseCurrentTime;
        session.updated_at = databaseCurrentTime;
        session.status = SessionConstant.SESSION_CLOSE;
        session.closed_note = note;

        this.saveCurrentSession(session);
        this.removeCloseSession();

        await this.getResourceModel().saveToDb([session]);
        this.reindexTable();

        let new_session = this.convertDataCloseSession(session);
        let params = {
            shift: new_session
        };

        let url_api = this.getResourceModel().getPathShiftSave();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_SHIFT_SAVE_SESSION, url_api, SyncConstant.METHOD_POST, params
        );

        return session;
    }

    /**
     * convert data close session
     * @param session
     * @returns {*}
     */
    convertDataCloseSession(session) {
        let new_session = cloneDeep(session);
        if (new_session.pos_name)
            delete new_session.pos_name;
        if (new_session.staff_name)
            delete new_session.staff_name;
        if (new_session.cash_transaction) {
            delete new_session.cash_transaction;
        }
        if (new_session.sale_summary) {
            delete new_session.sale_summary;
        }
        return new_session;
    }

    /**
     * update session after place and refund order
     * @param object
     * @param isRefund
     * @param isTakePayment
     */
    async updateSessionAfterPlaceAndRefundOrder(object, isRefund, isTakePayment) {
        if (!object.payments) return null;
        let payments_cash = null;
        if (isTakePayment) {
            payments_cash = object.payments.filter(
                payment => payment.method === PaymentConstant.CASH && !payment.is_paid);
        } else {
            payments_cash = object.payments.filter(
                payment => payment.method === PaymentConstant.CASH);
        }

        let session = await this.getResourceModel().getOfflineById(Config.current_session.shift_increment_id);
        if (!payments_cash || !payments_cash.length) {
            // add all payment in sale summary
            if (object.payments && object.payments.length) {
                object.payments.map(payment => {
                    payment.type = isRefund ? 1 : 0;
                    if (!session.sale_summary) {
                        session.sale_summary = [];
                    }
                    if (session.sale_summary.findIndex(x => x.payment_date === payment.payment_date) < 0) {
                        session.sale_summary.push(payment);
                    }
                    return payment;
                });
            }

            this.saveCurrentSession(session);
            await this.getResourceModel().saveToDb([session]);
            this.reindexTable();
            return null;
        }

        let currentTimestamp = new Date().getTime();
        let databaseCurrentTime = DateTimeHelper.getDatabaseDateTime(currentTimestamp);
        let base_value = 0;
        let value = 0;
        let note = "";
        let increment_id = "";
        let transactions = [];

        for (let payment_cash of payments_cash) {
            if (Math.abs(payment_cash.amount_paid) > 0) {
                currentTimestamp++;
                let transaction_increment_id = Config.pos_name.replace(/\s/g, '') + '-' + currentTimestamp;
                if (isRefund) {
                    base_value = CurrencyHelper.convertToBase(payment_cash.base_amount_paid, object.base_currency_code);
                    value = CurrencyHelper.convert(base_value);
                    increment_id = object.order.increment_id;
                    note = i18n.translator.translate(
                        'Refund by cash for order #{{increment_id}}', {increment_id: increment_id}
                    );
                } else {
                    base_value = payment_cash.base_amount_paid;
                    value = payment_cash.amount_paid;
                    increment_id = object.increment_id;
                    note = i18n.translator.translate(
                        'Receive cash from order #{{increment_id}}', {increment_id: increment_id}
                    );
                }

                let transaction = {
                    "transaction_increment_id": transaction_increment_id,
                    "shift_increment_id": Config.current_session ? Config.current_session.shift_increment_id : "",
                    "created_at": databaseCurrentTime,
                    "updated_at": databaseCurrentTime,
                    "value": value,
                    "base_value": base_value,
                    "note": note,
                    "location_id": Config.location_id,
                    "order_increment_id": increment_id,
                    "type": isRefund ? SessionConstant.CASH_TRANSACTION_REMOVE : SessionConstant.CASH_TRANSACTION_ADD,
                    "base_currency_code": CurrencyHelper.getBaseCurrencyCode(),
                    "transaction_currency_code": CurrencyHelper.getCurrentCurrencyCode()
                };

                transactions.push(transaction);

                session.cash_transaction.push(transaction);
            }
        }

        // add order change money
        if (!isRefund && object.base_pos_change && object.base_pos_change > 0) {
            currentTimestamp++;
            let transaction_increment_id = Config.pos_name.replace(/\s/g, '') + '-' + currentTimestamp;
            base_value = object.base_pos_change;
            value = object.pos_change;
            increment_id = object.increment_id;
            note = i18n.translator.translate('Give change for order #{{increment_id}}', {increment_id: increment_id});

            let transaction = {
                "transaction_increment_id": transaction_increment_id,
                "shift_increment_id": Config.current_session ? Config.current_session.shift_increment_id : "",
                "created_at": databaseCurrentTime,
                "updated_at": databaseCurrentTime,
                "value": value,
                "base_value": base_value,
                "note": note,
                "location_id": Config.location_id,
                "order_increment_id": increment_id,
                "type": SessionConstant.CASH_TRANSACTION_CHANGE,
                "base_currency_code": CurrencyHelper.getBaseCurrencyCode(),
                "transaction_currency_code": CurrencyHelper.getCurrentCurrencyCode()
            };

            transactions.push(transaction);
            session.cash_transaction.push(transaction);
        }

        // add all payment in sale summary
        if (object.payments && object.payments.length) {
            object.payments.map(payment => {
                payment.type = isRefund ? 1 : 0;
                if (!session.sale_summary) {
                    session.sale_summary = [];
                }
                if (session.sale_summary.findIndex(x => x.payment_date === payment.payment_date) < 0) {
                    session.sale_summary.push(payment);
                }
                return payment;
            });
        }

        this.saveCurrentSession(session);
        await this.getResourceModel().saveToDb([session]);
        this.reindexTable();

        if (!transactions.length) {
            return false;
        }

        let params = {
            cash_transactions: transactions
        };

        let url_api = this.getResourceModel().getPathCashTransactionSave();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_CASH_TRANSACTION_SAVE_SESSION, url_api, SyncConstant.METHOD_POST, params
        );
    }

    /**
     * get current session
     * @return {null}
     */
    getCurrentSession() {
        let currentSession = LocalStorageHelper.get(LocalStorageHelper.CURRENT_SESSION);
        return (currentSession ? JSON.parse(currentSession) : null);
    }

    /**
     * get close session
     * @returns {null}
     */
    getLocalCloseSession() {
        let closeSession = LocalStorageHelper.get(LocalStorageHelper.CLOSE_SESSION);
        return (closeSession ? JSON.parse(closeSession) : null);
    }

    /**
     * save current session
     * @param session
     */
    saveCurrentSession(session) {
        LocalStorageHelper.set(LocalStorageHelper.CURRENT_SESSION, JSON.stringify(session));
        Config.current_session = session;
    }

    /**
     * save close session
     * @param session
     */
    saveLocalCloseSession(session) {
        LocalStorageHelper.set(LocalStorageHelper.CLOSE_SESSION, JSON.stringify(session));
        Config.close_session = session;
    }

    /**
     * remove current session
     * @return {null}
     */
    removeCurrentSession() {
        LocalStorageHelper.remove(LocalStorageHelper.CURRENT_SESSION);
        Config.current_session = null;
    }

    /**
     * remove close session
     */
    removeCloseSession() {
        LocalStorageHelper.remove(LocalStorageHelper.CLOSE_SESSION);
        Config.close_session = null;
    }

    /**
     * get out date sessions
     * @return {*|Promise<{ids: Array}>}
     */
    getOutDateSessions() {
        return this.getResourceModel().getOutDateSessions();
    }

    /**
     * need direct session
     * @returns {boolean}
     */
    needDirectSession() {
        let currentSession = Config.current_session;
        if (SessionHelper.isEnableSession() && (!currentSession || !currentSession.shift_increment_id ||
                currentSession.status === SessionConstant.SESSION_CLOSE)) {
            return true;
        }
        return false;
    }

    /**
     * need open session
     * @returns {boolean}
     */
    needOpenSession() {
        if (!Config.current_session || Config.current_session.status === SessionConstant.SESSION_CLOSE) {
            return true;
        }
        return false;
    }

    /**
     * is set closing balance
     * @param session
     * @returns {boolean}
     */
    isSetClosingBalance(session) {
        if (session &&
            session.status === SessionConstant.SESSION_OPEN &&
            Config.close_session &&
            Config.close_session.shift_increment_id === session.shift_increment_id) {
            return true;
        }
        return false;
    }

    /**
     * get display date in session list
     * @param dateString
     * @return {string}
     */
    getDisplayDate(dateString) {
        let formatter = new Intl.DateTimeFormat(window.navigator.language, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
        return formatter.format(DateTimeHelper.convertDatabaseDateTimeToLocalDate(dateString));
    }

    /**
     * get display time in session list
     * @param dateString
     * @return {string}
     */
    getDisplayTime(dateString) {
        let formatter = new Intl.DateTimeFormat(window.navigator.language, {
            hour: 'numeric',
            minute: 'numeric',
        });
        return formatter.format(DateTimeHelper.convertDatabaseDateTimeToLocalDate(dateString));
    }

    /**
     * get offline by id
     * @param id
     * @return {*}
     */
    getOfflineById(id) {
        return this.getResourceModel().getOfflineById(id);
    }

    /**
     * prepare update session data
     * @param sessions
     * @return {Promise<*>}
     */
    async prepareUpdateSessionData(sessions) {
        let openSessionIndex = sessions.findIndex(session => session.status === SessionConstant.SESSION_OPEN);
        if (openSessionIndex > -1) {
            let openSession = sessions[openSessionIndex];
            let clientSession = await this.getOfflineById(openSession.shift_increment_id);

            if (clientSession) {
                openSession.cash_transaction.forEach(transaction => {
                    let transactionIndex = clientSession.cash_transaction.findIndex(
                        x => x.transaction_increment_id === transaction.transaction_increment_id
                    );
                    if (transactionIndex > -1) {
                        clientSession.cash_transaction[transactionIndex] = transaction;
                    } else {
                        clientSession.cash_transaction.push(transaction);
                    }
                });
                openSession.sale_summary.forEach(payment => {
                    let paymentIndex = clientSession.sale_summary.findIndex(
                        x => x.payment_date === payment.payment_date
                    );
                    if (paymentIndex > -1) {
                        clientSession.sale_summary[paymentIndex] = payment;
                    } else {
                        clientSession.sale_summary.push(payment);
                    }
                });
                sessions[openSessionIndex] = clientSession;
                this.saveCurrentSession(clientSession);
            }
        }

        return sessions;
    }

    /**
     * check current session is closed in update data's response
     * @param sessions
     */
    checkCurrentSessionIsClosed(sessions) {
        let openSession = sessions.find(item => item.status === SessionConstant.SESSION_OPEN);
        if (Config.current_session) {
            let session = sessions.find(
                session => session.shift_increment_id === Config.current_session.shift_increment_id
            );
            if (session && session.status === SessionConstant.SESSION_CLOSE && !openSession) {
                this.removeCurrentSession();
                if (window.location.hash.indexOf('/session') < 0) {
                    AppStore.dispatch(SessionAction.redirectToManageSession());
                }
            }
        }
        if (openSession) {
            this.saveCurrentSession(openSession);
        }
    }

    /**
     * get base total amount
     * @param session
     * @return {number}
     */
    getBaseTotalAmount(session) {
        let baseTotalAmount = 0;
        session.sale_summary.forEach(item => {
            if (item.type === PaymentConstant.TYPE_CHECKOUT) {
                baseTotalAmount = NumberHelper.addNumber(baseTotalAmount, item.base_amount_paid);
            }
        });
        session.cash_transaction.forEach(item => {
            if (item.type === SessionConstant.CASH_TRANSACTION_CHANGE) {
                baseTotalAmount = NumberHelper.minusNumber(baseTotalAmount, item.base_value);
            }
        });
        return baseTotalAmount;
    }

    /**
     * get total amount
     * @param session
     * @return {number}
     */
    getTotalAmount(session) {
        let baseTotalAmount = 0;
        session.sale_summary.forEach(item => {
            if (item.type === PaymentConstant.TYPE_CHECKOUT) {
                baseTotalAmount = NumberHelper.addNumber(baseTotalAmount, item.amount_paid);
            }
        });
        session.cash_transaction.forEach(item => {
            if (item.type === SessionConstant.CASH_TRANSACTION_CHANGE) {
                baseTotalAmount = NumberHelper.minusNumber(baseTotalAmount, item.value);
            }
        });
        return baseTotalAmount;
    }


    /**
     * Display total amount
     * @param session
     * @returns {*|string}
     */
    getDisplayTotalAmount(session) {
        return CurrencyHelper.format(this.getTotalAmount(session), session.shift_currency_code);
    }

    /**
     * get base total refund amount
     * @param session
     * @return {number}
     */
    getBaseTotalRefund(session) {
        let baseTotalRefund = 0;
        session.sale_summary.map(item => {
            if (item.type === PaymentConstant.TYPE_REFUND) {
                baseTotalRefund = NumberHelper.addNumber(baseTotalRefund, item.base_amount_paid);
            }
            return null;
        });
        return baseTotalRefund;
    }


    /**
     * get total refund amount
     * @param session
     * @return {number}
     */
    getTotalRefund(session) {
        let baseTotalRefund = 0;
        session.sale_summary.map(item => {
            if (item.type === PaymentConstant.TYPE_REFUND) {
                baseTotalRefund = NumberHelper.addNumber(baseTotalRefund, item.amount_paid);
            }
            return null;
        });
        return baseTotalRefund;
    }

    /**
     * Display total refund
     * @param session
     */
    getDisplayTotalRefund(session) {
        let totalRefund = this.getTotalRefund(session);
        if (totalRefund !== 0) {
            return "-" + CurrencyHelper.format(totalRefund, session.shift_currency_code);
        } else {
            return CurrencyHelper.format(totalRefund, session.shift_currency_code);
        }
    }

    /**
     * get base net amount
     * @param session
     * @return {number}
     */
    getBaseNetAmount(session) {
        return (this.getBaseTotalAmount(session) - this.getBaseTotalRefund(session));
    }

    /**
     * get net amount
     * @param session
     * @return {number}
     */
    getNetAmount(session) {
        return (this.getTotalAmount(session) - this.getTotalRefund(session));
    }

    /**
     * Display net amount
     * @param session
     * @returns {*|string}
     */
    getDisplayNetAmount(session) {
        return CurrencyHelper.format(this.getNetAmount(session), session.shift_currency_code);
    }

    /**
     * get info payment method
     * @param session
     * @returns {Array}
     */
    getInfoPaymentMethod(session) {
        let infoPayments = [];
        let saleSummary = session.sale_summary ? session.sale_summary : [];
        saleSummary.forEach((payment) => {
            let hasExisted = false;
            infoPayments.map((infoPayment) => {
                if (infoPayment.method === payment.method) {
                    hasExisted = true;
                    if (payment.type === PaymentConstant.TYPE_REFUND) {
                        infoPayment.amount_paid -= payment.amount_paid;
                    } else {
                        infoPayment.amount_paid += payment.amount_paid;
                    }
                }
                return infoPayments;
            });

            if (!hasExisted) {
                let infoPayment = {};
                infoPayment.method = payment.method;
                infoPayment.title = payment.title;
                if (payment.type === PaymentConstant.TYPE_REFUND) {
                    infoPayment.amount_paid = 0 - payment.amount_paid;
                } else {
                    infoPayment.amount_paid = payment.amount_paid;
                }
                infoPayments.push(infoPayment);
            }
        });

        let totalChange = 0;
        let cashTransaction = session.cash_transaction ? session.cash_transaction : [];
        cashTransaction.forEach((transaction) => {
            if (transaction.type === SessionConstant.CASH_TRANSACTION_CHANGE) {
                totalChange += transaction.value;
            }
        });

        infoPayments.map((infoPayment) => {
            if (infoPayment.method === PaymentConstant.CASH) {
                infoPayment.amount_paid -= totalChange;
            }
            return infoPayments;
        });
        return infoPayments;
    }
}

/** @type SessionService */
let sessionService = ServiceFactory.get(SessionService);

export default sessionService;