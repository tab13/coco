import React, {Fragment} from 'react';
import {Modal} from 'react-bootstrap'
import SmoothScrollbar from "smooth-scrollbar";
import CoreContainer from "../../../../framework/container/CoreContainer";
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import AddCustomerPopupConstant from "../../../constant/customer/AddCustomerPopupConstant";
import CustomerPopupService from "../../../../service/customer/CustomerPopupService";
import CustomerInputComponent from "../field/CustomerInputComponent";
import CustomerGroupComponent from "../field/CustomerGroupComponent";
import CustomerCheckboxComponent from "../field/CustomerCheckBoxComponent";
import CustomerStateComponent from "../field/CustomerStateComponent";
import CountryHelper from "../../../../helper/CountryHelper";
import _ from 'lodash';
import $ from 'jquery';
import cloneDeep from 'lodash/cloneDeep';
import CustomerAction from "../../../action/CustomerAction";
import CustomerAddressFieldService from "../../../../service/customer/CustomerAddressFieldService";
import ShippingConstant from "../../../constant/ShippingConstant";

export class AddressCustomerPopupComponent extends CoreComponent {
    static className = 'AddressCustomerPopupComponent';
    setPopupCustomerAddressElement = element => {
        this.popup_customer_address = element;
        if (!this.scrollbar && this.popup_customer_address) {
            this.scrollbar = SmoothScrollbar.init(this.popup_customer_address);
            setTimeout(() => {
                this.heightPopup('.popup-edit-customer .modal-dialog');
            }, 500);
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            current_address: {},
            arrFieldBoxCustomer: [],
            arrFieldBoxAddress: [],
            default_country: "",
            default_state: CountryHelper.getDefaultState(),
            states: [],
            arrFieldBoxDefaultBilling: [],
            arrFieldBoxDefaultShipping: [],
            customer_fields: [],
            address_fields: [],
            default_shipping_fields: [],
            default_billing_fields: []
        };
    }

    /**
     * componentWillReceiveProps
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let current_address = cloneDeep(nextProps.address);
        let country_id = current_address.country_id;
        let default_country_id = CountryHelper.getDefaultCountry() ? CountryHelper.getDefaultCountry().id : "";
        let default_regions = CountryHelper.getDefaultCountry() ? CountryHelper.getDefaultCountry().regions : [];
        let regions = CountryHelper.getCountry(country_id) ? CountryHelper.getCountry(country_id).regions : null;
        let region_id = current_address.region_id;
        this.setState({
            current_address: current_address,
            arrFieldBoxCustomer: [],
            arrFieldBoxAddress: [],
            default_country: country_id ? country_id : default_country_id,
            default_state: region_id ? CountryHelper.getState(regions, region_id) : CountryHelper.getDefaultState(),
            states: country_id ? regions : default_regions,
            arrFieldBoxDefaultBilling: [],
            arrFieldBoxDefaultShipping: [],
            customer_fields: [],
            address_fields: [],
            default_shipping_fields: [],
            default_billing_fields: []
        }, () => {
            this.setCustomerFields(CustomerPopupService.setRowCustomerField(
                CustomerAddressFieldService.defaultFieldBoxCustomer(this)));
            this.setAddressFields(CustomerPopupService.setRowCustomerField(
                CustomerAddressFieldService.defaultFieldBoxAddress(this)));
            this.setDefaultShippingFields(CustomerPopupService.setRowCustomerField(
                CustomerAddressFieldService.defaultFieldBoxDefaultShipping(this)));
            this.setDefaultBillingFields(CustomerPopupService.setRowCustomerField(
                CustomerAddressFieldService.defaultFieldBoxDefaultBilling(this)));
        });
    }

    /**
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        var height = $( window ).height();
        $(elm).css('height', height + 'px');
    }

    /**
     * set customer field
     * @param customerFields
     */
    setCustomerFields(customerFields) {
        this.setState({customer_fields: customerFields});
    }

