const CONFIGURATION_URLS = [
    "https://iclient.tyro.com/",
    "https://iclient.test.tyro.com/",
    "https://iclientsimulator.test.tyro.com/"
];

export default {
    INTEGRATION_KEY       : "POS_TYRO_CONFIG_INTEGRATION_KEY",
    API_KEY               : "api_key",
    MERCHANT_ID           : "merchant_id",
    CONFIG_TERMINAL_ID    : "POS_TYRO_CONFIG_TERMINAL_ID",
    INTEGRATED_RECEIPT_KEY: "POS_TYRO_CONFIG_INTEGRATED_RECEIPT",

    /* Request type to tyro */
    TRANSACTION_TYPE_LOGON             : 0,
    TRANSACTION_TYPE_SALE              : 1,
    TRANSACTION_TYPE_SETTLE            : 4,
    TRANSACTION_TYPE_GET_DIALOG_REQUEST: 99,
    TRANSACTION_TYPE_SEND_DIALOG_RESULT: 100,

    /** Authorization mode to tyro */
    LIVE_URL     : CONFIGURATION_URLS[0],
    TEST_URL     : CONFIGURATION_URLS[1],
    SIMULATOR_URL: CONFIGURATION_URLS[2],

    /** Mode */
    LIVE_MODE     : 'live',
    TEST_MODE     : 'test',
    SIMULATOR_MODE: 'simulator',

    /* Message type of response from Tyro*/
    MESSAGE_TYPE_DIALOG_REQUEST : "DialogRequest",
    MESSAGE_TYPE_RECEIPT_REQUEST: "ReceiptRequest",
    MESSAGE_TYPE_SALE_RESPONSE  : "SaleResponse",

    /* Dialog id of response from Tyro*/
    DIALOG_ID_READ_CARD      : 109,
    DIALOG_ID_BYPASS_PIN     : 121,
    DIALOG_ID_APPROVE_OFFLINE: 124,

    /* Dialog type of response from Tyro */
    DIALOG_TYPE_INFORMATION : 1,
    DIALOG_TYPE_CONFIRMATION: 2,
    DIALOG_TYPE_TEXT_ENTRY  : 6,

    /** Constant result from tyro terminal response */
    RESULT_SUCCESFULL   : 0,
    RESULT_TERMINAL_BUSY: 218,

    /** Constant transaction result from tyro terminal response */
    TRANSACTION_RESULT_APPROVED   : 'APPROVED',
    TRANSACTION_RESULT_DECLINED   : 'DECLINED',
    TRANSACTION_RESULT_REVERSED   : 'REVERSED',
    TRANSACTION_RESULT_CANCELLED  : 'CANCELLED',
    TRANSACTION_RESULT_NOT_STARTED: 'NOT STARTED',
    TRANSACTION_RESULT_SYSTEM_ERROR: 'SYSTEM ERROR',

    PROCESS_PAYMENT: '[TYRO] PROCESS_PAYMENT',
}
