import CoreService from "../CoreService";
import CustomerPopupService from "./CustomerPopupService";
import AddCustomerPopupConstant from "../../view/constant/customer/AddCustomerPopupConstant";
import CustomerGroupHelper from "../../helper/CustomerGroupHelper";
import ServiceFactory from "../../framework/factory/ServiceFactory";

export class CustomerDefaultFieldService extends CoreService {
    static className = 'CustomerDefaultFieldService';

    /**
     * default customer field
     * @returns {Array}
     */
    defaultCustomerField(component) {
        component.addFieldToArrField(
            CustomerPopupService.createCustomerFieldInput(
                'firstname',
                'firstname',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "First Name",
                component.getValue('firstname'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrField(
            CustomerPopupService.createCustomerFieldInput(
                'lastname',
                'lastname',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Last Name",
                component.getValue('lastname'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrField(
            CustomerPopupService.createCustomerFieldInput(
                'email',
                'email',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Email",
                component.getValue('email'),
                false,
                true,
                true,
                255,
                false,
                false)
        );
        component.addFieldToArrField(
            CustomerPopupService.createCustomerFieldInput(
                'telephone',
                'telephone',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Phone",
                component.getValue('telephone'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrField(
            CustomerPopupService.createCustomerFieldGroup(
                'group_id',
                'group_id',
                AddCustomerPopupConstant.TYPE_FIELD_GROUP,
                "Customer Group",
                component.getValue('group_id') ?
                    component.getValue('group_id') : CustomerGroupHelper.getDefaultCustomerGroupId(),
                CustomerGroupHelper.getShowCustomerGroup(),
                "id",
                "code",
                true)
        );
        component.addFieldToArrField(
            CustomerPopupService.createCustomerFieldCheckBox(
                'subscriber_status',
                'subscriber_status',
                AddCustomerPopupConstant.TYPE_FIELD_CHECKBOX,
                "Subscribe Newsletter",
                component.props.isNewCustomer ? false : component.getValue('subscriber_status'),
                false,
                true)
        );
        return component.state.arrField;
    }
}

/** @type CustomerDefaultFieldService */
let customerDefaultFieldService = ServiceFactory.get(CustomerDefaultFieldService);

export default customerDefaultFieldService;