    /**
     * set address field
     * @param addressFields
     */
    setAddressFields(addressFields) {
        this.setState({address_fields: addressFields});
    }

    /**
     * set default shipping field
     * @param shippingFields
     */
    setDefaultShippingFields(shippingFields) {
        this.setState({default_shipping_fields: shippingFields});
    }

    /**
     * set default billing field
     * @param billingFields
     */
    setDefaultBillingFields(billingFields) {
        this.setState({default_billing_fields: billingFields});
    }

    /**
     * get value
     * @param code
     * @returns {string}
     */
    getValue(code) {
        let {current_address} = this.state;
        if(!current_address) {
            return "";
        }
        return current_address[code] ? current_address[code] : "";
    }

    /**
     * check default field
     * @param code
     * @returns {*}
     */
    checkDefaultField(code) {
        let {customer, isNewAddress} = this.props;
        if (isNewAddress) {
            return customer[code] ? customer[code] : "";
        } else {
            return this.getValue(code);
        }
    }

    /**
     * add field to arrFieldBoxCustomer
     * @param field
     */
    addFieldToArrFieldBoxCustomer(field) {
        let fields = this.state.arrFieldBoxCustomer;
        fields.push(field);
        this.setState({arrFieldBoxCustomer: fields});
    }

    /**
     * add field to arrFieldBoxAddress
     * @param field
     */
    addFieldToArrFieldBoxAddress(field) {
        let fields = this.state.arrFieldBoxAddress;
        fields.push(field);
        this.setState({arrFieldBoxAddress: fields});
    }

    /**
     * add field to arrFieldBoxDefaultShipping
     * @param field
     */
    addFieldToArrFieldBoxDefaultShipping(field) {
        let fields = this.state.arrFieldBoxDefaultShipping;
        fields.push(field);
        this.setState({arrFieldBoxDefaultShipping: fields});
    }

    /**
     * add field to arrFieldBoxDefaultBilling
     * @param field
     */
    addFieldToArrFieldBoxDefaultBilling(field) {
        let fields = this.state.arrFieldBoxDefaultBilling;
        fields.push(field);
        this.setState({arrFieldBoxDefaultBilling: fields});
    }

    /**
     * select value in group field
     * @param ref
     * @param value
     */
    onSelectGroupField(ref, value) {
        if (ref === 'country') {
            _.flattenDeep(this.state.address_fields)
                .find(item => item.code === 'state')
                .ref
                .setOptions(CountryHelper.getCountry(value).regions);
        }
    }

    /**
     * Set location info
     * @param locationInfo
     */
    setLocationInfo(locationInfo) {
        let allFieldAddress = _.flattenDeep(this.state.address_fields);
        CustomerPopupService.getRefField(allFieldAddress, 'street').ref.setValue(locationInfo.street.street1);
        CustomerPopupService.getRefField(allFieldAddress, 'street').ref.hiddenClearInput();
        CustomerPopupService.getRefField(allFieldAddress, 'street_2').ref.setValue(locationInfo.street.street2);
        CustomerPopupService.getRefField(allFieldAddress, 'street_2').ref.hiddenClearInput();
        CustomerPopupService.getRefField(allFieldAddress, 'city').ref.setValue(locationInfo.city);
        CustomerPopupService.getRefField(allFieldAddress, 'city').ref.hiddenClearInput();
        CustomerPopupService.getRefField(allFieldAddress, 'postcode').ref.setValue(locationInfo.postcode);
        CustomerPopupService.getRefField(allFieldAddress, 'postcode').ref.hiddenClearInput();
        CustomerPopupService.getRefField(allFieldAddress, 'country').ref.setValue(locationInfo.country_id);
        CustomerPopupService.getRefField(allFieldAddress, 'state').ref
            .setOptions(CountryHelper.getCountry(locationInfo.country_id).regions);
        CustomerPopupService.getRefField(allFieldAddress, 'state').ref.setValue(locationInfo.region_id);
        CustomerPopupService.getRefField(allFieldAddress, 'street').ref.hiddenGoogleSuggest();
    }

