import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";

export class CustomerListService extends CoreService {
    static className = 'CustomerListService';

    /**
     * Get current customer list object with key email
     *
     * @param customerList
     * @return {{}}
     */
    getCurrentCustomerListObjectEmail(customerList = []) {
        let customerEmails = {};
        customerList.map(customer => {
            customerEmails[customer.email] = customer;
            return customer;
        });
        return customerEmails;
    }

    /**
     * Add list search customer to customer list
     *
     * @param {object[]} customerList
     * @param {object[]} searchCustomer
     * @return {object[]}
     */
    addCustomerToList(customerList = [], searchCustomer = []) {
        let customerEmails = this.getCurrentCustomerListObjectEmail(customerList);
        searchCustomer.map(customer => {
            if (customerEmails[customer.email]) {
                return customer;
            }
            customerList.push(customer);
            return customer;
        });
        return customerList;
    }

    /**
     * Update customer list when create new or update customer
     *
     * @param {object[]} customerList
     * @param {object[]} customers
     * @return {object[]}
     */
    updateCustomerList(customerList = [], customers = []) {
        let customerEmails = this.getCurrentCustomerListObjectEmail(customerList);
        customers.map(customer => {
            if (!customerEmails[customer.email]) {
                customerList.unshift(customer);
            } else {
                let findIndex = customerList.findIndex(item => item.email === customer.email);
                if (findIndex !== -1) {
                    customerList[findIndex] = customer;
                }
            }
            return customer;
        });
        return customerList;
    }

    /**
     * Update customer list after sync action update finish
     *
     * @param {object[]} customerList
     * @param {object[]} customers
     * @return {object[]}
     */
    updateCustomerListAfterSyncActionUpdate(customerList = [], customers = []) {
        if (customers && customers.length) {
            let updateCustomers = this.prepareUpdateCustomerData(customers);
            customerList.map(customer => {
                this.prepareUpdatedItem(customer, updateCustomers);
                return customer;
            });
        }
        return customerList;
    }

    /**
     * Prepare update customer data
     *
     * @param customers
     * @return {{}}
     */
    prepareUpdateCustomerData(customers) {
        let updateCustomers = {};
        customers.map(customer => {
            if (customer && customer.id) {
                updateCustomers[customer.id] = customer;
            }
            return customer;
        });
        return updateCustomers;
    }

    /**
     * Prepare updated item
     *
     * @param customer
     * @param updateCustomers
     * @return {*}
     */
    prepareUpdatedItem(customer, updateCustomers) {
        if (updateCustomers[customer.id]) {
            let uodateCustomer = updateCustomers[customer.id];
            Object.keys(uodateCustomer).map(key => {
                customer[key] = uodateCustomer[key];
                return key;
            });
        }
        return customer;
    }

    /**
     * Update customer list after sync deleted
     * @param customerList
     * @param ids
     * @return {Array}
     */
    updateCustomerListAfterSyncDeleted(customerList = [], ids = []) {
        if (ids && ids.length) {
            ids.map(id => {
                let index = customerList.findIndex(item => item.id === Number(id));
                if (index >= 0) {
                    customerList.splice(index, 1);
                }
                return id;
            });
        }
        return customerList;
    }
}

/** @type CustomerListService */
let customerListService = ServiceFactory.get(CustomerListService);

export default customerListService;