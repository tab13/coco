import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import CustomerResourceModel from "../../resource-model/customer/CustomerResourceModel";
import ActionLogService from "../../service/sync/ActionLogService";
import SyncConstant from "../../view/constant/SyncConstant";
import DateTimeHelper from "../../helper/DateTimeHelper";
import cloneDeep from 'lodash/cloneDeep';
import LocationHelper from "../../helper/LocationHelper";
import GuestCustomerHelper from "../../helper/GuestCustomerHelper";
import ConfigHelper from "../../helper/ConfigHelper";
import {RewardPointHelper} from "../../helper/RewardPointHelper";

export class CustomerService extends CoreService {
    static className = 'CustomerService';
    resourceModel = CustomerResourceModel;

    /**
     * check email
     * @param email
     * @returns {*|{type: string, email: *}|Dexie.Promise.<any|T>|Dexie.Promise.<any>|Promise.<any>}
     */
    checkEmail(email) {
        let customerResource = this.getResourceModel(CustomerResourceModel);
        return customerResource.checkEmail(email);
    }

    /**
     * create customer
     * @param customer
     * @returns {Promise.<*>}
     */
    async createCustomer(pCustomer) {
        pCustomer.full_name = pCustomer.firstname + ' ' + pCustomer.lastname;
        pCustomer.search_string = pCustomer.email + pCustomer.full_name;
        let customerResource = this.getResourceModel(CustomerResourceModel);
        let newCustomer = await customerResource.createCustomer(pCustomer);
        this.reindexTable();
        let customer = this.convertParamsCustomer(pCustomer);
        let params = {
            customer
        };
        let url_api = customerResource.getResourceOnline().getPathSaveCustomer();
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_CREATE_CUSTOMER, url_api, SyncConstant.METHOD_POST, params
        );
        return newCustomer;
    }

    /**
     * convert params customer
     * @param customer
     * @returns {*}
     */
    convertParamsCustomer(customer) {
        let new_customer = cloneDeep(customer);
        delete new_customer.full_name;
        delete new_customer.search_string;
        if (new_customer.point_balance) {
            delete new_customer.point_balance
        }
        if (new_customer.credit_balance) {
            delete new_customer.credit_balance
        }
        if (new_customer.addresses) {
            for (let address of new_customer.addresses) {
                delete address.id;
                delete address.sub_id;
                delete address.is_new_address;
            }
        }
        return new_customer;
    }

    /**
     * edit customer
     * @param pCustomer
     * @returns {Promise.<*>}
     */
    async editCustomer(pCustomer) {
        let customerResource = this.getResourceModel(CustomerResourceModel);
        let newCustomer = await customerResource.editCustomer(pCustomer);
        let customer = this.convertParamsEditCustomer(pCustomer);
        let params = {
            customer
        };
        let url_api = customerResource.getResourceOnline().getPathSaveCustomer() + "/" + customer.id;
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_EDIT_CUSTOMER, url_api, SyncConstant.METHOD_PUT, params
        );
        return newCustomer;
    }

    /**
     * convert params edit customer
     * @param customer
     * @returns {*}
     */
    convertParamsEditCustomer(customer) {
        let new_customer = cloneDeep(customer);
        let currentTimestamp = new Date().getTime();
        let databaseCurrentTime = DateTimeHelper.getDatabaseDateTime(currentTimestamp);
        new_customer.full_name = new_customer.firstname + " " + new_customer.lastname;
        new_customer.updated_at = databaseCurrentTime;
        if (new_customer.point_balance) {
            delete new_customer.point_balance
        }
        if (new_customer.credit_balance) {
            delete new_customer.credit_balance
        }
        delete new_customer.search_string;
        if (new_customer.addresses) {
            for (let address of new_customer.addresses) {
                if (address.is_new_address) {
                    delete address.id;
                }
                delete address.is_new_address;
                delete address.sub_id;
            }
        }
        return new_customer;
    }

    /**
     * get path customer
     * @returns {*}
     */
    getPathSaveCustomer() {
        return this.getResourceModel().getResourceOnline().getPathSaveCustomer();
    }

    /**
     * get customer by id
     * @param id
     * @param field
     */
    get(id, field = null) {
        return this.getResourceModel().get(id, field);
    }

    /**
     * Get default address by customer
     *
     * @param customer
     * @return {{firstname: *|string, lastname: *|string, country_id: *|string, region_id: *|number, region: *|string,
     *     postcode: *|string, street: *|string, telephone: *|string}}
     */
    getDefaultAddressByCustomer(customer) {
        return {
            firstname: customer && customer.id ? customer.firstname : GuestCustomerHelper.getFirstname(),
            lastname: customer && customer.id ? customer.lastname : GuestCustomerHelper.getLastname(),
            country_id: LocationHelper.getCountryId(),
            region_id: LocationHelper.getRegionId(),
            region: LocationHelper.getRegion(),
            postcode: LocationHelper.getPostcode(),
            street: LocationHelper.getStreet(),
            telephone: LocationHelper.getTelephone()
        };
    }

    /**
     * Get default billing address of customer
     *
     * @param customer
     * @return {*}
     */
    getDefaultBillingAddress(customer) {
        let address = null;
        if (customer && customer.addresses && customer.addresses.length) {
            address = customer.addresses.find(address => address.default_billing);
        }
        if (!address) {
            address = this.getDefaultAddressByCustomer(customer);
        }
        return address;
    }

    /**
     * Get default shipping address of customer
     *
     * @param customer
     * @return {*}
     */
    getDefaultShippingAddress(customer) {
        let address = null;
        if (customer && customer.addresses && customer.addresses.length) {
            address = customer.addresses.find(address => address.default_shipping);
        }
        if (!address) {
            address = this.getDefaultAddressByCustomer(customer);
        }
        return address;
    }

    /**
     * check need update data
     * @return {*|boolean|number}
     */
    needUpdateData() {
        return (
            ConfigHelper.isEnableStoreCredit()
            || RewardPointHelper.isEnabledRewardPoint()
        );
    }

	/**
     * change reward point
     * @param id
     * @param point
     * @return {Promise<*>}
     */
    async rewardCustomerWithPoint(id, point) {
        let customer = await this.getById(id);

        if (!customer) {
            return false;
        }

        let newPointBalance = (customer.point_balance || 0) + point;
        if (
            RewardPointHelper.getEarningMaxBalance()
            && newPointBalance > RewardPointHelper.getEarningMaxBalance()
        ) {
            return customer
        }

        customer.point_balance = (customer.point_balance || 0) + point;
        return await this.updateCustomerByLoyalty(customer);
    }

    /**
     * update customer credit
     * @param id
     * @param credit
     * @returns {Promise.<*>}
     */
    async updateCustomerCredit(id, credit) {
        let customer = await this.getById(id);

        if (!customer || !customer.credit_balance) {
            return false;
        }

        customer.credit_balance = customer.credit_balance - credit;
        return await this.updateCustomerByLoyalty(customer);
    }

    /**
     * update customer by loyalty
     * @param customer
     * @returns {Promise.<*>}
     */
    async updateCustomerByLoyalty(customer) {
        let customerResource = this.getResourceModel(CustomerResourceModel);
        await customerResource.saveToDb([customer]);
        return await customerResource.reindexTable();
    }
}

/** @type CustomerService */
let customerService = ServiceFactory.get(CustomerService);

export default customerService;