    /**
     * save address
     */
    saveAddress() {
        let { customer, isNewAddress, isNewCustomer,
            onSaveAddress, editCustomer, showPopup, isShipping } = this.props;
        let allField = [];
        allField.push(_.flattenDeep(this.state.customer_fields));
        allField.push(_.flattenDeep(this.state.address_fields));
        allField.push(_.flattenDeep(this.state.default_billing_fields));
        allField.push(_.flattenDeep(this.state.default_shipping_fields));
        // validate field address
        let checkValidate = false;
        for (let field of _.flattenDeep(allField)) {
            let validate = field.ref.validate();
            if (validate) {
                checkValidate = validate;
            }
        }
        if (checkValidate) return;
        let address = CustomerPopupService.saveAddress(
            customer,
            this.state.current_address,
            _.flattenDeep(allField), isNewAddress);
        if (isNewAddress) {
            if (customer.addresses) {
                customer.addresses.push(address);
            } else {
                let addresses = [];
                addresses.push(address);
                customer.addresses = addresses;
            }
        } else {
            let indexAddress = _.findIndex(customer.addresses, _.pick(address, 'id'));
            if(indexAddress !== -1) {
                customer.addresses.splice(indexAddress, 1, address);
            }
        }
        if (isShipping) {
            customer.id ? editCustomer(customer) : onSaveAddress(customer);
            showPopup(ShippingConstant.POPUP_TYPE_SHIPPING);
        } else {
            isNewCustomer ? onSaveAddress(customer) : editCustomer(customer);
            showPopup(AddCustomerPopupConstant.POPUP_TYPE_CUSTOMER);
        }
    }

    /**
     * cancel popup address
     */
    cancelPopup() {
        if (this.props.isShipping) {
            this.props.showPopup(ShippingConstant.POPUP_TYPE_SHIPPING);
        } else {
            this.props.showPopup(AddCustomerPopupConstant.POPUP_TYPE_CUSTOMER);
        }
    }

    /**
     * get header
     * @returns {XML}
     */
    getHeader() {
        let title = this.props.isNewAddress ? 'Add New Address' : 'Edit Address';
        return (
            <div className="modal-header">
                <button type="button"
                        className="cancel close-shipping-customer"
                        onClick={() => this.cancelPopup()}>
                    {this.props.t('Cancel')}
                </button>
                <h4 className="modal-title">{this.props.t(title)}</h4>
                <button type="button" className="save" onClick={() => this.saveAddress()}>
                    {this.props.t('Save')}
                </button>
            </div>
        )
    }

    /**
     * get body
     * @returns {XML}
     */
    getBody() {
        if (!this.props.isOpenCustomerAddress) {
            if (this.popup_customer_address) {
                SmoothScrollbar.destroy(this.popup_customer_address);
                this.scrollbar = null;
            }
        }
        return (
            <div data-scrollbar ref={this.setPopupCustomerAddressElement} className="modal-body">
                {
                    this.getField(this.state.customer_fields)
                }
                {
                    this.getField(this.state.address_fields)
                }
                {
                    this.getField(this.state.default_shipping_fields)
                }
                {
                    this.getField(this.state.default_billing_fields)
                }
            </div>
        )
    }

