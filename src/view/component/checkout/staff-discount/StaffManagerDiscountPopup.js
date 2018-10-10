import React, {Fragment} from 'react';
import CoreComponent from "../../../../framework/component/CoreComponent";
import ComponentFactory from "../../../../framework/factory/ComponentFactory";
import ContainerFactory from "../../../../framework/factory/ContainerFactory";
import CoreContainer from "../../../../framework/container/CoreContainer";
import '../../../style/css/StaffDiscount.css';
import SmoothScrollbar from "smooth-scrollbar/index";
import {Modal} from "react-bootstrap";
import QuoteAction from "../../../action/checkout/QuoteAction";
import $ from "jquery";
import StaffDiscountService from "../../../../service/staff-discount/StaffDiscountService";
import CurrencyHelper from "../../../../helper/CurrencyHelper";
// import StaffDiscountGlobal from "../../../../service/staff-discount/StaffDiscountGlobal";
import StaffDiscountAction from "../../../action/staff-discount/StaffDiscountAction";

export class StaffManagerDiscountPopupComponent extends CoreComponent {
    static className = 'StaffManagerDiscountPopupComponent';
    setPopupStaffManagerDiscountElement = element => {
        this.popup_staff_manager_discount = element;
        if (!this.scrollbar && this.popup_staff_manager_discount) {
            this.scrollbar = SmoothScrollbar.init(this.popup_staff_manager_discount);
            this.heightPopup('.popup-staffmanagerdiscount .modal-dialog');
        }
    };

    /**
     * constructor
     * @param props
     */
    constructor(props) {
        super(props);
        this.state = {
            isOpenStaffManagerDiscountPopup: false,
            manager_discount: 0,
            max_min_manager_discount: {},
            discount_apply: 0,
            total_amount: 0,
            manager_discount_amount: 0
        }
    }

    /**
     * componentWillMount
     */
    componentWillMount() {
    }

    /**
     * This function after mapStateToProps then
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.setState({
            isOpenStaffManagerDiscountPopup: nextProps.isOpenStaffManagerDiscountPopup
        });
        let manager_discount_applied = nextProps.quote.staff_discount.manager_discount_applied;
        let total_amount = StaffDiscountService.getTotalAmountWhenApplyDiscount(nextProps.quote, manager_discount_applied);
        let manager_discount_amount = StaffDiscountService.getStaffDiscountAmountApply(nextProps.quote, manager_discount_applied);
        let manager_discount = parseFloat(StaffDiscountService.getConfigManagerDiscount());
        let max_min_manager_discount = StaffDiscountService.discountRangeForStaffDiscount(nextProps.quote, manager_discount);
        this.setState({
            manager_discount: manager_discount,
            max_min_manager_discount: max_min_manager_discount,
            discount_apply: manager_discount_amount,
            total_amount: total_amount,
            manager_discount_amount: manager_discount_amount
        })
    }

    /**
     * Show or hide popups
     *
     * @param {string} type
     */
    // showPopup(type) {
    //     this.setState({
    //     });
    // }

    /**
     * cancel popup
     */
    cancelPopup() {
        this.props.actions.resetCheckManagerPinCode();
        this.props.showPopup();
    }

    onChangeManagerDiscountPercent(event) {
        event.preventDefault();
        let manager_discount = event.target.value;
        if (isNaN(event.target.value) || !event.target.value) {
            manager_discount = 0;
        } else {
            if (parseFloat(event.target.value) < 0) {
                manager_discount = 0;
            }
            if (parseFloat(event.target.value) > parseFloat(this.state.manager_discount)) {
                manager_discount = parseFloat(this.state.manager_discount);
            }
        }

        this.refs.manager_discount_percent.value = parseFloat(manager_discount);
        let {quote} = this.props;
        let manager_discount_amount = StaffDiscountService.getStaffDiscountAmountApply(quote, manager_discount);
        let total_amount = StaffDiscountService.getTotalAmountWhenApplyDiscount(quote, manager_discount);
        this.setState({
            discount_apply:  manager_discount_amount,
            total_amount: total_amount
        });
        this.refs.manager_discount_amount.value = manager_discount_amount;
    }

    onChangeManagerDiscountAmount(event) {
        event.preventDefault();
        let {quote} = this.props;
        let manager_discount_amount = event.target.value;
        if (isNaN(event.target.value) || !event.target.value) {
            manager_discount_amount = this.state.max_min_manager_discount.min_discount;
        } else {
            if (parseFloat(event.target.value) < 0) {
                manager_discount_amount = this.state.max_min_manager_discount.min_discount;
            }
            if (parseFloat(event.target.value) > parseFloat(this.state.max_min_manager_discount.max_discount)) {
                manager_discount_amount = parseFloat(this.state.max_min_manager_discount.max_discount);
            }
        }
        this.refs.manager_discount_amount.value = parseFloat(manager_discount_amount);
        let manager_discount_percent = StaffDiscountService.getStaffDiscountPercentApply(quote, manager_discount_amount);
        let total_amount = StaffDiscountService.getTotalAmountWhenApplyDiscount(quote, manager_discount_percent);
        this.setState({
            discount_apply:  manager_discount_amount,
            total_amount: total_amount,
        });
        if (manager_discount_percent < 0) {
            manager_discount_percent = 0;
        }
        if (manager_discount_percent > this.state.manager_discount) {
            manager_discount_percent = this.state.manager_discount;
        }
        this.refs.manager_discount_percent.value = manager_discount_percent;
    }

