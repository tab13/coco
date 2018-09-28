import Config from '../config/Config'
import ConfigHelper from "./ConfigHelper";
import cloneDeep from 'lodash/cloneDeep';
import _ from 'lodash';

export default {
    denominations: null,

    /**
     * is enable session
     * @returns {boolean}
     */
    isEnableSession() {
        let isEnable = ConfigHelper.getConfig('webpos/session/enable');
        return !!(isEnable && isEnable === '1');
    },

    /**
     * is enable cash control
     * @returns {boolean}
     */
    isEnableCashControl() {
        let isEnable = ConfigHelper.getConfig('webpos/session/enable_cash_control');
        return !!(isEnable && isEnable === '1');
    },

    /**
     * get denominations
     * @returns {null}
     */
    getDenominations() {
        if (Config.config && Config.config.denominations) {
            this.denominations = _.orderBy(cloneDeep(Config.config.denominations), 'sort_order');
        }
        return this.denominations;
    },

    /**
     * get default denomination
     * @returns {*}
     */
    getDefaultDenomination() {
        if (!this.getDenominations() || this.getDenominations().length <= 0) {
            return null;
        }
        return this.getDenominations()[0];
    }
}