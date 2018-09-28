import ConfigHelper from "./ConfigHelper";
import ConfigConstant from "../view/constant/catalog/stock/ConfigConstant";

export default {

    /**
     * Get settings is manage stock
     *
     * @return {boolean}
     */
    isManageStock() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_MANAGE_STOCK) === '1';
    },

    /**
     * Get settings is back order stock
     *
     * @return {boolean}
     */
    isBackOrder() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_BACKORDERS) === '1';
    },

    /**
     * Get settings max sale qty stock
     *
     * @return {number}
     */
    getMaxSaleQty() {
        return parseFloat(ConfigHelper.getConfig(ConfigConstant.XML_PATH_MAX_SALE_QTY));
    },

    /**
     * Get settings min sale qty stock
     *
     * @return {number}
     */
    getMinSaleQty() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_MIN_SALE_QTY);
    },

    /**
     * Get settings out of stock threshold qty stock
     *
     * @return {number}
     */
    getOutOfStockThreshold() {
        let minQty = ConfigHelper.getConfig(ConfigConstant.XML_PATH_MIN_QTY);
        return (minQty !== null && minQty !== '') ? parseFloat(minQty) : 0;
    },

    /**
     * Get settings enable qty increment stock
     *
     * @return {boolean}
     */
    isEnableQtyIncrements() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_ENABLE_QTY_INCREMENTS) === '1';
    },

    /**
     * Get settings qty increment stock
     *
     * @return {number}
     */
    getQtyIncrement() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_QTY_INCREMENTS);
    },

    /**
     * Check if is possible subtract value from item qty
     * @return {boolean}
     */
    canSubtractQty() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_CAN_SUBTRACT) === '1';
    },

    /**
     * Retrieve can Back in stock
     *
     * @return {boolean}
     */
    getCanBackInStock() {
        return ConfigHelper.getConfig(ConfigConstant.XML_PATH_CAN_BACK_IN_STOCK) === '1';
    },

    /**
     * @return {*|null}
     */
    getMinQty() {
        return +ConfigHelper.getConfig(ConfigConstant.XML_PATH_MIN_QTY);
    }
}