    confirmPopup() {
        // event.preventDefault();
        let manager_discount = this.refs.manager_discount_percent.value;
        // StaffDiscountGlobal.manager_discount_applied = manager_discount;
        // StaffDiscountGlobal.staff_discount_applied = 0;
        let self = this;
        let {quote} = this.props;
        let items = quote.items;
        items.map(function (item) {
            let new_price = StaffDiscountService.getItemPriceAfterDiscount(item, manager_discount);
            if (new_price !== false) {
                self.props.actions.updateCustomPriceCartItem(item, new_price, 'Apply staff discount ' + manager_discount + '%' );
            }
        });
        quote.staff_discount.staff_discount_applied = 0;
        quote.staff_discount.manager_discount_applied = manager_discount;
        this.cancelPopup();
    }

    /**
     * get height popup
     * @param elm
     */
    heightPopup(elm) {
        var height = $(window).height();
        $(elm).css('height', height + 'px');
    }

    template() {
        let {quote} = this.props;
        if (!this.state.isOpenStaffManagerDiscountPopup) {
            if (this.popup_staff_manager_discount) {
                SmoothScrollbar.destroy(this.popup_staff_manager_discount);
                this.scrollbar = null;
            }
        }
        return (
            <Fragment>
                <Modal
                    bsSize={"lg"}
                    className={"popup-edit-customer popup-staffmanagerdiscount"}
                    dialogClassName={"popup-create-customer in"}
                    show={this.state.isOpenStaffManagerDiscountPopup}
                >
                    <div className="modal-header">
                        <div className="block-title">
                            {this.props.t('MANAGER')}
                        </div>
                    </div>
                    <div data-scrollbar ref={this.setPopupStaffManagerDiscountElement} className="modal-body">
                        <table className="ui celled table">
                            <tbody>
                            <tr className="percentage-discount">
                                <td className="block-title">{this.props.t('Discount')} 0% - {this.state.manager_discount}%</td>
                                <td className="block-content">
                                    <input
                                        id='manager_discount_percent'
                                        type="text"
                                        // value={this.state.manager_discount_percent}
                                        defaultValue={quote.staff_discount.manager_discount_applied}
                                        ref="manager_discount_percent"
                                        onChange={(event) => this.onChangeManagerDiscountPercent(event)}
                                    />
                                </td>
                            </tr>
                            <tr className="fix-discount">
                                <td className="block-title">{this.props.t('Discount')} {CurrencyHelper.format(this.state.max_min_manager_discount.min_discount) + ' - ' + CurrencyHelper.format(this.state.max_min_manager_discount.max_discount)}</td>
                                <td className="block-content">
                                    <input
                                        id='manager_discount_amount'
                                        type="text"
                                        defaultValue={this.state.manager_discount_amount}
                                        // value={this.state.max_min_manager_discount.min_discount}
                                        ref="manager_discount_amount"
                                        onChange={(event) => this.onChangeManagerDiscountAmount(event)}
                                    />
                                </td>
                            </tr>
                            <tr className="applied-discount">
                                <td className="block-title">
                                    {this.props.t('Discount Applied:')}
                                </td>
                                <td className="block-content">
                                    {CurrencyHelper.format(this.state.discount_apply)}
                                </td>
                            </tr>
                            <tr className="total">
                                <td className="block-title">{this.props.t('Total:')}</td>
                                <td className="block-content">
                                    {CurrencyHelper.format(this.state.total_amount)}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default-staffmanagerdiscount"
                                onClick={() => {
                                    this.cancelPopup()
                                }}
                        >
                            {this.props.t('Cancel')}
                        </button>
                        <button type="button" className="btn btn-default-staffmanagerdiscount"
                                onClick={() => {
                                    this.confirmPopup()
                                }}
                        >
                            {this.props.t('Confirm')}
                        </button>
                    </div>
                </Modal>
            </Fragment>
        )
    }
}

export class StaffManagerDiscountPopupContainer extends CoreContainer {
    static className = 'StaffManagerDiscountPopupContainer';

    /**
     *
     * @param state
     * @return {{quote: *}}
     */
    static mapState(state) {
        let {quote} = state.core.checkout;
        return {quote: quote};
    }

    static mapDispatch(dispatch) {
        return {
            actions: {
                setQuote: (quote) => dispatch(QuoteAction.setQuote(quote)),
                updateCustomPriceCartItem: (item, customPrice, reason) => dispatch(QuoteAction.updateCustomPriceCartItem(item, customPrice, reason)),
                resetCheckManagerPinCode: () => dispatch(StaffDiscountAction.resetCheckManagerPinCode())
            }
        }
    }
}

/**
 *
 * @type {StaffManagerDiscountPopupContainer}
 */
const container = ContainerFactory.get(StaffManagerDiscountPopupContainer);
export default container.getConnect(ComponentFactory.get(StaffManagerDiscountPopupComponent));