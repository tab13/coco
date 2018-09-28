import {PaymentAbstract} from "./PaymentAbstract";
import BamboraConstant from "../../../view/constant/payment/BamboraConstant";
import BamboraPrintService from "./bambora/BamboraPrintService";
import LocalStorageHelper from "../../../helper/LocalStorageHelper";
import ServiceFactory from "../../../framework/factory/ServiceFactory";
import BamboraPopupService from "./bambora/BamboraPopupService";
import PaymentConstant from "../../../view/constant/PaymentConstant";
import ConfigHelper from "../../../helper/ConfigHelper";
import CurrencyHelper from "../../../helper/CurrencyHelper";
import i18n from "../../../config/i18n";
import NumberHelper from "../../../helper/NumberHelper";
import {toast} from "react-toastify";

export class BamboraPaymentService extends PaymentAbstract {
    code = PaymentConstant.BAMBORA_INTEGRATION;

    url = "http://127.0.0.1:60000";

    /**
     * Check enable payment bambora
     *
     * @return {boolean}
     */
    isEnable() {
        return ConfigHelper.getConfig('webpos/payment/bambora/enable') === '1';
    }

    /**
     * Get terminal device IP
     *
     * @return {string}
     */
    getIP() {
        return LocalStorageHelper.get(BamboraConstant.CONFIG_TERMINAL_IP_ADDRESS) || "";
    }

    /**
     * Get terminal device port;
     *
     * @return {string}
     */
    getPort() {
        let port = LocalStorageHelper.get(BamboraConstant.CONFIG_TERMINAL_PORT);
        return port !== null ? port : BamboraConstant.DEFAULT_CONFIG_TERMINAL_PORT;
    }

    /**
     * Get authorization mode
     *
     * @return {*}
     */
    getMode() {
        let mode = LocalStorageHelper.get(BamboraConstant.CONFIG_TERMINAL_MODE);
        return mode === "true" ? BamboraConstant.MODE_OFFLINE : BamboraConstant.MODE_ONLINE;
    }

    getDefaultRequestParams() {
        return {
            "device": 'bambora',
            "ip": this.getIP(),
            "port": this.getPort(),
            "mode": this.getMode()
        };
    }

    /**
     * Make request to POS Hub
     *
     * @param params
     * @return {Promise<any>}
     */
    async request(params) {
        let body = "";
        for (let key in params) {
            body += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
        }
        return new Promise((resolve, reject) => {
            fetch(this.url,
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    mode: 'cors',
                    body: body
                })
                .then(response => response.json()
                    .then(function (data) {
                        if (response.ok) {
                            return resolve(data);
                        } else {
                            return reject(data);
                        }
                    })
                ).catch(error => reject('fail'))
        })
    }

    async execute() {
        let response = await this.sendSaleRequest();
        return response;
    }

    /**
     * Test bambora connection
     *
     * @return {Promise<*>}
     */
    testConnection() {
        let params = this.getDefaultRequestParams();
        params.type = BamboraConstant.TRANSACTION_TYPE_LOGON;
        return new Promise((resolve, reject) => {
            this.request(params, true).then(response => {
                if (response.ResponseStatus === 'success') {
                    resolve('success');
                } else {
                    resolve('fail');
                }
            }).catch(error => {
                resolve('fail');
            })
        });
    }

    /**
     * Send sale request to POS Hub
     *
     * @return {Promise<void>}
     */
    async sendSaleRequest() {
        let params = this.getDefaultRequestParams();
        params.type = BamboraConstant.TRANSACTION_TYPE_SALE;
        let parent = this.quote || this.order;
        params.amount = NumberHelper.multipleNumber(this.payment.amount_paid, 100);
        params.currency = parent.order_currency_code || CurrencyHelper.getCurrentCurrencyCode();
        try {
            let response = await this.request(params);
            response = await this.processResponse(response);
            return this.processResult(response);
        } catch (error) {
            if (typeof error === 'string' && error === 'fail') {
                toast.error(
                    i18n.translator.translate('Cannot connect to Bambora terminal!'),
                    {
                        className: 'wrapper-messages messages-warning',
                        autoClose: 2000
                    }
                );
                return {
                    error: true,
                    errorMessage: i18n.translator.translate('Cannot connect to Bambora terminal!')
                }
            }
            return {
                error: true,
                errorMessage: i18n.translator.translate('Cannot connect to Bambora terminal!')
            }
        }
    }

    /**
     * Process response from POS Hub
     *
     * @param response
     * @return {*}
     */
    processResponse(response) {
        if (response.ResponseStatus === 'fail') {
            toast.error(
                i18n.translator.translate('Cannot connect to Bambora terminal!'),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 2000
                }
            );
            return {
                error: true,
                errorMessage: i18n.translator.translate('Cannot connect to Bambora terminal!')
            }
        }
        if (response.GetMessageType === BamboraConstant.MESSAGE_TYPE_DIALOG_REQUEST) {
            if (response.ReceiptData) {
                BamboraPrintService.print(response.ReceiptData);
            }
            return BamboraPopupService.showPopup(this, response);
        }
        if (response.GetMessageType === BamboraConstant.MESSAGE_TYPE_RECEIPT_REQUEST) {
            return new Promise((resolve, reject) => {
                BamboraPopupService.acceptResponse(this, response, resolve, reject);
            });
        }
        if (response.GetMessageType === BamboraConstant.MESSAGE_TYPE_SALE_RESPONSE) {
            return response;
        }
    }

    /**
     * Process final result
     *
     * @param result
     * @return {{error: boolean}}
     */
    processResult(result) {
        let response = {error: true};
        if (result.GetMessageType === BamboraConstant.MESSAGE_TYPE_SALE_RESPONSE) {
            if (result.Result === BamboraConstant.RESULT_SUCCESFULL &&
                result.TransactionResult === BamboraConstant.TRANSACTION_RESULT_APPROVED) {
                BamboraPrintService.print(result.ReceiptData);
                Object.assign(response, {
                    error: false,
                    reference_number: result.TransactionReference || result.RetrievalReference,
                    card_type: result.CardType
                });
            } else if (result.TransactionResult === BamboraConstant.TRANSACTION_RESULT_CANCELLED) {
                if (result.DialogText) {
                    BamboraPopupService.showPopup(this, result);
                }
                response.errorMessage = i18n.translator.translate('Transaction is cancelled.');
            } else if (result.TransactionResult === BamboraConstant.TRANSACTION_RESULT_DECLINED) {
                if (result.DialogText) {
                    BamboraPopupService.showPopup(this, result);
                }
                response.errorMessage = i18n.translator.translate('Transaction is declined.');
            } else if (result.Result === BamboraConstant.RESULT_TERMINAL_BUSY) {
                response.errorMessage = i18n.translator.translate('Terminal busy.');
            }
            BamboraPopupService.closePopup();
        }
        return response;
    }

    cancelTransaction() {

    }
}

/**
 * @type {BamboraPaymentService}
 */
let bamboraPaymentService = ServiceFactory.get(BamboraPaymentService);

export default bamboraPaymentService;