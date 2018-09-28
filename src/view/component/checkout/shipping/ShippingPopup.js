import React, {Fragment} from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import '../../../style/css/Shipping.css';
import CustomerPopupService from "../../../../service/customer/CustomerPopupService";
import {Modal} from "react-bootstrap";
import SmoothScrollbar from 'smooth-scrollbar';
import $ from 'jquery';
import cloneDeep from 'lodash/cloneDeep';
import ShippingAction from "../../../action/ShippingAction";
import ShippingItemComponent from "./ShippingItem";
import AddressCustomerPopup from "../../customer/address/AddressCustomerPopup";
import ShippingConstant from "../../../constant/ShippingConstant";
import CheckoutHelper from '../../../../helper/CheckoutHelper';
import {DateTime} from 'react-datetime-bootstrap';
import QuoteAddressService from "../../../../service/checkout/quote/AddressService";
import QuoteAction from "../../../action/checkout/QuoteAction";
import {toast} from "react-toastify";

export class ShippingPopupComponent extends CoreComponent {
    static className = 'ShippingPopupComponent';
    setPopupShippingElement = element => {
        this.popup_shipping = element;
        if (!this.scrollbar && this.popup_shipping) {
            this.scrollbar = SmoothScrollbar.init(this.popup_shipping);
            this.heightPopup('.popup-shippingadd .modal-dialog');
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = this.defaultStateData();
    }

    /**
     * componentWillMount get list shipping method
     */
    componentWillMount() {
        let quote = this.props.quote;
        let customer = quote.customer || {};
        let currentCustomer = cloneDeep(customer);
        this.setState({current_customer: currentCustomer});
        this.selectDefaultAddress(quote, currentCustomer);
    }

    /**
     * This function after mapStateToProps then set list shipping to state
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        let shippingMethods = nextProps.shipping_methods;
        this.setState({shipping_methods: shippingMethods});
        this.setDataWhenPopupIsClosed(nextProps);
        this.setDataAfterOpenPopup(nextProps);
        this.setDataWhenCustomerDataIsChanged(nextProps);
        this.alwaysRunWhenReceiveProps(nextProps);
    }

    /**
     * Default state data
     *
     * @return {{current_customer: {}, current_address: {}, shipping_methods: Array, address_selected: {}, current_shipping_method: {}, current_shipping_method_code: string}}
     */
    defaultStateData() {
        return {
            current_customer: {},
            addresses: [],
            current_address: {},
            shipping_methods: [],
            address_selected: {},
            current_shipping_method: {},
            current_shipping_method_code: '',
            delivery_date: '',
            fulfill_online: false
        }
    }

    /**
     * Set data for component when popup is closing and quote data is changed.
     *
     * @param props
     */

    setDataWhenPopupIsClosed(props) {
        if (!this.props.isOpenShippingPopup && !props.isOpenShippingPopup) {
            let quote = props.quote;
            let customer = quote.customer;
            let quoteCustomer = cloneDeep(customer);
            let currentCustomer = this.state.current_customer;
            if ((!customer && !currentCustomer.id) || (customer && customer.id === currentCustomer.id)) {
                if ((!customer || !customer.id) && !currentCustomer.id && quote.id !== this.props.quote.id) {
                    this.setState({current_customer: {}, addresses: []});
                }
            } else if (customer && customer.id && customer.id !== currentCustomer.id) {
                this.setState({current_customer: quoteCustomer, delivery_date: '', fulfill_online: false});
                this.selectDefaultAddress(quote, quoteCustomer);
                this.selectShippingMethod({});
            } else {
                this.setState({current_customer: {}, delivery_date: '', fulfill_online: false});
                this.selectDefaultAddress(quote);
                this.selectShippingMethod({});
            }
        }
    }

    /**
     * Set data when open popup
     *
     * @param props
     */
    setDataAfterOpenPopup(props) {
        let quote = props.quote;
        let customer = quote.customer;
        let quoteCustomer = quote.customer ? cloneDeep(customer) : {};
        let currentCustomer = this.state.current_customer;
        if (!this.props.isOpenShippingPopup && props.isOpenShippingPopup) {
            if ((!customer && !currentCustomer.id) || (customer && customer.id === currentCustomer.id)) {
                let isCreatedAddressForGuest = false;
                if (!customer && !currentCustomer.id) {
                    isCreatedAddressForGuest = this.createDefaultShippingAddressesForGuest(quote, quoteCustomer);
                    if (isCreatedAddressForGuest) {
                        this.setState({current_customer: quoteCustomer});
                        this.selectDefaultAddress(quote, quoteCustomer);
                    }
                }
                if (!isCreatedAddressForGuest) {
                    let addresses = null;
                    if (quoteCustomer.id && currentCustomer.id && quoteCustomer.id === currentCustomer.id) {
                        if (JSON.stringify(quoteCustomer.addresses) !== JSON.stringify(currentCustomer.addresses)) {
                            this.setState({current_customer: quoteCustomer});
                            addresses = this.setAddresses(quoteCustomer);
                        }
                    }
                    if (!addresses) {
                        addresses = this.setAddresses(currentCustomer);
                    }
                    let shippingAddress = QuoteAddressService.getShippingAddress(quote);
                    let addressSelected = addresses.find(address =>
                        address.id === shippingAddress.address_id || address.id === shippingAddress.customer_address_id
                    );
                    if (!addressSelected) {
                        addressSelected = addresses.find(address => address.id === this.state.address_selected.id);
                    }
                    if (!addressSelected) {
                        addressSelected = addresses.find(address => address.default_shipping);
                    }
                    if (!addressSelected || (this.state.addresses.length !== addresses.length)) {
                        addressSelected = addresses[0];
                    }
                    if (addressSelected) {
                        this.selectAddress(quote, addressSelected);
                    } else {
                        this.setState({shipping_methods: []});
                    }
                }
            } else if (customer && customer.id && customer.id !== currentCustomer.id) {
                this.setState({current_customer: quoteCustomer});
                this.selectDefaultAddress(quote, quoteCustomer);
            } else {
                this.setState({current_customer: {}});
                this.selectDefaultAddress(quote);
            }
            this.setState({delivery_date: this.props.quote.pos_delivery_date});
            this.setState({fulfill_online: !!this.props.quote.pos_fulfill_online});
        }
    }

    /**
     *
     *
     * @param props
     */
    setDataWhenCustomerDataIsChanged(props) {
        let quote = props.quote;
        let customer = quote.customer;
        if (customer && customer.id && customer.addresses && customer.addresses.length &&
            this.props.isOpenShippingPopup && props.isOpenShippingPopup) {
            let quoteCustomer = cloneDeep(customer);
            let quoteCustomerAddress = quoteCustomer.addresses.sort((a, b) => (a.id > b.id) ? -1 : 1);
            let quoteCustomerAddressIds = quoteCustomerAddress.map(address => address.id);
            let currentCustomerAddressIds = this.state.addresses.map(address => address.id);
            if (quoteCustomerAddressIds.length !== currentCustomerAddressIds.length) {
                this.setState({current_customer: quoteCustomer});
                this.setState({addresses: quoteCustomerAddress});
                this.selectAddress(quote, quoteCustomerAddress[0]);
            } else if (quoteCustomerAddressIds.join(',') !== currentCustomerAddressIds.join(',')) {
                this.setState({current_customer: quoteCustomer});
                this.setState({addresses: quoteCustomerAddress});
                let selectedAddress = quoteCustomerAddress.find(address =>
                    address.id === this.state.address_selected.id
                );
                if (!selectedAddress) {
                    selectedAddress = quoteCustomerAddress[0];
                }
                this.selectAddress(quote, selectedAddress);
            }
        }
    }

    /**
     * This function always run when component will receive props
     *
     * @param props
     */
    alwaysRunWhenReceiveProps(props) {
        let quote = props.quote;
        if (props.shipping_methods && quote.shipping_method) {
            if (!this.state.current_shipping_method_code) {
                let method = props.shipping_methods.find(method => method.code === quote.shipping_method);
                if (method && method.code) {
                    this.selectShippingMethod(method);
                }
            } else {
                let method = props.shipping_methods.find(method => method.code === quote.shipping_method);
                if (!method) {
                    this.selectShippingMethod({});
                }
            }
        } else if ((!props.shipping_methods || !props.shipping_methods.length) &&
            this.state.current_shipping_method_code) {
            this.selectShippingMethod({});
        }
    }

    /**
     * Create default shipping addresses for quote after reload page
     *
     * @param quote
     * @param currentCustomer
     * @return {boolean}
     */
    createDefaultShippingAddressesForGuest(quote, currentCustomer) {
        if ((!currentCustomer || !currentCustomer.id) &&
            quote.addresses && quote.addresses.length && !this.state.addresses.length) {
            let quoteShippingAddress = QuoteAddressService.getShippingAddress(quote);
            if (quoteShippingAddress && quoteShippingAddress.address_id) {
                currentCustomer.addresses = [
                    {
                        id: quoteShippingAddress.address_id,
                        firstname: quoteShippingAddress.firstname,
                        lastname: quoteShippingAddress.lastname,
                        middlename: quoteShippingAddress.middlename,
                        prefix: quoteShippingAddress.prefix,
                        suffix: quoteShippingAddress.suffix,
                        telephone: quoteShippingAddress.telephone,
                        fax: quoteShippingAddress.fax,
                        company: quoteShippingAddress.company,
                        street: quoteShippingAddress.street,
                        city: quoteShippingAddress.city,
                        postcode: quoteShippingAddress.postcode,
                        country_id: quoteShippingAddress.country_id,
                        region: {
                            region_code: "",
                            region: quoteShippingAddress.region,
                            region_id: quoteShippingAddress.region_id
                        },
                        region_id: quoteShippingAddress.region_id,
                        default_shipping: true,
                        default_billing: true,
                    }
                ];
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param quote
     * @param customer
     */
    selectDefaultAddress(quote, customer = null) {
        let addresses = this.setAddresses(customer);
        if (customer && customer.addresses && customer.addresses.length) {
            let shippingAddress = QuoteAddressService.getShippingAddress(quote);
            let addressSelected = null,
                defaultShippingAddress = null,
                lastAddress = null;
            addresses.forEach((address, index) => {
                if (index === 0) {
                    lastAddress = address;
                }
                if (shippingAddress && address.id === shippingAddress.customer_address_id) {
                    addressSelected = address;
                }
                if (address.default_shipping) {
                    defaultShippingAddress = address;
                }
            });

            if (!defaultShippingAddress && !addressSelected) {
                addressSelected = lastAddress;
            } else if (!addressSelected && defaultShippingAddress) {
                addressSelected = defaultShippingAddress;
            }
            if (addressSelected) {
                this.selectAddress(quote, addressSelected);
            } else {
                this.setState({shipping_methods: []});
            }
        }
    }

    /**
     * set addresses
     * @param customer
     * @return {any}
     */
    setAddresses(customer) {
        let addresses = cloneDeep(customer && customer.addresses ? customer.addresses : []);
        addresses.sort((a, b) => (a.id > b.id) ? -1 : 1);
        this.setState({addresses: addresses});
        return addresses;
    }

    /**
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        var height = $(window).height();
        $(elm).css('height', height + 'px');
    }

    /**
     * add customer address
     */
    showPopUpAddress() {
        let address = {
            id: new Date().getTime(),
            sub_id: new Date().getTime()
        };
        this.setState({current_address: address}, () => {
            this.props.showPopup(ShippingConstant.POPUP_TYPE_SHIPPING_ADDRESS);
        });
    }

    /**
     * save address
     * @param customer
     */
    saveAddress(customer) {
        this.setState({current_customer: customer});
        let addresses = this.setAddresses(customer);
        if (addresses && addresses.length) {
            let addressSelected = addresses[0];
            if (addressSelected) {
                this.selectAddress(this.props.quote, addressSelected);
            }
        }
    }

    /**
     * show delivery date
     */
    showDeliveryDate() {
        $('#datepicker-shipping input').data("DateTimePicker").ignoreReadonly(true);
        $('#datepicker-shipping input').data("DateTimePicker").sideBySide(true);
        $('#datepicker-shipping input').data("DateTimePicker").minDate(new Date());
        if (this.state.delivery_date) {
            $('#datepicker-shipping input').data("DateTimePicker").useCurrent(false);
            // $('#datepicker-shipping input').data("DateTimePicker").defaultDate(new Date(this.state.delivery_date));
        }
        /*$('#datepicker-shipping input').data("DateTimePicker").useCurrent(false);
        $('#datepicker-shipping input').data("DateTimePicker").toolbarPlacement('top');
        $('#datepicker-shipping input').data("DateTimePicker").showTodayButton(true);
        $('#datepicker-shipping input').data("DateTimePicker").showClear(true);*/
        $('#datepicker-shipping input').data("DateTimePicker").allowInputToggle(true);
        $('#datepicker-shipping input').data("DateTimePicker").toggle();
        $('#datepicker-shipping input').keydown(function (event) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    /**
     * onchange date
     * @param date
     */
    onChangeDate = date => {
        $('#form-date-shipping').addClass('active');
        this.setState({delivery_date: date});
    };

    /**
     * onchange fulfill online
     * @param input
     */
    onChangeFulFillOnline = event => {
        this.setState({fulfill_online: event.target.checked});
    };

    /**
     * select address
     * @param quote
     * @param address
     */
    selectAddress(quote, address) {
        this.setState({address_selected: address});
        this.props.actions.getShippingMethods(quote, address);
    }

    /**
     * select shipping method
     * @param shipping_method
     */
    selectShippingMethod(shipping_method) {
        this.setState({
            current_shipping_method: shipping_method,
            current_shipping_method_code: shipping_method.code
        });
    }

    /**
     * save shipping method
     */
    saveShipping() {
        let {quote} = this.props;
        if (this.state.address_selected.id && this.state.current_shipping_method.code) {
            this.props.actions.saveShipping(
                quote,
                this.state.address_selected,
                this.state.current_shipping_method,
                this.state.delivery_date,
                this.state.fulfill_online
            );
            this.props.showPopup();
        } else {
            toast.error(
                this.props.t('Please select address and shipping method'),
                {
                    className: 'wrapper-messages messages-warning',
                    autoClose: 2000
                }
            );
        }
    }

    /**
     * remove shipping
     */
    removeShipping() {
        let quote = this.props.quote;
        this.props.actions.saveShipping(quote);
        this.setState({
            current_address: {},
            shipping_methods: [],
            address_selected: {},
            current_shipping_method: {},
            current_shipping_method_code: '',
            delivery_date: '',
            fulfill_online: false
        });
        this.props.showPopup();
    }

    /**
     * cancel popup
     */
    cancelPopup() {
        let quote = this.props.quote;
        let shippingAddress = QuoteAddressService.getShippingAddress(quote);
        if (shippingAddress && shippingAddress.address_id) {
            let address = this.state.addresses.find(address => address.id === shippingAddress.id);
            if (address && address.id) {
                this.setState({address_selected: address});
            } else {
                this.setState({address_selected: {}});
            }
        } else {
            this.setState({address_selected: {}});
        }
        this.props.actions.clearShippingMethods();
        this.selectShippingMethod({});
        this.props.showPopup();
    }

    /**
     * show list address
     * @param addresses
     * @returns {*}
     */
    getListAddress(addresses) {
        if (!addresses || !addresses.length) return null;
        let {address_selected} = this.state;
        return (
            <Fragment>
                {
                    addresses.map(address => {
                        return (
                            <div key={Math.random()}
                                 className="col-sm-6"
                                 onClick={() => this.selectAddress(this.props.quote, address)}>
                                <div
                                    className={address_selected.id === address.id ?
                                        "box-address active" : "box-address"}>
                                    <strong className="title">{address.firstname + " " + address.lastname}</strong>
                                    <p>{CustomerPopupService.getInfoAddress(address)}</p>
                                    <p>{CustomerPopupService.getInfoCountry(address)}</p>
                                    <p>{address.telephone}</p>
                                </div>
                            </div>
                        )
                    })
                }
            </Fragment>
        )
    }

    template() {
        let {isOpenShippingPopup, isOpenShippingAddress} = this.props;
        let isShowDeliveryDate = CheckoutHelper.isShowDeliveryDate();
        let isEnableFulFillOnline = CheckoutHelper.isEnableBuyAtStoreFulFillOnline();
        let deliveryDate = this.state.delivery_date;
        let fulfilOnline = this.state.fulfill_online;
        if (!isOpenShippingPopup) {
            if (this.popup_shipping) {
                SmoothScrollbar.destroy(this.popup_shipping);
                this.scrollbar = null;
            }
        }
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-shippingadd"}
                    dialogClassName={"popup-create-customer in"}
                    show={isOpenShippingPopup}
                >
                    <div className="modal-header">
                        <button type="button"
                                className="cancel"
                                data-dismiss="modal"
                                aria-label="Close"
                                onClick={() => {
                                    this.cancelPopup()
                                }}>{this.props.t('Cancel')}</button>
                        <h4 className="modal-title">{this.props.t('Shipping')}</h4>
                        <button type="button"
                                className="save"
                                onClick={() => this.saveShipping()}>{this.props.t('Save')}</button>
                    </div>
                    <div data-scrollbar ref={this.setPopupShippingElement} className="modal-body">
                        <div className="shipping-address">
                            <div className="block-title" onClick={() => this.showPopUpAddress()}>
                                {this.props.t('Shipping Address')}
                            </div>
                            <div className="address-content">
                                <div className="row">
                                    {
                                        this.state.addresses ?
                                            this.getListAddress(this.state.addresses) : null
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="shipping-method">
                            <div className="block-title">{this.props.t('Shipping Method')}</div>
                            <ul className="list">
                                {
                                    this.state.shipping_methods.length ?
                                        this.state.shipping_methods.map(shipping => {
                                            return (
                                                <ShippingItemComponent key={shipping.code}
                                                                       selectShippingMethod={
                                                                           () => this.selectShippingMethod(shipping)
                                                                       }
                                                                       current_shipping_method_code={
                                                                           this.state.current_shipping_method_code
                                                                       }
                                                                       shipping={shipping}/>)
                                        }) :
                                        <li>
                                            <label>
                                                {this.props.t('Sorry, there is no available shipping method.')}
                                            </label>
                                        </li>
                                }
                            </ul>
                        </div>
                        <div className={isShowDeliveryDate ? "shipping-date" : "hidden"}>
                            <div className="block-title">{this.props.t('Delivery Date')}</div>
                            <div id={'form-date-shipping'}
                                 className={"select-date " + (deliveryDate ? "active" : "")}>
                                <div onClick={() => this.showDeliveryDate()} className="select-delivery-label">
                                    {this.props.t('Select Delivery Date')}
                                </div>
                                <DateTime
                                    id={'datepicker-shipping'}
                                    className={"value"}
                                    pickerOptions={{
                                        format: "L LT",
                                        widgetPositioning: {horizontal: 'auto', vertical: 'top'}
                                    }}
                                    value={deliveryDate}
                                    onChange={this.onChangeDate}
                                    readOnly={true}/>
                            </div>
                        </div>
                        <div className={isEnableFulFillOnline ? "shipping-method" : "hidden"}>
                            <div className="block-title">{this.props.t('Fulfillment Method')}</div>
                            <div className="block-content">
                                <label className="pull-left">{this.props.t('Fulfill Online')}</label>
                                <div className="checkbox pull-right">
                                    <label>
                                        <input type="checkbox"
                                               defaultChecked={fulfilOnline}
                                               onChange={this.onChangeFulFillOnline}/>
                                        <span><span>no</span></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        this.props.quote.shipping_method ?
                            <div className="actions-remove-shipping">
                                <button className="btn btn-default" onClick={() => this.removeShipping()}>
                                    {this.props.t('Remove Shipping')}
                                </button>
                            </div> : ""
                    }

                </Modal>
                <AddressCustomerPopup isOpenCustomerAddress={isOpenShippingAddress}
                                      address={this.state.current_address}
                                      customer={this.state.current_customer}
                                      isShipping={true}
                                      onSaveAddress={(customer) => this.saveAddress(customer)}
                                      showPopup={(type) => this.props.showPopup(type)}
                                      isNewCustomer={false}
                                      isNewAddress={true}/>
            </Fragment>
        )
    }
}

export class ShippingPopupContainer extends CoreContainer {
    static className = 'ShippingPopupContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        let {shipping_methods} = state.core.checkout.shipping;
        return {quote: quote, shipping_methods: shipping_methods}
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                getShippingMethods: (quote, address) => dispatch(ShippingAction.getShippingMethods(quote, address)),
                clearShippingMethods: () => dispatch(ShippingAction.getListShippingResult([])),
                saveShipping: (quote, address, shippingMethod, deliveryDate, fulfillOnline) => dispatch(
                    ShippingAction.saveShipping(quote, address, shippingMethod, deliveryDate, fulfillOnline)
                ),
                setQuote: (quote) => dispatch(QuoteAction.setQuote(quote))
            }
        }
    }
}

/**
 *
 * @type {ShippingPopupContainer}
 */
const container = ContainerFactory.get(ShippingPopupContainer);
export default container.getConnect(ComponentFactory.get(ShippingPopupComponent));