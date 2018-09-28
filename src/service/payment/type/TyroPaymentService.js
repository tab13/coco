import {PaymentAbstract} from "./PaymentAbstract";
import TyroConstant from "../../../view/constant/payment/TyroConstant";
import TyroPrintService from "./tyro/TyroPrintService";
import LocalStorageHelper from "../../../helper/LocalStorageHelper";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import TyroPopupService from "./tyro/TyroPopupService";
import PaymentConstant from "../../../view/constant/PaymentConstant";
import ConfigHelper from "../../../helper/ConfigHelper";
import i18n from "../../../config/i18n";
import TYRO from '../../../helper/TyroIClient';
import PaymentService from "../PaymentService";
import * as _ from "lodash";

let posProductInfo = {
    posProductVendor: "magestore.com", posProductName: "PWA POS", posProductVersion: "1.0.0"
};

export class TyroPaymentService extends PaymentAbstract {
    code = PaymentConstant.TYRO_INTEGRATION;

    /**
     * Check enable payment bambora
     *
     * @return {boolean}
     */
    isEnable() {
        return true || ConfigHelper.getConfig('webpos/payment/tyro/enable') === '1';
    }

    /**
     * Get terminal device port;
     *
     * @return {string}
     */
    getTerminalId() {
        return LocalStorageHelper.get(TyroConstant.CONFIG_TERMINAL_ID) || "";
    }

    /**
     *
     * @param key
     * @return {*}
     */
    setTerminalId(key) {
        return LocalStorageHelper.set(TyroConstant.CONFIG_TERMINAL_ID, key);
    }

    /**
     * Get authorization mode
     *
     * @param payment
     * @return {Promise<*>}
     */
    async getConfigConfigurationUrl(payment = false) {
        payment = payment || await this.getPaymentMethod();
        if (payment.mode === TyroConstant.LIVE_MODE) {
            return TyroConstant.LIVE_URL;
        }
        if (payment.mode === TyroConstant.TEST_MODE) {
            return TyroConstant.TEST_URL;
        }
        return TyroConstant.SIMULATOR_URL;
    }

    /**
     * Get merchant ID
     * @param payment
     * @return {Promise<*>}
     */
    async getMerchantId(payment = false) {
        payment = payment || await this.getPaymentMethod();
        return payment[TyroConstant.MERCHANT_ID];
    }

    /**
     * Get authorization mode
     * @param payment
     * @return {Promise<*>}
     */
    async getApiKey(payment = false) {
        payment = payment || await this.getPaymentMethod();
        return payment[TyroConstant.API_KEY];
    }

    /**
     *
     * @param key
     * @return {*}
     */
    setIntegrationKey(key) {
        return LocalStorageHelper.set(TyroConstant.INTEGRATION_KEY, key);
    }

    /**
     *
     * @return {*}
     */
    getIntegrationKey() {
        return LocalStorageHelper.get(TyroConstant.INTEGRATION_KEY);
    }


    /**
     *
     * @return {boolean}
     */
    async getMode() {
        let payment = await this.getPaymentMethod();
        return payment.mode;
    }

    /**
     *
     * @return {Promise<*>}
     */
    getPaymentMethod() {
        return PaymentService.getByCode(PaymentConstant.TYRO_INTEGRATION)
    }


    /**
     *
     * @return {boolean}
     */
    getIntegratedReceipt() {
        return !!_.toNumber(LocalStorageHelper.get(TyroConstant.INTEGRATED_RECEIPT_KEY));
    }

    /**
     *
     * @param value
     * @return {*}
     */
    setIntegratedReceipt(value) {
        return LocalStorageHelper.set(TyroConstant.INTEGRATED_RECEIPT_KEY, value ? 1 : 0);
    }

    async execute() {
        if (this.getCreditmemo()) {
            return await this.sendRefundRequest();
        }

        return await this.sendSaleRequest();
    }

    /**
     *
     * @param callback
     * @param cancelCallback
     * @return {Promise<void>}
     */
    async testConnection(callback, cancelCallback) {
        const payment        = await this.getPaymentMethod();
        let apiKey           = await this.getApiKey(payment);
        let configurationUrl = await this.getConfigConfigurationUrl(payment);
        let iClient          = new TYRO.IClient(apiKey, posProductInfo);

        TyroPopupService.showPopup(this, { message: 'Initiating...' }, cancelCallback);
        return iClient.customTerminalInfo(configurationUrl, response => {
            if ("success" === response.status) {
                this.setIntegrationKey(response.integrationKey);
                TyroPopupService.showPopup(this, {
                    message: response.message,
                    options: ['OK'],
                    terminalInfo: response.terminalInfo
                }, cancelCallback);
            } else if ("failure" === response.status) {
                TyroPopupService.showPopup(this, {
                    message: response.message,
                    options: ['OK'],
                    isError: true
                }, cancelCallback);
            } else {
                TyroPopupService.showMessage(this, response.message);
            }

            callback(response);
        });
    }

