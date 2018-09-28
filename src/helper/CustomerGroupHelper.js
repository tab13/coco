import Config from '../config/Config';
import ConfigHelper from "./ConfigHelper";

export default {
    customer_groups: null,

    /**
     * get all customer group object
     *
     * @return {array}
     */
    getAllCustomerGroup() {
        if (!this.customer_groups) {
            this.customer_groups = Config.config.customer_groups;
        }
        return this.customer_groups;
    },

    /**
     * get list customer group show in popup customer
     * @return {array}
     */
    getShowCustomerGroup() {
        let customer_group = this.getAllCustomerGroup().filter(function(item){
            return item.id !== 0;
        });
        return customer_group;
    },

    /**
     * get customer group id in quote
     *
     * @param quote
     * @return {number}
     */
    getQuoteCustomerGroupId(quote) {
        if (quote.customer && quote.customer.group_id) {
            return quote.customer.group_id;
        }
        return 0;
    },

    /**
     * get tax class id by customer group id
     *
     * @param {number} groupId
     * @return {number}
     */
    getTaxClassId(customerGroupId) {
        let customerGroup = this.getAllCustomerGroup().find(group => group.id === Number(customerGroupId));
        return customerGroup.tax_class_id;
    },

    /**
     * Get default customer group id
     */
    getDefaultCustomerGroupId() {
        return ConfigHelper.getConfig('customer/create_account/default_group');
    }
}