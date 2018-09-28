import {AbstractOrderService} from "../../AbstractService";
import cloneDeep from 'lodash/cloneDeep';
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import OrderResourceModel from "../../../../resource-model/order/OrderResourceModel";
import SyncConstant from "../../../../view/constant/SyncConstant";
import ActionLogService from "../../../sync/ActionLogService";
import CustomerResourceModel from "../../../../resource-model/customer/CustomerResourceModel";
import CustomerService from "../../../customer/CustomerService";
import CustomerGroupHelper from "../../../../helper/CustomerGroupHelper";

export class CreditmemoSuccessService extends AbstractOrderService {
    static className = 'CreditmemoSuccessService';

    /**
     * send email credit memo
     * @param increment_id
     * @param email
     * @param creditmemo_increment_id
     * @returns {Promise.<boolean>}
     */
    async sendEmailCreditmemo(increment_id, email, creditmemo_increment_id) {
        let orderResource = this.getResourceModel(OrderResourceModel);
        let url_api = orderResource.getResourceOnline().getPathSendEmailCreditmemo();
        let params = {
            creditmemo_increment_id: creditmemo_increment_id,
            email: email,
            increment_id: increment_id
        };
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_SEND_EMAIL_CREDITMEMO_ORDER, url_api, SyncConstant.METHOD_POST, params
        );
        return true;
    }

    /**
     * credit memo create customer
     * @param order
     * @param email
     * @param isNewAccount
     * @returns {Promise.<void>}
     */
    async creditmemoCreateCustomer(order, email, isNewAccount) {
        let orderResource = new OrderResourceModel();
        let url_api = orderResource.getResourceOnline().getPathCreditmemoCreateCustomer();
        let id, first_name, last_name, full_name, search_string, subscriber_status, telephone, group_id, addresses;
        let customer_default_group = CustomerGroupHelper.getDefaultCustomerGroupId();
        if (isNewAccount) {
            let prefix_before_email = email.split('@')[0];
            id = new Date().getTime();
            first_name = prefix_before_email;
            last_name = prefix_before_email;
            full_name = first_name + ' ' + last_name;
            search_string = email + full_name;
            subscriber_status = customer_default_group;
            telephone = "";
            group_id = "1";
            addresses = [];
        } else {
            let customer_by_email = await CustomerService.get(email, 'email');
            id = customer_by_email.id;
            first_name = customer_by_email.firstname;
            last_name = customer_by_email.lastname;
            full_name = customer_by_email.full_name;
            search_string = customer_by_email.search_string;
            subscriber_status = customer_by_email.subscriber_status;
            telephone = customer_by_email.telephone;
            group_id = customer_by_email.group_id;
            addresses = customer_by_email.addresses;
        }
        let param_customer = {
            id: id,
            addresses: addresses,
            firstname: first_name,
            lastname: last_name,
            email: email,
            group_id: group_id,
            telephone: telephone,
            subscriber_status: subscriber_status,
            full_name: full_name,
            search_string: search_string,
        };
        if (isNewAccount) {
            let customerResource = this.getResourceModel(CustomerResourceModel);
            await customerResource.createCustomer(param_customer);
            customerResource.reindexTable();
        }
        let customer = this.convertParamsCustomer(param_customer);
        let newOrder = await this.mergeCustomerToOrder(param_customer, order.increment_id, orderResource);
        await orderResource.saveToDb([newOrder]);
        orderResource.reindexTable();
        let increment_id = order.increment_id;
        let params = {
            customer,
            increment_id,
            isNewAccount: isNewAccount
        };
        await ActionLogService.createDataActionLog(
            SyncConstant.REQUEST_CREDITMEMO_CREATE_CUSTOMER, url_api, SyncConstant.METHOD_POST, params
        );
        return newOrder;
    }

    /**
     * merge customer to order
     * @param customer
     * @param increment_id
     * @returns {*}
     */
    async mergeCustomerToOrder(customer, increment_id, orderResource) {
        let order = await orderResource.getOrderByIncrementIdOffline(increment_id);
        order.customer_id = customer.id;
        order.customer_firstname = customer.firstname;
        order.customer_lastname = customer.lastname;
        order.customer_email = customer.email;
        order.customer_is_guest = 0;
        order.customer_group_id = customer.group_id;
        return order;
    }

    /**
     * convert params customer
     * @param customer
     * @return {*}
     */
    convertParamsCustomer(customer) {
        let new_customer = cloneDeep(customer);
        delete new_customer.full_name;
        delete new_customer.search_string;
        return new_customer;
    }
}

/** @type CreditmemoSuccessService */
let creditmemoSuccessService = ServiceFactory.get(CreditmemoSuccessService);
export default creditmemoSuccessService;