    /**
     *
     * @param callback
     * @param cancelCallback
     * @return {Promise<void>}
     */
    async pairConnection(callback, cancelCallback) {
        const payment = await this.getPaymentMethod();
        let iClient   = new TYRO.IClient(await this.getApiKey(payment), posProductInfo);
        TyroPopupService.showPopup(this, { message: 'Initiating...' }, cancelCallback);
        return iClient.customPairTerminal(
            await this.getConfigConfigurationUrl(payment),
            await this.getMerchantId(payment),
            this.getTerminalId(),
            response => {
                if ("success" === response.status) {
                    this.setIntegrationKey(response.integrationKey);
                    TyroPopupService.showMessage(this, response.message);
                    TyroPopupService.closePopup();
                } else if ("failure" === response.status) {
                    TyroPopupService.showPopup(this, {
                        message: response.message,
                        options: ['OK'],
                        isError: true
                    }, cancelCallback);
                } else {
                    TyroPopupService.showMessage(this, response.message);
                }

                callback(response);
            }
        );
    }

    /**
     * Send sale request to POS Hub
     * @return {Promise<void>}
     */
    async sendSaleRequest() {
        const payment = await this.getPaymentMethod();
        let iClient   = new TYRO.IClient(await this.getApiKey(payment), posProductInfo);
        TyroPopupService.showPopup(this, { message: 'Initiating...' }, iClient.cancelCurrentTransaction);
        return new Promise(async (resolve, reject) => {
            iClient.customInitiatePurchase(
                await this.getConfigConfigurationUrl(payment),
                {
                    amount           : (this.payment.amount_paid * 100).toFixed(0),
                    cashout          : "0",
                    integratedReceipt: this.getIntegratedReceipt()
                },
                {
                    receiptCallback            : function (receipt) {
                        receipt.merchantReceipt && TyroPrintService.print(receipt.merchantReceipt);
                    },
                    transactionCompleteCallback: (response) => {
                        resolve(this.processResult(response));

                    },
                    questionCallback           : (question, answerCallback) => {
                        const {options, isError} = question;
                        TyroPopupService.showPopup(this, {
                            message: question.text,
                            options,
                            isError,
                            answerCallback
                        }, iClient.cancelCurrentTransaction);
                    },
                    statusMessageCallback      : (message) => {
                        message && TyroPopupService.showMessage(this, message);
                    }
                });
        });

    }

    /**
     * Send sale request to POS Hub
     * @return {Promise<void>}
     */
    async sendRefundRequest() {
        const payment = await this.getPaymentMethod();
        let iClient   = new TYRO.IClient(await this.getApiKey(payment), posProductInfo);
        TyroPopupService.showPopup(this, { message: 'Initiating...' });
        return new Promise(async (resolve, reject) => {
            iClient.customInitiateRefund(
                await this.getConfigConfigurationUrl(payment),
                {
                    amount           : (this.payment.amount_paid * 100).toFixed(0),
                    cashout          : "0",
                    integratedReceipt: this.getIntegratedReceipt()
                },
                {
                    receiptCallback            : function (receipt) {
                        receipt.merchantReceipt && TyroPrintService.print(receipt.merchantReceipt);
                    },
                    transactionCompleteCallback: (response) => {
                        resolve(this.processResult(response));

                    },
                    questionCallback           : (question, answerCallback) => {
                        const {options, isError} = question;
                        TyroPopupService.showPopup(this, {
                            message: question.text,
                            options,
                            isError,
                            answerCallback
                        });
                    },
                    statusMessageCallback      : (message) => {
                        message && TyroPopupService.showMessage(this, message);
                    }
                });
        });

    }

    /**
     * Process final result
     *
     * @param result
     * @return {{error: boolean}}
     */
    processResult(result) {
        let response = {error: true};
        if (result.result === TyroConstant.TRANSACTION_RESULT_APPROVED) {
            this.customerReceipt = result.customerReceipt;
            Object.assign(response, {
                receipt         : result.customerReceipt,
                error           : false,
                reference_number: result.transactionId || result.transactionReference,
                card_type       : result.cardType
            });

            TyroPopupService.clearOptions();
            TyroPopupService.closePopup();
            return response;
        }

        // if (result.result === TyroConstant.TRANSACTION_RESULT_CANCELLED) {
        //     response.errorMessage = i18n.translator.translate('Transaction is cancelled.');
        // } else if (result.result === TyroConstant.TRANSACTION_RESULT_DECLINED) {
        //     response.errorMessage = i18n.translator.translate('Transaction is declined.');
        // } else if (result.result === TyroConstant.TRANSACTION_RESULT_REVERSED) {
        //     response.errorMessage = i18n.translator.translate('Transaction is reversed.');
        // } else if (result.result === TyroConstant.TRANSACTION_RESULT_SYSTEM_ERROR) {
        //     response.errorMessage =
        //         i18n.translator.translate(
        //             `System error, Transaction: ${result.transactionId || result.transactionReference}`
        //         );
        // } else if (result.result === TyroConstant.TRANSACTION_RESULT_NOT_STARTED) {
        //
        // }

        let message = TyroPopupService.getMessage();

        if (message) {
            response.errorMessage = i18n.translator.translate(message);
        }

        TyroPopupService.clearOptions();
        TyroPopupService.closePopup();
        return response;
    }

    cancelTransaction() {

    }
}

/**
 * @type {TyroPaymentService}
 */
let tyroPaymentService = ServiceFactory.get(TyroPaymentService);

export default tyroPaymentService;