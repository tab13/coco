import React, {Fragment} from "react";
import {Modal} from "react-bootstrap";
import '../../style/css/Customer.css';
import CoreContainer from "../../../framework/container/CoreContainer";
import CoreComponent from "../../../framework/component/CoreComponent";
import ComponentFactory from "../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../framework/factory/ContainerFactory";
import CustomerPopup from "./CustomerPopup";
import CustomerList from "./CustomerList";
import AddCustomerPopupConstant from "../../constant/customer/AddCustomerPopupConstant";
import QuoteAction from "../../action/checkout/QuoteAction";
import ProductList from "../catalog/ProductList";
import {RewardPointHelper} from "../../../helper/RewardPointHelper";
import CustomerConstant from "../../constant/CustomerConstant";
import cloneDeep from 'lodash/cloneDeep';

export class CustomerButtonComponent extends CoreComponent {
    static className = 'CustomerButtonComponent';

    /**
     * Constructor
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isOpenCustomerPopup: false,
            currentCustomer: {},
            popupCustomer: {},
        }
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    showPopup(type) {
        this.setState({
            isOpenList: type === AddCustomerPopupConstant.POPUP_TYPE_CUSTOMER_LIST,
            isOpenCustomerPopup: type === AddCustomerPopupConstant.POPUP_TYPE_CUSTOMER,
            isOpenCustomerAddress: type === AddCustomerPopupConstant.POPUP_TYPE_ADDRESS
        });
    }

    /**
     * Show customer popup
     */
    showCustomerPopup() {
        let popupCustomer = (this.props.quote.customer && this.props.quote.customer.id) ?
            this.props.quote.customer : {};
        if (this.isNewCustomer()) {
            popupCustomer = cloneDeep(CustomerConstant.NEW_CUSTOMER_DATA);
            popupCustomer.id = new Date().getTime();
        }
        this.setState({popupCustomer: popupCustomer});
        this.showPopup(AddCustomerPopupConstant.POPUP_TYPE_CUSTOMER);
    }

    /**
     * Click to customer in cart section
     *
     * @return {boolean}
     */
    clickCustomerCart() {
        if (this.props.currentPage !== ProductList.className) {
            return false;
        }
        if (this.props.quote.customer && this.props.quote.customer.id) {
            this.showCustomerPopup();
        } else {
            this.showPopup(AddCustomerPopupConstant.POPUP_TYPE_CUSTOMER_LIST);
        }
    }

    /**
     * Select customer
     *
     * @param customer
     */
    selectCustomer(customer) {
        this.setState({
            popupCustomer: customer || {},
            isOpenList: false
        });
        this.props.actions.setCustomer(customer);
    }

    /**
     * Get current customer name
     *
     * @return {string}
     */
    getCustomerName() {
        let customer = this.props.quote.customer;
        if (customer && customer.id) {
            return customer.firstname + " " + customer.lastname;
        }
        return this.props.t('Guest');
    }

    /**
     * Get current customer
     *
     * @return {string}
     */
    getRewardPointBalanceCustomer() {
        const {customer} = this.props.quote;
        const pointName         = RewardPointHelper.getPointName();
        const pluralOfPointName = RewardPointHelper.getPluralOfPointName();

        if (customer && customer.id && customer.point_balance) {
            return this.props.t('({{point}} {{pointLabel}})', {
                point     : customer.point_balance,
                pointLabel: customer.point_balance > 1
                    ? pluralOfPointName
                    : pointName
            });
        }
        return '';
    }

    /**
     * Check current customer is new
     *
     * @return {boolean}
     */
    isNewCustomer() {
        return !(this.props.quote.customer && this.props.quote.customer.id)
    }

    template() {
        const isEnabledRewardPoint = RewardPointHelper.isEnabledRewardPoint();

        return (
            <Fragment>
                <div className="customer-drop dropdown">
                    <a className="dropdown-toggle"
                       data-toggle="modal" data-target="#popup-drop-customer"
                       onClick={() => this.clickCustomerCart()}>
                        {this.getCustomerName()} &nbsp;
                        {
                            isEnabledRewardPoint ? this.getRewardPointBalanceCustomer() : ''
                        }
                    </a>
                    {
                        ((this.props.quote.customer && this.props.quote.customer.id) &&
                            this.props.currentPage === ProductList.className) ?
                            (
                                <a className="remove-user" onClick={() => this.selectCustomer()}>
                                    <span>remove</span>
                                </a>
                            ) :
                            ""
                    }
                </div>
                <Modal
                    bsSize={"sm"}
                    className={this.state.isOpenList ? "popup-drop-customer" : "popup-drop-customer hidden"}
                    backdropClassName={this.state.isOpenList ? "" : "hidden"}
                    dialogClassName={this.state.isOpenList ? "" : "hidden"}
                    show={true}
                    onHide={() => this.setState({isOpenList: false})}
                >
                    <ul className="dropdown-menu-customer">
                        <li>
                            <a className="toggle-create-customer"
                               onClick={() => this.showCustomerPopup()}
                            >
                                {this.props.t('Create Customer')}
                            </a>
                        </li>
                    </ul>
                    <CustomerList selectCustomer={(customer) => this.selectCustomer(customer)}
                                  isOpen={this.state.isOpenList}/>
                </Modal>
                <CustomerPopup isOpenCustomerPopup={this.state.isOpenCustomerPopup}
                               isOpenCustomerAddress={this.state.isOpenCustomerAddress}
                               showPopup={(type) => this.showPopup(type)}
                               customer={this.state.popupCustomer}
                               isNewCustomer={this.isNewCustomer()}/>
            </Fragment>
        );
    }
}

/**
 *
 * @type {CustomerButtonComponent}
 */
const component = ComponentFactory.get(CustomerButtonComponent);

export class CustomerButtonContainer extends CoreContainer {
    static className = 'CustomerButtonContainer';

    // This maps the state to the property of the component
    static mapState(state) {
        let quote = state.core.checkout.quote;
        let currentPage = state.core.checkout.index.currentPage;
        return {quote: quote, currentPage};
    }

    // This maps the dispatch to the property of the component
    static mapDispatch(dispatch) {
        return {
            actions: {
                setCustomer: customer => dispatch(QuoteAction.setCustomer(customer))
            }
        }
    }
}

/**
 *
 * @type {CustomerButtonContainer}
 */
const container = ContainerFactory.get(CustomerButtonContainer);

export default container.withRouter(component);