    /**
     * get field
     * @param fields
     * @returns {XML}
     */
    getField(fields) {
        let oneRow = false;
        let checkbox = false;
        return (
            <div className="box-group">
                {
                    fields.map(arrField => {
                        ((arrField.length === 1) &&
                            arrField[0].type === AddCustomerPopupConstant.TYPE_FIELD_CHECKBOX) ?
                            checkbox = true : checkbox = false;
                            return (
                                <div
                                    className={checkbox ? "row form-group form-checkbox" : "row form-group"}
                                     key={Math.random()}>
                                    {
                                        arrField.map((field) => {
                                            (arrField.length > 1) ? oneRow = false : oneRow = true;
                                            if (field.type === AddCustomerPopupConstant.TYPE_FIELD_GROUP) {
                                                return (<CustomerGroupComponent
                                                    key={Math.random()}
                                                    Code={field.code}
                                                    ref={(node) => {
                                                        field.ref = node
                                                    }}
                                                    Options={field.options}
                                                    KeyValue={field.key_value}
                                                    KeyTitle={field.key_title}
                                                    OneRow={oneRow}
                                                    DefaultValue={field.default_value}
                                                    Label={this.props.t(field.label)}
                                                    onSelect={this.onSelectGroupField.bind(this)}/>)
                                            }
                                            else if (
                                                field.type === AddCustomerPopupConstant.TYPE_FIELD_CHECKBOX
                                            ) {
                                                return (
                                                    <CustomerCheckboxComponent
                                                        key={Math.random()}
                                                        Code={field.code}
                                                        ref={(node) => {
                                                            field.ref = node
                                                        }}
                                                        Disabled={field.disabled}
                                                        OneRow={oneRow}
                                                        Label={this.props.t(field.label)}
                                                        IsCheck={field.check}/>
                                                )
                                            }
                                            else if (field.type === AddCustomerPopupConstant.TYPE_FIELD_STATE){
                                                return (<CustomerStateComponent
                                                    STATES={field.states}
                                                    key={Math.random()}
                                                    Label={this.props.t(field.label)}
                                                    Code={field.code}
                                                    ref={(node) => {
                                                        field.ref = node
                                                    }}
                                                    refKey={field.ref}
                                                    DefaultValue={field.default_value}
                                                    OneRow={oneRow}
                                                    MaxLength={field.max_length}
                                                    Required={field.required}
                                                    IsOptional={field.optional}
                                                    KeyValue={field.key_value}
                                                    KeyTitle={field.key_title}
                                                    RequiredEmail={field.required_email}
                                                    onSelect={this.onSelectGroupField.bind(this)}/>)
                                            }
                                            else {
                                                return (<CustomerInputComponent
                                                    key={Math.random()}
                                                    Code={field.code}
                                                    Label={this.props.t(field.label)}
                                                    ref={(node) => {
                                                        field.ref = node
                                                    }}
                                                    DefaultValue={field.default_value}
                                                    OneRow={oneRow}
                                                    MaxLength={field.max_length}
                                                    Required={field.required}
                                                    IsOptional={field.optional}
                                                    RequiredEmail={field.required_email}
                                                    GoogleSuggest={field.google_suggest}
                                                    setLocationInfo={this.setLocationInfo.bind(this)}

                                                />)
                                            }
                                        })
                                    }
                                </div>
                            )
                        }
                    )
                }
            </div>
        )
    }

    template() {
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer"}
                    dialogClassName={"popup-addBillingAddress in"}
                    show={this.props.isOpenCustomerAddress}
                >
                    {
                        this.getHeader()
                    }
                    {

                        this.getBody()
                    }
                </Modal>
            </Fragment>
        )
    }
}

/**
 *
 * @type {AddressCustomerPopupComponent}
 */
const component = ComponentFactory.get(AddressCustomerPopupComponent);

export class AddressCustomerPopupContainer extends CoreContainer {
    static className = 'AddressCustomerPopupContainer';

    /**
     * Map actions
     * @param dispatch
     * @returns editCustomer: (function(*=): *)}}
     */
    static mapDispatch(dispatch) {
        return {
            editCustomer: (customer) => dispatch(CustomerAction.editCustomer(customer))
        }
    }
}

/**
 *
 * @type {AddressCustomerPopupContainer}
 */
const container = ContainerFactory.get(AddressCustomerPopupContainer);

export default container.withRouter(component)