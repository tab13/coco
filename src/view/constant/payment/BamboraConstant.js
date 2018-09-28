export default {
    CONFIG_TERMINAL_IP_ADDRESS: "POS_BAMBORA_CONFIG_TERMINAL_IP_ADDRESS",
    CONFIG_TERMINAL_PORT: "POS_BAMBORA_CONFIG_TERMINAL_PORT",
    CONFIG_TERMINAL_MODE: "POS_BAMBORA_CONFIG_TERMINAL_MODE",

    DEFAULT_CONFIG_TERMINAL_PORT: "1337",

    /* Request type to bambora */
    TRANSACTION_TYPE_LOGON: 0,
    TRANSACTION_TYPE_SALE: 1,
    TRANSACTION_TYPE_SETTLE: 4,
    TRANSACTION_TYPE_GET_DIALOG_REQUEST: 99,
    TRANSACTION_TYPE_SEND_DIALOG_RESULT: 100,

    /** Authorization mode to bambora */
    MODE_ONLINE: '1',
    MODE_OFFLINE: '2',
    MODE_PHONE: '3',

    /* Message type of response from Bambora*/
    MESSAGE_TYPE_DIALOG_REQUEST: "DialogRequest",
    MESSAGE_TYPE_RECEIPT_REQUEST: "ReceiptRequest",
    MESSAGE_TYPE_SALE_RESPONSE: "SaleResponse",

    /* Dialog id of response from Bambora*/
    DIALOG_ID_READ_CARD: 109,
    DIALOG_ID_BYPASS_PIN: 121,
    DIALOG_ID_APPROVE_OFFLINE: 124,

    /* Dialog type of response from Bambora */
    DIALOG_TYPE_INFORMATION: 1,
    DIALOG_TYPE_CONFIRMATION: 2,
    DIALOG_TYPE_TEXT_ENTRY: 6,

    /** Constant result from bambora terminal response */
    RESULT_SUCCESFULL: 0,
    RESULT_TERMINAL_BUSY: 218,

    /** Constant transaction result from bambora terminal response */
    TRANSACTION_RESULT_APPROVED: 0,
    TRANSACTION_RESULT_DECLINED: 1,
    TRANSACTION_RESULT_CANCELLED: 2,

    PROCESS_PAYMENT: '[BAMBORA] PROCESS_PAYMENT',
}
