export default {
    /**
     * tax classes
     * */
    CONFIG_XML_PATH_SHIPPING_TAX_CLASS: 'tax/classes/shipping_tax_class',

    /**
     * tax calculation
     * */
    CONFIG_XML_PATH_PRICE_INCLUDES_TAX: 'tax/calculation/price_includes_tax',
    CONFIG_XML_PATH_SHIPPING_INCLUDES_TAX: 'tax/calculation/shipping_includes_tax',
    CONFIG_XML_PATH_BASED_ON: 'tax/calculation/based_on',
    CONFIG_XML_PATH_APPLY_ON: 'tax/calculation/apply_tax_on',
    CONFIG_XML_PATH_APPLY_AFTER_DISCOUNT: 'tax/calculation/apply_after_discount',
    CONFIG_XML_PATH_DISCOUNT_TAX: 'tax/calculation/discount_tax',
    XML_PATH_ALGORITHM: 'tax/calculation/algorithm',
    CONFIG_XML_PATH_CROSS_BORDER_TRADE_ENABLED: 'tax/calculation/cross_border_trade_enabled',

    /**
     * tax defaults
     * */
    CONFIG_XML_PATH_DEFAULT_COUNTRY: 'tax/defaults/country',
    CONFIG_XML_PATH_DEFAULT_REGION: 'tax/defaults/region',
    CONFIG_XML_PATH_DEFAULT_POSTCODE: 'tax/defaults/postcode',

    /**
     * Prices display settings
     */
    CONFIG_XML_PATH_PRICE_DISPLAY_TYPE: 'tax/display/type',

    /**
     * Shopping cart display settings
     */
    XML_PATH_DISPLAY_CART_PRICE: 'tax/cart_display/price',

    DISPLAY_TYPE_EXCLUDING_TAX: 1,
    DISPLAY_TYPE_INCLUDING_TAX: 2,
    DISPLAY_TYPE_BOTH: 3,

    /**
     * Price conversion constant for positive
     */
    PRICE_CONVERSION_PLUS: 1,

    /**
     * Price conversion constant for negative
     */
    PRICE_CONVERSION_MINUS: 2,

    GET_TAX_RATE_ONLINE: 'GET_TAX_RATE_ONLINE',
    GET_TAX_RATE_ONLINE_RESULT: 'GET_TAX_RATE_ONLINE_RESULT',
    GET_TAX_RATE_ONLINE_ERROR: 'GET_TAX_RATE_ONLINE_ERROR',

    GET_TAX_RULE_ONLINE: 'GET_TAX_RULE_ONLINE',
    GET_TAX_RULE_ONLINE_RESULT: 'GET_TAX_RULE_ONLINE_RESULT',
    GET_TAX_RULE_ONLINE_ERROR: 'GET_TAX_RULE_ONLINE_ERROR',

    /**
     * Price display POS settings
     */
    XML_PATH_PRODUCT_LIST_DISPLAY_PRICE: 'webpos/tax_configuration/price_display/product_list',
    XML_PATH_DISPLAY_SHIPPING_PRICE: 'webpos/tax_configuration/price_display/shipping',

    /**
     * Shopping cart display POS settings
     */
    XML_PATH_SHOPPING_CART_DISPLAY_PRICE: 'webpos/tax_configuration/shopping_cart_display/price',
    XML_PATH_SHOPPING_CART_DISPLAY_SUBTOTAL: 'webpos/tax_configuration/shopping_cart_display/subtotal',
    XML_PATH_SHOPPING_CART_DISPLAY_SHIPPING_AMOUNT: 'webpos/tax_configuration/shopping_cart_display/shipping_amount',
    XML_PATH_DISPLAY_FULL_TAX_SUMMARY: 'webpos/tax_configuration/shopping_cart_display/full_tax_summary',
    XML_PATH_DISPLAY_ZERO_SUBTOTAL: 'webpos/tax_configuration/shopping_cart_display/zero_tax_subtotal',

    /**
     * Orders, Invoices, Credit Memos display price POS settings
     */
    XML_PATH_ORDER_DISPLAY_PRICE: "webpos/tax_configuration/tax_display/price",
    XML_PATH_ORDER_DISPLAY_SUBTOTAL: "webpos/tax_configuration/tax_display/subtotal",
    XML_PATH_ORDER_DISPLAY_SHIPPING_AMOUNT: "webpos/tax_configuration/tax_display/shipping_amount",
    XML_PATH_ORDER_DISPLAY_ZERO_TAX_SUBTOTAL: "webpos/tax_configuration/tax_display/zero_tax_subtotal",
}