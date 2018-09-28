import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import CustomerPopupService from "./CustomerPopupService";
import AddCustomerPopupConstant from "../../view/constant/customer/AddCustomerPopupConstant";
import CountryHelper from "../../helper/CountryHelper";

export class CustomerAddressFieldService extends CoreService {
    static className = 'CustomerAddressFieldService';

    /**
     * default field customer
     * @returns {Array}
     */
    defaultFieldBoxCustomer(component) {
        component.addFieldToArrFieldBoxCustomer(
            CustomerPopupService.createCustomerFieldInput(
                'firstname',
                'firstname',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "First Name",
                component.checkDefaultField('firstname'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrFieldBoxCustomer(
            CustomerPopupService.createCustomerFieldInput(
                'lastname',
                'lastname',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Last Name",
                component.checkDefaultField('lastname'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrFieldBoxCustomer(
            CustomerPopupService.createCustomerFieldInput(
                'company',
                'company',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Company",
                component.getValue('company'),
                true,
                false,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrFieldBoxCustomer(
            CustomerPopupService.createCustomerFieldInput(
                'telephone',
                'telephone',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Phone",
                component.checkDefaultField('telephone'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        return component.state.arrFieldBoxCustomer;
    }

    /**
     * defualt field address
     * @returns {Array}
     */
    defaultFieldBoxAddress(component) {
        component.addFieldToArrFieldBoxAddress(
            CustomerPopupService.createCustomerFieldInput(
                'street',
                'street',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Street",
                component.getValue('street') ? component.getValue('street')[0] : "",
                false,
                true,
                false,
                255,
                true,
                false)
        );
        component.addFieldToArrFieldBoxAddress(
            CustomerPopupService.createCustomerFieldInput(
                'street_2',
                'street_2',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Street 2",
                (component.getValue('street').length > 1) ? component.getValue('street')[1] : "",
                true,
                false,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrFieldBoxAddress(
            CustomerPopupService.createCustomerFieldInput(
                'city',
                'city',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "City",
                component.getValue('city'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrFieldBoxAddress(
            CustomerPopupService.createCustomerFieldInput(
                'postcode',
                'postcode',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "Zip Code",
                component.getValue('postcode'),
                false,
                true,
                false,
                255,
                false,
                false)
        );
        component.addFieldToArrFieldBoxAddress(
            CustomerPopupService.createCustomerFieldGroup(
                'country',
                'country',
                AddCustomerPopupConstant.TYPE_FIELD_GROUP,
                "Country",
                component.state.default_country,
                CountryHelper.getAllCountries(),
                "id",
                "name",
                false)
        );
        component.addFieldToArrFieldBoxAddress(
            CustomerPopupService.createCustomerFieldState(
                'state',
                component.state.states,
                'state',
                AddCustomerPopupConstant.TYPE_FIELD_STATE,
                "State or Province",
                component.state.default_state ? component.state.default_state.id + "" : "",
                true,
                false,
                false,
                255,
                false,
                "id",
                "name",
                false)
        );
        component.addFieldToArrFieldBoxAddress(
            CustomerPopupService.createCustomerFieldInput(
                'vat_id',
                'vat_id',
                AddCustomerPopupConstant.TYPE_FIELD_INPUT,
                "VAT Number",
                component.getValue('vat_id'),
                true,
                false,
                false,
                255,
                false,
                true)
        );
        return component.state.arrFieldBoxAddress;
    }

    /**
     * default field shipping
     * @returns {Array}
     */
    defaultFieldBoxDefaultShipping(component) {
        component.addFieldToArrFieldBoxDefaultShipping(
            CustomerPopupService.createCustomerFieldCheckBox(
                'default_shipping',
                'default_shipping',
                AddCustomerPopupConstant.TYPE_FIELD_CHECKBOX,
                "Use as default Shipping Address",
                this.checkShippingAddress(component),
                this.checkDisableShippingAddress(component),
                true)
        );
        return component.state.arrFieldBoxDefaultShipping;
    }

    /**
     * default field billing
     * @returns {Array}
     */
    defaultFieldBoxDefaultBilling(component) {
        component.addFieldToArrFieldBoxDefaultBilling(
            CustomerPopupService.createCustomerFieldCheckBox(
                'default_billing',
                'default_billing',
                AddCustomerPopupConstant.TYPE_FIELD_CHECKBOX,
                "Use as default Billing Address",
                this.checkBillingAddress(component),
                this.checkDisableBillingAddress(component),
                true)
        );
        return component.state.arrFieldBoxDefaultBilling;
    }

    /**
     * check shipping address
     * @returns {*}
     */
    checkShippingAddress(component) {
        let {isNewAddress, customer} = component.props;
        if (customer.addresses && customer.addresses.length) {
            if(isNewAddress) {
                let default_shipping = customer.addresses.find(item => item.default_shipping);
                if (default_shipping) {
                    return false;
                } else {
                    return true
                }
            } else {
                return component.getValue('default_shipping');
            }
        } else {
            return true;
        }
    }

    /**
     * check billing address
     * @returns {*}
     */
    checkBillingAddress(component) {
        let {isNewAddress, customer} = component.props;
        if (customer.addresses && customer.addresses.length) {
            if(isNewAddress) {
                let default_billing = customer.addresses.find(item => item.default_billing);
                if (default_billing) {
                    return false;
                } else {
                    return true
                }
            } else {
                return component.getValue('default_billing');
            }
        } else {
            return true;
        }
    }

    /**
     * check disable shipping address
     * @returns {*}
     */
    checkDisableShippingAddress(component) {
        let {address, customer} = component.props;
        if (customer.addresses && customer.addresses.length) {
            if (address) {
                if(address.default_shipping) {
                    return true;
                }
            }
        } else {
            return true;
        }
    }

    /**
     * check disable billing address
     * @returns {*}
     */
    checkDisableBillingAddress(component) {
        let {address, customer} = component.props;
        if (customer.addresses && customer.addresses.length) {
            if (address) {
                if(address.default_billing) {
                    return true;
                }
            }
        } else {
            return true;
        }
    }
}

/** @type CustomerAddressFieldService */
let customerAddressFieldService = ServiceFactory.get(CustomerAddressFieldService);

export default customerAddressFieldService;